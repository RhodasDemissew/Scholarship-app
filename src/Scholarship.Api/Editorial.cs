using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Scholarship.Core;
using Scholarship.Infrastructure.Persistence;

namespace Scholarship.Api;
public static class Editorial
{
    public static IQueryable<OpportunityCycle> Full(ScholarshipDbContext db) => db.OpportunityCycles
        .Include(c=>c.Programme).ThenInclude(p=>p.Institution).Include(c=>c.FundingAward)
        .Include(c=>c.Deadlines).Include(c=>c.Funding).Include(c=>c.Evidence).AsSplitQuery();
    public static void Map(WebApplication app)
    {
        var group=app.MapGroup("/api/v1/editor/opportunities").RequireAuthorization("Editor");
        group.AddEndpointFilter(async (context, next) =>
        {
            try { return await next(context); }
            catch (CatalogueIdentityException e) { return Auth.Error(e.Message); }
        });
        group.MapGet("/", async (ScholarshipDbContext db) => Results.Ok(await db.OpportunityCycles.AsNoTracking().OrderByDescending(x=>x.LastReviewedAt).Select(x=>new { x.Id,x.Title,x.PublicationStatus,x.Version }).Take(100).ToListAsync()));
        group.MapGet("/{id:guid}", async (Guid id,ScholarshipDbContext db) => await Full(db).AsNoTracking().SingleOrDefaultAsync(x=>x.Id==id) is { } c ? Results.Ok(CatalogueContracts.View(c)) : Results.NotFound()).Produces<CatalogueView>();
        group.MapPost("/", async (DraftInput input,ScholarshipDbContext db,HttpContext context) =>
        {
            var error=CatalogueContracts.Validate(input); if(error!=null) return Auth.Error(error);
            var cycle=new OpportunityCycle { Id=Guid.NewGuid(),Title=input.Title,InstitutionName=input.InstitutionName,IntakeLabel=input.IntakeLabel };
            await Apply(db,cycle,input);
            db.OpportunityCycles.Add(cycle);
            Audit(db,cycle,context,"create",null,null);
            return await Save(db,cycle);
        }).Produces<CatalogueView>();
        group.MapPut("/{id:guid}", async (Guid id,UpdateInput input,ScholarshipDbContext db,HttpContext context) =>
        {
            var error=CatalogueContracts.Validate(input.Draft); if(error!=null) return Auth.Error(error);
            var cycle=await Full(db).SingleOrDefaultAsync(x=>x.Id==id);
            if(cycle==null) return Results.NotFound();
            if(cycle.Version!=input.Version) return Conflict();
            var old=CatalogueContracts.View(cycle);
            var previous=cycle.PublicationStatus;
            // Delete old dependent rows before adding replacements so unique-kind indexes remain valid.
            await using var transaction=await db.Database.BeginTransactionAsync();
            db.RemoveRange(cycle.Deadlines); db.RemoveRange(cycle.Funding); db.RemoveRange(cycle.Evidence);
            cycle.Deadlines.Clear(); cycle.Funding.Clear(); cycle.Evidence.Clear();
            cycle.Version=Guid.NewGuid(); cycle.PublicationStatus=PublicationStatus.Draft; cycle.LastReviewedAt=null;
            try { await db.SaveChangesAsync(); } catch(DbUpdateConcurrencyException) { return Conflict(); }
            await Apply(db,cycle,input.Draft);
            Audit(db,cycle,context,previous==PublicationStatus.Published?"correct":"edit",previous,old);
            var result=await Save(db,cycle);
            if(result is Microsoft.AspNetCore.Http.HttpResults.Ok<CatalogueView>) await transaction.CommitAsync();
            return result;
        }).Produces<CatalogueView>();
        group.MapPost("/{id:guid}/{action}", async (Guid id,string action,TransitionInput input,ScholarshipDbContext db,HttpContext context) =>
        {
            var c=await Full(db).SingleOrDefaultAsync(x=>x.Id==id); if(c==null) return Results.NotFound();
            if(c.Version!=input.Version) return Conflict();
            var before=c.PublicationStatus;
            var target=(action,before) switch {
                ("submit",PublicationStatus.Draft)=>PublicationStatus.InReview,
                ("review",PublicationStatus.InReview)=>PublicationStatus.Reviewed,
                ("publish",PublicationStatus.Reviewed)=>PublicationStatus.Published,
                ("archive",PublicationStatus.Published)=>PublicationStatus.Archived,
                _=>(PublicationStatus?)null
            };
            if(target==null) return Auth.Error("Invalid workflow transition. Draft → submit → review → publish; published → archive.");
            if(action is "review" or "publish")
            {
                var error=CatalogueContracts.ReviewError(c); if(error!=null) return Auth.Error(error);
            }
            if(action=="review")
            {
                c.LastReviewedAt=DateTimeOffset.UtcNow;
                foreach(var e in c.Evidence) { e.ReviewedAt=c.LastReviewedAt; e.ReviewerId=context.User.FindFirstValue(ClaimTypes.NameIdentifier); }
            }
            c.PublicationStatus=target.Value; c.Version=Guid.NewGuid();
            Audit(db,c,context,action,before,null);
            return await Save(db,c);
        }).Produces<CatalogueView>();
        group.MapGet("/{id:guid}/audit", async (Guid id,ScholarshipDbContext db) => Results.Ok(await db.AuditEvents.Where(x=>x.CycleId==id).OrderBy(x=>x.At).ToListAsync()));
    }
    private static string Key(string text)=>string.Join(" ",text.Trim().Split(' ',StringSplitOptions.RemoveEmptyEntries)).ToUpperInvariant();
    private static async Task Apply(ScholarshipDbContext db,OpportunityCycle c,DraftInput input)
    {
        var domain=input.Domain.Trim().ToLowerInvariant();
        var institution=await db.Institutions.SingleOrDefaultAsync(x=>x.Domain==domain);
        if(institution==null) { institution=new Institution {Id=Guid.NewGuid(),Domain=domain,Name=input.InstitutionName.Trim(),Country=input.Country.Trim()}; db.Institutions.Add(institution); }
        else if(institution.Name!=input.InstitutionName.Trim() || institution.Country!=input.Country.Trim()) throw new CatalogueIdentityException("This institution domain already has a different name or country. Reuse its existing identity; shared institution changes need a separate reviewed update.");
        var programmeKey=Key(input.ProgrammeName);
        var programme=await db.Programmes.SingleOrDefaultAsync(x=>x.InstitutionId==institution.Id && x.Key==programmeKey);
        if(programme==null) { programme=new Programme {Id=Guid.NewGuid(),Institution=institution,InstitutionId=institution.Id,Key=programmeKey,Name=input.ProgrammeName.Trim(),OfficialUrl=input.ProgrammeUrl.Trim()}; db.Programmes.Add(programme); }
        else if(programme.OfficialUrl!=input.ProgrammeUrl.Trim()) throw new CatalogueIdentityException("This programme already has a different official URL. Reuse the existing shared identity.");
        FundingAward? award=null;
        if(!string.IsNullOrWhiteSpace(input.AwardName))
        {
            var awardKey=Key(input.Sponsor!+"|"+input.AwardName);
            award=await db.FundingAwards.SingleOrDefaultAsync(x=>x.Key==awardKey);
            if(award==null) {award=new FundingAward {Id=Guid.NewGuid(),Key=awardKey,Name=input.AwardName.Trim(),Sponsor=input.Sponsor!.Trim(),OfficialUrl=input.AwardUrl!.Trim()}; db.FundingAwards.Add(award);}
            else if(award.OfficialUrl!=input.AwardUrl!.Trim()) throw new CatalogueIdentityException("This award already has a different official URL. Reuse the existing shared identity.");
        }
        c.Programme=programme;c.ProgrammeId=programme.Id;c.FundingAward=award;c.FundingAwardId=award?.Id;
        c.Title=input.Title.Trim();c.InstitutionName=institution.Name;c.IntakeLabel=input.IntakeLabel.Trim().ToLowerInvariant();c.Round=input.Round.Trim().ToLowerInvariant();
        c.IsFictional=input.IsFictional;c.ApplicationStatus=input.ApplicationStatus;
        foreach(var d in input.Deadlines) {var item=CatalogueContracts.Deadline(d);DeadlineRules.Resolve(item);c.Deadlines.Add(item);}
        foreach(var kind in Enum.GetValues<FundingKind>())
        {
            var f=input.Funding.SingleOrDefault(x=>x.Kind==kind);
            c.Funding.Add(new FundingComponent {Id=Guid.NewGuid(),Kind=kind,Coverage=f?.Coverage??Coverage.Unknown,Amount=f?.Amount,Currency=f?.Currency?.ToUpperInvariant(),Conditions=f?.Conditions});
        }
        foreach(var e in input.Evidence) c.Evidence.Add(new FieldEvidence {Id=Guid.NewGuid(),Field=e.Field,SourceUrl=e.SourceUrl.Trim(),Excerpt=e.Excerpt.Trim()});
        db.AddRange(c.Deadlines); db.AddRange(c.Funding); db.AddRange(c.Evidence);
    }
    private static void Audit(ScholarshipDbContext db,OpportunityCycle c,HttpContext context,string action,PublicationStatus? previous,CatalogueView? old)
    {
        var changed=old==null?new[]{"publicationStatus"}:JsonSerializer.SerializeToElement(old.Draft).EnumerateObject()
            .Where(p=>p.Value.GetRawText()!=JsonSerializer.SerializeToElement(CatalogueContracts.View(c).Draft).GetProperty(p.Name).GetRawText()).Select(p=>p.Name).ToArray();
        db.AuditEvents.Add(new AuditEvent {Id=Guid.NewGuid(),CycleId=c.Id,ActorId=context.User.FindFirstValue(ClaimTypes.NameIdentifier)!,Action=action,Version=c.Version,PreviousStatus=previous?.ToString(),NewStatus=c.PublicationStatus.ToString(),ChangedFields=string.Join(",",changed),At=DateTimeOffset.UtcNow});
    }
    private static async Task<IResult> Save(ScholarshipDbContext db,OpportunityCycle cycle)
    {
        try {await db.SaveChangesAsync();return TypedResults.Ok(CatalogueContracts.View(cycle));}
        catch(DbUpdateConcurrencyException) {return Conflict();}
        catch(DbUpdateException e) when(e.InnerException is PostgresException {SqlState:"23505"}) {return Results.Problem(statusCode:409,title:"This programme/award/intake/round already exists, or another editor created its identity. Reload and try again.");}
    }
    public static IResult Conflict()=>Results.Problem(statusCode:409,title:"Another editor changed this record. Reload before saving.");
}
public sealed class CatalogueIdentityException(string message) : Exception(message);


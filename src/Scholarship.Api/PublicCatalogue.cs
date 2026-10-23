using Microsoft.EntityFrameworkCore;
using Scholarship.Core;
using Scholarship.Infrastructure.Persistence;
namespace Scholarship.Api;
public sealed record OpportunitySummary(Guid Id,string Title,string InstitutionName,string Country,string IntakeLabel,bool IsFictional,ApplicationStatus ApplicationStatus,DateTimeOffset? LastReviewedAt,Coverage Tuition,Coverage Stipend);
public sealed record CataloguePage(OpportunitySummary[] Items,int Total,int Page,int PageSize);
public sealed record CatalogueFilters(string[] Countries,string[] Intakes);
public static class PublicCatalogue
{
 public static void Map(WebApplication app)
 {
  app.MapGet("/api/v1/opportunities/filters",async(ScholarshipDbContext db)=>
  {
   var query=db.OpportunityCycles.AsNoTracking().Where(x=>x.PublicationStatus==PublicationStatus.Published && !x.IsFictional);
   return TypedResults.Ok(new CatalogueFilters(await query.Select(x=>x.Programme.Institution.Country).Distinct().OrderBy(x=>x).ToArrayAsync(),await query.Select(x=>x.IntakeLabel).Distinct().OrderBy(x=>x).ToArrayAsync()));
  });
  app.MapGet("/api/v1/opportunities",async (ScholarshipDbContext db,string? q,string? country,string? intake,ApplicationStatus? status,Coverage? tuition,bool? fictional,int? page,int? pageSize,CancellationToken ct)=>
  {
   var number=page??1;var size=pageSize??12;
   if(number<1 || number>10000 || size<1 || size>100 || q?.Length>80 || country?.Length>80 || intake?.Length>80 ||
     (status!=null && !Enum.IsDefined(status.Value)) || (tuition!=null && !Enum.IsDefined(tuition.Value))) return Auth.Error("Invalid filter or pagination. Page size must be 1–100; text filters at most 80 characters.");
   var query=db.OpportunityCycles.AsNoTracking().Where(x=>x.PublicationStatus==PublicationStatus.Published && x.IsFictional==(fictional??false));
   if(!string.IsNullOrWhiteSpace(q)) {var search=q.Trim().ToLower();query=query.Where(x=>x.Title.ToLower().Contains(search)||x.InstitutionName.ToLower().Contains(search));}
   if(!string.IsNullOrWhiteSpace(country)) query=query.Where(x=>x.Programme.Institution.Country==country);
   if(!string.IsNullOrWhiteSpace(intake)) query=query.Where(x=>x.IntakeLabel==intake);
   if(status!=null) query=query.Where(x=>x.ApplicationStatus==status);
   if(tuition!=null) query=tuition==Coverage.Unknown ? query.Where(x=>!x.Funding.Any(f=>f.Kind==FundingKind.Tuition && f.Coverage!=Coverage.Unknown)) : query.Where(x=>x.Funding.Any(f=>f.Kind==FundingKind.Tuition && f.Coverage==tuition));
   var total=await query.CountAsync(ct);
   var items=await query.OrderBy(x=>x.Title).ThenBy(x=>x.Id).Skip((number-1)*size).Take(size).Select(x=>new OpportunitySummary(x.Id,x.Title,x.InstitutionName,x.Programme.Institution.Country,x.IntakeLabel,x.IsFictional,x.ApplicationStatus,x.LastReviewedAt,
    x.Funding.Where(f=>f.Kind==FundingKind.Tuition).Select(f=>f.Coverage).FirstOrDefault(),
    x.Funding.Where(f=>f.Kind==FundingKind.Stipend).Select(f=>f.Coverage).FirstOrDefault())).ToArrayAsync(ct);
   return Results.Ok(new CataloguePage(items,total,number,size));
  }).Produces<CataloguePage>().WithName("ListOpportunities");
  app.MapGet("/api/v1/opportunities/{id:guid}",async(Guid id,ScholarshipDbContext db,CancellationToken ct)=>
  {
   var c=await Editorial.Full(db).AsNoTracking().SingleOrDefaultAsync(x=>x.Id==id && x.PublicationStatus==PublicationStatus.Published,ct);
   return c==null?Results.NotFound():Results.Ok(CatalogueContracts.View(c));
  }).Produces<CatalogueView>().WithName("OpportunityDetail");
 }
}


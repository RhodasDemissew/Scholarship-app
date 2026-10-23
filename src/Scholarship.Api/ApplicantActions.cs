using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Scholarship.Core;
using Scholarship.Infrastructure.Persistence;
namespace Scholarship.Api;
public sealed record SavedView(Guid Id,string Title,bool Available,DateTimeOffset SavedAt);
public sealed record ReportInput(string Message);
public static class ApplicantActions
{
 public static void Map(WebApplication app)
 {
  var group=app.MapGroup("/api/v1/me").RequireAuthorization();
  group.MapGet("/saved",async(HttpContext context,ScholarshipDbContext db)=>
  {
   var owner=context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
   return TypedResults.Ok(await db.SavedOpportunities.Where(x=>x.UserId==owner).OrderByDescending(x=>x.SavedAt).Select(x=>new SavedView(x.CycleId,x.Cycle.PublicationStatus==PublicationStatus.Published?x.Cycle.Title:"Unavailable opportunity",x.Cycle.PublicationStatus==PublicationStatus.Published,x.SavedAt)).ToArrayAsync());
  });
  group.MapPut("/saved/{id:guid}",async(Guid id,HttpContext context,ScholarshipDbContext db)=>
  {
   if(!await db.OpportunityCycles.AnyAsync(x=>x.Id==id && x.PublicationStatus==PublicationStatus.Published && !x.IsFictional)) return Results.NotFound();
   var owner=context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;var now=DateTimeOffset.UtcNow;
   await db.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO "SavedOpportunities" ("UserId","CycleId","SavedAt") VALUES ({owner},{id},{now}) ON CONFLICT ("UserId","CycleId") DO NOTHING""");
   return Results.NoContent();
  });
  group.MapDelete("/saved/{id:guid}",async(Guid id,HttpContext context,ScholarshipDbContext db)=>
  {
   var owner=context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
   await db.SavedOpportunities.Where(x=>x.UserId==owner && x.CycleId==id).ExecuteDeleteAsync();
   return Results.NoContent();
  });
  group.MapPost("/reports/{id:guid}",async(Guid id,ReportInput input,HttpContext context,ScholarshipDbContext db)=>
  {
   if(!CatalogueContracts.Text(input.Message,1000)) return Auth.Error("Describe the issue in 1–1000 characters.");
   if(!await db.OpportunityCycles.AnyAsync(x=>x.Id==id && x.PublicationStatus==PublicationStatus.Published && !x.IsFictional)) return Results.NotFound();
   var owner=context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
   var since=DateTimeOffset.UtcNow.AddDays(-1);
   if(await db.InformationReports.CountAsync(x=>x.UserId==owner && x.CreatedAt>since)>=20) return Results.Problem(statusCode:429,title:"Daily report limit reached. Please try tomorrow.");
   var report=new InformationReport {Id=Guid.NewGuid(),CycleId=id,UserId=owner,Message=input.Message.Trim(),CreatedAt=DateTimeOffset.UtcNow};
   db.InformationReports.Add(report);await db.SaveChangesAsync();
   return Results.Ok(new {report.Id,message="Report received. An editor can review the source."});
  });
  app.MapGet("/api/v1/editor/reports",async(ScholarshipDbContext db)=>Results.Ok(await db.InformationReports.OrderByDescending(x=>x.CreatedAt).Select(x=>new {x.Id,x.CycleId,Title=x.Cycle.Title,x.Message,x.CreatedAt}).Take(100).ToArrayAsync())).RequireAuthorization("Editor");
 }
}


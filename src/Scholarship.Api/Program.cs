using Microsoft.EntityFrameworkCore;
using Scholarship.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddDbContext<ScholarshipDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("ScholarshipDb"),
        npgsql => npgsql.MigrationsAssembly(typeof(ScholarshipDbContext).Assembly.FullName)));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Scholarship API v1"));
}

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/v1/opportunities", async (ScholarshipDbContext db, CancellationToken cancellationToken) =>
{
    var opportunities = await db.OpportunityCycles
        .AsNoTracking()
        .OrderBy(cycle => cycle.Title)
        .Select(cycle => new OpportunityResponse(
            cycle.Id,
            cycle.Title,
            cycle.InstitutionName,
            cycle.IntakeLabel,
            cycle.IsFictional))
        .ToListAsync(cancellationToken);

    return TypedResults.Ok(opportunities);
}).WithName("ListOpportunities");

app.Run();

internal sealed record OpportunityResponse(
    Guid Id,
    string Title,
    string InstitutionName,
    string IntakeLabel,
    bool IsFictional);

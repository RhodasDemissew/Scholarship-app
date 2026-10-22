using Microsoft.EntityFrameworkCore;
using Scholarship.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ScholarshipDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("ScholarshipDb"),
        npgsql => npgsql.MigrationsAssembly(typeof(ScholarshipDbContext).Assembly.FullName)));

var app = builder.Build();

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

    return Results.Ok(opportunities);
});

app.Run();

internal sealed record OpportunityResponse(
    Guid Id,
    string Title,
    string InstitutionName,
    string IntakeLabel,
    bool IsFictional);

using Microsoft.EntityFrameworkCore;
using Scholarship.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ScholarshipDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("ScholarshipDb"),
        npgsql => npgsql.MigrationsAssembly(typeof(ScholarshipDbContext).Assembly.FullName)));

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();

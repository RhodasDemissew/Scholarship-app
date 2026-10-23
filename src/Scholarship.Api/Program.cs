using Microsoft.EntityFrameworkCore;
using Scholarship.Infrastructure.Persistence;
using Scholarship.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(allowIntegerValues: false));
    options.SerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.Strict;
});
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 128 * 1024);
Auth.Configure(builder);
Security.Configure(builder);
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<ScholarshipDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("ScholarshipDb"),
        npgsql => npgsql.MigrationsAssembly(typeof(ScholarshipDbContext).Assembly.FullName)));

var app = builder.Build();
app.UseExceptionHandler();
Auth.Map(app);
Security.Map(app);
Editorial.Map(app);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Scholarship API v1"));
}

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

PublicCatalogue.Map(app);

if (await Security.Initialize(app, args)) return;
app.Run();



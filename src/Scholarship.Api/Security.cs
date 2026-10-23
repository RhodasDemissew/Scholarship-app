using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;

namespace Scholarship.Api;
public sealed record CodeRequest(string Code);
public static class Security
{
    public static void Configure(WebApplicationBuilder builder)
    {
        var path = Path.GetFullPath(builder.Configuration["Security:KeyPath"] ?? Path.Combine(builder.Environment.ContentRootPath, ".local", "keys"));
        Directory.CreateDirectory(path);
        var protection = builder.Services.AddDataProtection().SetApplicationName("ScholarshipAssistant").PersistKeysToFileSystem(new DirectoryInfo(path));
        if (builder.Environment.IsDevelopment() && OperatingSystem.IsWindows()) protection.ProtectKeysWithDpapi();
        else
        {
            var certificate = builder.Configuration["Security:CertificatePath"];
            if (string.IsNullOrEmpty(certificate)) throw new InvalidOperationException("Set Security:CertificatePath and Security:CertificatePassword for encrypted persistent keys.");
            protection.ProtectKeysWithCertificate(X509CertificateLoader.LoadPkcs12FromFile(certificate, builder.Configuration["Security:CertificatePassword"]));
        }
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("Editor", policy => policy.RequireRole("Editor", "Administrator").RequireClaim("amr", "mfa"));
            options.AddPolicy("Administrator", policy => policy.RequireRole("Administrator").RequireClaim("amr", "mfa"));
        });
        builder.Services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = 429;
            options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
                (context.Connection.RemoteIpAddress?.ToString() ?? "unknown") + context.Request.Path,
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
        });
    }
    public static async Task<bool> Initialize(WebApplication app, string[] args)
    {
        using var scope = app.Services.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var name in new[] { "Applicant", "Editor", "Administrator" })
            if (!await roles.RoleExistsAsync(name)) await roles.CreateAsync(new IdentityRole(name));
        if (args.Length == 3 && args[0] == "--grant-role")
        {
            if (args[2] is not ("Applicant" or "Editor" or "Administrator")) throw new InvalidOperationException("Unknown role.");
            var users = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var user = await users.FindByEmailAsync(args[1]) ?? throw new InvalidOperationException("Register and verify this account first.");
            if (!user.EmailConfirmed) throw new InvalidOperationException("Verify this account first.");
            var result = await users.AddToRoleAsync(user, args[2]);
            if (!result.Succeeded) throw new InvalidOperationException("Role assignment failed.");
            await users.UpdateSecurityStampAsync(user);
            Console.WriteLine("Role assigned. Sign in again and enable MFA for privileged access.");
            return true;
        }
        return false;
    }
    public static void Map(WebApplication app)
    {
        app.UseRateLimiter();
        var group = app.MapGroup("/api/v1/auth").RequireRateLimiting("auth");
        group.MapPost("/two-factor", async (CodeRequest input, SignInManager<IdentityUser> signIn) =>
        {
            var result = await signIn.TwoFactorAuthenticatorSignInAsync(input.Code.Replace(" ", ""), false, false);
            return result.Succeeded ? Results.Ok() : Results.Problem(statusCode: 401, title: "Invalid code or locked account.");
        });
        group.MapPost("/mfa/setup", async (HttpContext context, UserManager<IdentityUser> users, SignInManager<IdentityUser> signIn) =>
        {
            var user = (await users.GetUserAsync(context.User))!;
            if (user.TwoFactorEnabled) return Auth.Error("MFA is already enabled.");
            var key = await users.GetAuthenticatorKeyAsync(user);
            if (string.IsNullOrEmpty(key)) { await users.ResetAuthenticatorKeyAsync(user); key = await users.GetAuthenticatorKeyAsync(user); }
            await signIn.RefreshSignInAsync(user);
            return Results.Ok(new { key, issuer = "Scholarship Assistant", account = user.Email });
        }).RequireAuthorization();
        group.MapPost("/mfa/enable", async (CodeRequest input, HttpContext context, UserManager<IdentityUser> users, SignInManager<IdentityUser> signIn) =>
        {
            var user = (await users.GetUserAsync(context.User))!;
            if (await users.IsLockedOutAsync(user)) return Results.Unauthorized();
            if (!await users.VerifyTwoFactorTokenAsync(user, users.Options.Tokens.AuthenticatorTokenProvider, input.Code.Replace(" ", "")))
            {
                await users.AccessFailedAsync(user);
                return Auth.Error("Invalid authenticator code.");
            }
            await users.ResetAccessFailedCountAsync(user);
            await users.SetTwoFactorEnabledAsync(user, true);
            await users.UpdateSecurityStampAsync(user);
            await signIn.SignInWithClaimsAsync(user, false, new[] { new Claim("amr", "mfa") });
            return Results.Ok(new { message = "Authenticator enabled. Future sign-ins require a code." });
        }).RequireAuthorization();
        app.MapGet("/api/v1/editor/access", () => Results.Ok()).RequireAuthorization("Editor");
        app.MapGet("/api/v1/admin/access", () => Results.Ok()).RequireAuthorization("Administrator");
    }
}


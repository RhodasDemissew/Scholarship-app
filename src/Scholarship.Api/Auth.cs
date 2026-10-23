using System.Net.Mail;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scholarship.Infrastructure.Persistence;

namespace Scholarship.Api;

public sealed record Credentials(string Email, string Password);
public sealed record EmailRequest(string Email);
public sealed record TokenRequest(string Email, string Token);
public sealed record ResetRequest(string Email, string Token, string Password);
public sealed record SessionResponse(bool Authenticated, string? Email, string[] Roles);

public sealed class LocalMail(IWebHostEnvironment environment, IConfiguration configuration)
{
    public async Task Send(string email, string route, string token)
    {
        if (!environment.IsDevelopment()) throw new InvalidOperationException("Live mail is not configured. Use Development and Mailpit.");
        var origin = configuration["App:Origin"] ?? "http://127.0.0.1:5173";
        var link = $"{origin}/{route}?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";
        using var message = new MailMessage("accounts@scholarship.test", email, "Scholarship Assistant - " + route,
            $"Open this local link to {route}:\n{link}\nIf you did not request this, ignore this email.");
        using var smtp = new SmtpClient("127.0.0.1", 1025);
        await smtp.SendMailAsync(message);
    }
}

public static class Auth
{
    public static void Configure(WebApplicationBuilder builder)
    {
        builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
        {
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedEmail = true;
            options.Password.RequiredLength = 12;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        }).AddEntityFrameworkStores<ScholarshipDbContext>().AddDefaultTokenProviders();
        builder.Services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "scholarship.session";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
            options.ExpireTimeSpan = TimeSpan.FromHours(8);
            options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; };
            options.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = 403; return Task.CompletedTask; };
        });
        builder.Services.Configure<SecurityStampValidatorOptions>(options =>
        {
            options.ValidationInterval = TimeSpan.Zero;
            options.OnRefreshingPrincipal = context =>
            {
                if (context.CurrentPrincipal?.HasClaim("amr", "mfa") == true && context.NewPrincipal?.Identity is System.Security.Claims.ClaimsIdentity identity)
                    identity.AddClaim(new("amr", "mfa"));
                return Task.CompletedTask;
            };
        });
        builder.Services.Configure<DataProtectionTokenProviderOptions>(options => options.TokenLifespan = TimeSpan.FromHours(1));
        builder.Services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-CSRF-TOKEN";
            options.Cookie.Name = "scholarship.csrf";
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
        });
        builder.Services.AddScoped<LocalMail>();
        builder.Services.AddAuthorization();
    }

    public static void Map(WebApplication app)
    {
        app.UseAuthentication();
        app.UseAuthorization();
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.Headers.CacheControl = "no-store";
                if (!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method) && !HttpMethods.IsOptions(context.Request.Method))
                {
                    try { await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context); }
                    catch (AntiforgeryValidationException)
                    {
                        await Results.Problem(statusCode: 400, title: "Invalid CSRF token. Refresh and try again.").ExecuteAsync(context);
                        return;
                    }
                }
            }
            await next();
        });
        var group = app.MapGroup("/api/v1/auth");
        group.MapGet("/csrf", (HttpContext context, IAntiforgery antiforgery) =>
            TypedResults.Ok(new { token = antiforgery.GetAndStoreTokens(context).RequestToken })).DisableRateLimiting();
        group.MapGet("/session", async (HttpContext context, UserManager<IdentityUser> users) =>
        {
            var user = await users.GetUserAsync(context.User);
            return TypedResults.Ok(new SessionResponse(user != null, user?.Email,
                user == null ? [] : (await users.GetRolesAsync(user)).ToArray()));
        });
        group.MapPost("/register", async (Credentials input, UserManager<IdentityUser> users, LocalMail mail) =>
        {
            if (!ValidEmail(input.Email) || input.Password.Length > 128) return Error("Enter a valid email and a password of 12–128 characters.");
            var existing = await users.FindByEmailAsync(input.Email);
            if (existing == null)
            {
                var user = new IdentityUser { UserName = input.Email.Trim(), Email = input.Email.Trim() };
                var result = await users.CreateAsync(user, input.Password);
                if (!result.Succeeded) return Error(string.Join(" ", result.Errors.Select(e => e.Description)));
                await users.AddToRoleAsync(user, "Applicant");
                await mail.Send(user.Email, "verify", await users.GenerateEmailConfirmationTokenAsync(user));
            }
            return Results.Ok(new { message = "If the address can be registered, check your email to verify it." });
        });
        group.MapPost("/resend", async (EmailRequest input, UserManager<IdentityUser> users, LocalMail mail) =>
        {
            var user = await users.FindByEmailAsync(input.Email);
            if (user != null && !user.EmailConfirmed) await mail.Send(user.Email!, "verify", await users.GenerateEmailConfirmationTokenAsync(user));
            return Results.Ok(new { message = "If verification is needed, an email has been sent." });
        });
        group.MapPost("/verify", async (TokenRequest input, UserManager<IdentityUser> users) =>
        {
            var user = await users.FindByEmailAsync(input.Email);
            if (user == null || !(await users.ConfirmEmailAsync(user, input.Token)).Succeeded) return Error("Invalid or expired verification link.");
            return Results.Ok(new { message = "Email verified. You can now sign in." });
        });
        group.MapPost("/login", async (Credentials input, SignInManager<IdentityUser> signIn) =>
        {
            if (!ValidEmail(input.Email) || input.Password.Length > 128) return Results.Unauthorized();
            var result = await signIn.PasswordSignInAsync(input.Email, input.Password, false, true);
            if (result.RequiresTwoFactor) return Results.Ok(new { requiresTwoFactor = true });
            return result.Succeeded ? Results.Ok(new { requiresTwoFactor = false }) : Results.Problem(statusCode: 401, title: "Sign-in failed. Check your credentials and verify your email; repeated failures temporarily lock the account.");
        });
        group.MapPost("/logout", async (SignInManager<IdentityUser> signIn) => { await signIn.SignOutAsync(); return Results.NoContent(); });
        group.MapPost("/forgot", async (EmailRequest input, UserManager<IdentityUser> users, LocalMail mail) =>
        {
            var user = await users.FindByEmailAsync(input.Email);
            if (user?.EmailConfirmed == true) await mail.Send(user.Email!, "reset", await users.GeneratePasswordResetTokenAsync(user));
            return Results.Ok(new { message = "If the account is verified, a reset link has been sent." });
        });
        group.MapPost("/reset", async (ResetRequest input, UserManager<IdentityUser> users) =>
        {
            var user = await users.FindByEmailAsync(input.Email);
            if (user == null || input.Password.Length > 128) return Error("Invalid reset request.");
            var result = await users.ResetPasswordAsync(user, input.Token, input.Password);
            return result.Succeeded ? Results.Ok(new { message = "Password updated. Sign in with your new password." }) : Error("Invalid/expired link or password does not meet the requirements.");
        });

        group.RequireRateLimiting("auth");
    }
    private static bool ValidEmail(string email) => email.Length <= 254 && new EmailAddressAttribute().IsValid(email);
    public static IResult Error(string message) => Results.Problem(statusCode: 400, title: message);
}




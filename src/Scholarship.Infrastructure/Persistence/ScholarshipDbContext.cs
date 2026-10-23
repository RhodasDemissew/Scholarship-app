using Microsoft.EntityFrameworkCore;
using Scholarship.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Scholarship.Infrastructure.Persistence;

public sealed class ScholarshipDbContext(DbContextOptions<ScholarshipDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<OpportunityCycle> OpportunityCycles => Set<OpportunityCycle>();
    public DbSet<Institution> Institutions => Set<Institution>();
    public DbSet<Programme> Programmes => Set<Programme>();
    public DbSet<FundingAward> FundingAwards => Set<FundingAward>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<SavedOpportunity> SavedOpportunities => Set<SavedOpportunity>();
    public DbSet<InformationReport> InformationReports => Set<InformationReport>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<SavedOpportunity>().HasKey(x => new { x.UserId, x.CycleId });
        modelBuilder.Entity<SavedOpportunity>().HasOne(x => x.Cycle).WithMany().HasForeignKey(x => x.CycleId);
        modelBuilder.Entity<SavedOpportunity>().HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.UserId);
        modelBuilder.Entity<InformationReport>().HasOne(x => x.Cycle).WithMany().HasForeignKey(x => x.CycleId);
        modelBuilder.Entity<InformationReport>().HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.UserId);
        modelBuilder.Entity<InformationReport>().Property(x => x.Message).HasMaxLength(1000);
        modelBuilder.Entity<InformationReport>().HasIndex(x => new { x.UserId, x.CreatedAt });
        modelBuilder.Entity<AuditEvent>().HasIndex(x => new { x.CycleId, x.At });
        var deadline = modelBuilder.Entity<Deadline>();
        deadline.HasIndex(x => new { x.OpportunityCycleId, x.Kind }).IsUnique();
        deadline.Property(x => x.Kind).HasConversion<string>();
        deadline.Property(x => x.Precision).HasConversion<string>();
        deadline.Property(x => x.OriginalText).HasMaxLength(2000);
        deadline.Property(x => x.TimeZone).HasMaxLength(100);
        deadline.Property(x => x.Version).IsConcurrencyToken();
        var funding = modelBuilder.Entity<FundingComponent>();
        funding.HasIndex(x => new { x.OpportunityCycleId, x.Kind }).IsUnique();
        funding.Property(x => x.Kind).HasConversion<string>();
        funding.Property(x => x.Coverage).HasConversion<string>();
        funding.Property(x => x.Amount).HasPrecision(18, 2);
        funding.Property(x => x.Currency).HasMaxLength(3);
        funding.Property(x => x.Conditions).HasMaxLength(2000);
        var evidence = modelBuilder.Entity<FieldEvidence>();
        evidence.Property(x => x.Field).HasMaxLength(80);
        evidence.Property(x => x.SourceUrl).HasMaxLength(2000);
        evidence.Property(x => x.Excerpt).HasMaxLength(2000);
        evidence.HasIndex(x => new { x.OpportunityCycleId, x.Field });
        var institution = modelBuilder.Entity<Institution>();
        institution.HasIndex(x => x.Domain).IsUnique();
        institution.Property(x => x.Domain).HasMaxLength(253);
        institution.Property(x => x.Name).HasMaxLength(200);
        institution.Property(x => x.Country).HasMaxLength(80);
        var programme = modelBuilder.Entity<Programme>();
        programme.HasIndex(x => new { x.InstitutionId, x.Key }).IsUnique();
        programme.Property(x => x.Key).HasMaxLength(200);
        programme.Property(x => x.Name).HasMaxLength(200);
        programme.Property(x => x.OfficialUrl).HasMaxLength(2000);
        programme.HasOne(x => x.Institution).WithMany().OnDelete(DeleteBehavior.Restrict);
        var award = modelBuilder.Entity<FundingAward>();
        award.HasIndex(x => x.Key).IsUnique();
        award.Property(x => x.Key).HasMaxLength(300);
        award.Property(x => x.Name).HasMaxLength(200);
        award.Property(x => x.Sponsor).HasMaxLength(200);
        award.Property(x => x.OfficialUrl).HasMaxLength(2000);
        var cycle = modelBuilder.Entity<OpportunityCycle>();
        cycle.ToTable("OpportunityCycles");
        cycle.HasKey(item => item.Id);
        cycle.Property(item => item.Title).HasMaxLength(200).IsRequired();
        cycle.Property(item => item.InstitutionName).HasMaxLength(200).IsRequired();
        cycle.Property(item => item.IntakeLabel).HasMaxLength(80).IsRequired();
        cycle.Property(item => item.IsFictional).IsRequired();
        cycle.Property(x => x.Round).HasMaxLength(80);
        cycle.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);
        cycle.Property(x => x.ApplicationStatus).HasConversion<string>().HasMaxLength(20);
        cycle.Property(x => x.Version).IsConcurrencyToken();
        cycle.HasOne(x => x.Programme).WithMany().OnDelete(DeleteBehavior.Restrict);
        cycle.HasOne(x => x.FundingAward).WithMany().OnDelete(DeleteBehavior.Restrict);
        cycle.HasIndex(x => new { x.ProgrammeId, x.FundingAwardId, x.IntakeLabel, x.Round }).IsUnique().AreNullsDistinct(false);
        cycle.HasIndex(x => new { x.PublicationStatus, x.IntakeLabel });
        institution.HasData(new Institution { Id = Guid.Parse("e40f60a3-e248-4498-a532-dfcdf56bd001"), Name = "Fictional Example University", Domain = "example.invalid", Country = "Fictional country" });
        programme.HasData(new Programme { Id = Guid.Parse("e40f60a3-e248-4498-a532-dfcdf56bd002"), InstitutionId = Guid.Parse("e40f60a3-e248-4498-a532-dfcdf56bd001"), Name = "Example Master's Programme", Key = "EXAMPLE MASTERS", OfficialUrl = "https://example.invalid" });

        cycle.HasData(new OpportunityCycle
        {
            Id = Guid.Parse("c950dff5-741a-4946-a266-7f532a613027"),
            Title = "Example Master's Scholarship",
            InstitutionName = "Fictional Example University",
            IntakeLabel = "2027 intake",
            IsFictional = true,
            ProgrammeId = Guid.Parse("e40f60a3-e248-4498-a532-dfcdf56bd002"),
            PublicationStatus = PublicationStatus.Published,
            Version = Guid.Parse("e40f60a3-e248-4498-a532-dfcdf56bd003")
        });
    }
}

using Microsoft.EntityFrameworkCore;
using Scholarship.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Scholarship.Infrastructure.Persistence;

public sealed class ScholarshipDbContext(DbContextOptions<ScholarshipDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<OpportunityCycle> OpportunityCycles => Set<OpportunityCycle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        var cycle = modelBuilder.Entity<OpportunityCycle>();
        cycle.ToTable("OpportunityCycles");
        cycle.HasKey(item => item.Id);
        cycle.Property(item => item.Title).HasMaxLength(200).IsRequired();
        cycle.Property(item => item.InstitutionName).HasMaxLength(200).IsRequired();
        cycle.Property(item => item.IntakeLabel).HasMaxLength(80).IsRequired();
        cycle.Property(item => item.IsFictional).IsRequired();

        cycle.HasData(new OpportunityCycle
        {
            Id = Guid.Parse("c950dff5-741a-4946-a266-7f532a613027"),
            Title = "Example Master's Scholarship",
            InstitutionName = "Fictional Example University",
            IntakeLabel = "2027 intake",
            IsFictional = true
        });
    }
}

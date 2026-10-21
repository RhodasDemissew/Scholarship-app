using Microsoft.EntityFrameworkCore;

namespace Scholarship.Infrastructure.Persistence;

public sealed class ScholarshipDbContext(DbContextOptions<ScholarshipDbContext> options) : DbContext(options)
{
    // Tables are added with their feature tasks. F02 establishes migration plumbing.
}

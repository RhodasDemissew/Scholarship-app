namespace Scholarship.Core;

public enum PublicationStatus { Draft, InReview, Reviewed, Published, Archived }
public enum ApplicationStatus { Unknown, Announced, Open, Closed, Withdrawn }
public sealed class Institution
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Domain { get; set; }
    public required string Country { get; set; }
}
public sealed class Programme
{
    public Guid Id { get; set; }
    public Guid InstitutionId { get; set; }
    public Institution Institution { get; set; } = null!;
    public required string Name { get; set; }
    public required string Key { get; set; }
    public string DegreeLevel { get; set; } = "Masters";
    public required string OfficialUrl { get; set; }
}
public sealed class FundingAward
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Sponsor { get; set; }
    public required string Key { get; set; }
    public required string OfficialUrl { get; set; }
}

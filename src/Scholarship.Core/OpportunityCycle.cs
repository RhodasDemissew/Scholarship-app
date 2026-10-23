namespace Scholarship.Core;

public sealed class OpportunityCycle
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string InstitutionName { get; set; }
    public required string IntakeLabel { get; set; }
    public bool IsFictional { get; set; }
    public Guid ProgrammeId { get; set; }
    public Programme Programme { get; set; } = null!;
    public Guid? FundingAwardId { get; set; }
    public FundingAward? FundingAward { get; set; }
    public string Round { get; set; } = "main";
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
    public ApplicationStatus ApplicationStatus { get; set; } = ApplicationStatus.Unknown;
    public Guid Version { get; set; } = Guid.NewGuid();
    public DateTimeOffset? LastReviewedAt { get; set; }
    public List<Deadline> Deadlines { get; set; } = [];
    public List<FundingComponent> Funding { get; set; } = [];
    public List<FieldEvidence> Evidence { get; set; } = [];
}

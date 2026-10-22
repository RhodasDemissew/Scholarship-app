namespace Scholarship.Core;

public sealed class OpportunityCycle
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string InstitutionName { get; set; }
    public required string IntakeLabel { get; set; }
    public bool IsFictional { get; set; }
}

namespace Scholarship.Core;

public enum DeadlineKind { Admission, Scholarship, References, Documents }
public enum DeadlinePrecision { Unknown, Date, DateTime }
public enum FundingKind { Tuition, Stipend, Travel, Insurance, Visa, Other }
public enum Coverage { Unknown, Covered, NotCovered }

public sealed class Deadline
{
    public Guid Id { get; set; }
    public Guid OpportunityCycleId { get; set; }
    public DeadlineKind Kind { get; set; }
    public required string OriginalText { get; set; }
    public DeadlinePrecision Precision { get; set; }
    public DateOnly? LocalDate { get; set; }
    public TimeOnly? LocalTime { get; set; }
    public string? TimeZone { get; set; }
    public DateTimeOffset? InstantUtc { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class FundingComponent
{
    public Guid Id { get; set; }
    public Guid OpportunityCycleId { get; set; }
    public FundingKind Kind { get; set; }
    public Coverage Coverage { get; set; } = Coverage.Unknown;
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public string? Conditions { get; set; }
}
public sealed class FieldEvidence
{
    public Guid Id { get; set; }
    public Guid OpportunityCycleId { get; set; }
    public required string Field { get; set; }
    public required string SourceUrl { get; set; }
    public required string Excerpt { get; set; }
    public string? ReviewerId { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
}
public static class DeadlineRules
{
    public static string? Resolve(Deadline value)
    {
        value.InstantUtc = null;
        if (!Enum.IsDefined(value.Kind) || !Enum.IsDefined(value.Precision)) return "Invalid deadline kind or precision.";
        if (value.Precision == DeadlinePrecision.Unknown)
            return value.LocalDate != null || value.LocalTime != null || value.TimeZone != null ? "An unknown deadline cannot claim a date, time or zone." : null;
        if (value.LocalDate == null) return "A known deadline needs a date.";
        if (value.Precision == DeadlinePrecision.Date)
            return value.LocalTime != null || value.TimeZone != null ? "Date-only deadlines must not invent a time or timezone." : null;
        if (value.LocalTime == null) return "Date/time precision needs a local time.";
        if (string.IsNullOrWhiteSpace(value.TimeZone)) return null;
        if (!TimeZoneInfo.TryConvertIanaIdToWindowsId(value.TimeZone, out _)) return "Use a valid IANA timezone.";
        var zone = TimeZoneInfo.FindSystemTimeZoneById(value.TimeZone);
        var local = value.LocalDate.Value.ToDateTime(value.LocalTime.Value, DateTimeKind.Unspecified);
        if (zone.IsAmbiguousTime(local) || zone.IsInvalidTime(local)) return "This local time is ambiguous or invalid because of daylight saving. Confirm the source.";
        value.InstantUtc = new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(local, zone));
        return null;
    }
}

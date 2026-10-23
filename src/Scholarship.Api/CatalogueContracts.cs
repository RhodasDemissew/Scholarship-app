using Scholarship.Core;
namespace Scholarship.Api;

public sealed record DeadlineInput(DeadlineKind Kind, string OriginalText, DeadlinePrecision Precision, DateOnly? LocalDate, TimeOnly? LocalTime, string? TimeZone);
public sealed record FundingInput(FundingKind Kind, Coverage Coverage, decimal? Amount, string? Currency, string? Conditions);
public sealed record EvidenceInput(string Field, string SourceUrl, string Excerpt);
public sealed record DraftInput(string Title, string InstitutionName, string Domain, string Country, string ProgrammeName,
    string ProgrammeUrl, string? AwardName, string? Sponsor, string? AwardUrl, string IntakeLabel, string Round,
    bool IsFictional, ApplicationStatus ApplicationStatus, DeadlineInput[] Deadlines, FundingInput[] Funding, EvidenceInput[] Evidence);
public sealed record UpdateInput(Guid Version, DraftInput Draft);
public sealed record TransitionInput(Guid Version);
public sealed record CatalogueView(Guid Id, Guid Version, PublicationStatus PublicationStatus, DateTimeOffset? LastReviewedAt, DraftInput Draft);
public static class CatalogueContracts
{
    public static CatalogueView View(OpportunityCycle cycle) => new(cycle.Id, cycle.Version, cycle.PublicationStatus, cycle.LastReviewedAt,
        new(cycle.Title, cycle.InstitutionName, cycle.Programme.Institution.Domain, cycle.Programme.Institution.Country,
        cycle.Programme.Name, cycle.Programme.OfficialUrl, cycle.FundingAward?.Name, cycle.FundingAward?.Sponsor, cycle.FundingAward?.OfficialUrl,
        cycle.IntakeLabel, cycle.Round, cycle.IsFictional, cycle.ApplicationStatus,
        cycle.Deadlines.OrderBy(x=>x.Kind).Select(x=>new DeadlineInput(x.Kind,x.OriginalText,x.Precision,x.LocalDate,x.LocalTime,x.TimeZone)).ToArray(),
        Enum.GetValues<FundingKind>().Select(kind => { var x=cycle.Funding.SingleOrDefault(f=>f.Kind==kind); return new FundingInput(kind,x?.Coverage ?? Coverage.Unknown,x?.Amount,x?.Currency,x?.Conditions); }).ToArray(),
        cycle.Evidence.Select(x=>new EvidenceInput(x.Field,x.SourceUrl,x.Excerpt)).ToArray()));
    public static string? Validate(DraftInput d)
    {
        if (!Text(d.Title,200) || !Text(d.InstitutionName,200) || !Text(d.Country,80) ||
            !Text(d.ProgrammeName,200) || !Text(d.IntakeLabel,80) || !Text(d.Round,80)) return "Complete the title, institution, country, programme, intake and round within their length limits.";
        if (!Text(d.Domain,253) || Uri.CheckHostName(d.Domain.Trim().ToLowerInvariant()) != UriHostNameType.Dns) return "Enter the institution's domain without a scheme or path.";
        if (!Https(d.ProgrammeUrl)) return "Programme URL must be an HTTPS URL without embedded credentials.";
        if (!string.IsNullOrWhiteSpace(d.AwardName) && (!Text(d.AwardName,200) || !Text(d.Sponsor,200) || !Https(d.AwardUrl))) return "An award needs a name, sponsor and HTTPS source URL.";
        if ((d.AwardName?.Length ?? 0) + (d.Sponsor?.Length ?? 0) > 299) return "Combined award and sponsor names must be under 300 characters.";
        if (!Enum.IsDefined(d.ApplicationStatus)) return "Invalid application status.";
        if (d.Deadlines == null || d.Funding == null || d.Evidence == null || d.Deadlines.Length > 4 || d.Funding.Length > 6 || d.Evidence.Length > 30) return "Too many or missing deadline, funding or evidence entries.";
        if (d.Deadlines.Select(x=>x.Kind).Distinct().Count()!=d.Deadlines.Length || d.Funding.Select(x=>x.Kind).Distinct().Count()!=d.Funding.Length) return "Use each deadline/funding kind only once.";
        foreach(var x in d.Deadlines)
        {
            if (!Text(x.OriginalText,2000)) return "Each deadline needs its original wording (up to 2000 characters).";
            var error = DeadlineRules.Resolve(Deadline(x)); if(error != null) return error;
        }
        foreach(var x in d.Funding)
        {
            if (!Enum.IsDefined(x.Kind) || !Enum.IsDefined(x.Coverage)) return "Invalid funding kind or coverage.";
            if (x.Amount is < 0 or > 9999999999999999m || x.Conditions?.Length > 2000) return "Invalid funding amount or conditions.";
            if (x.Amount != null && (x.Coverage != Coverage.Covered || x.Currency?.Length != 3 || !x.Currency.All(char.IsAsciiLetter))) return "A funding amount needs Covered status and a three-letter currency.";
            if (x.Amount == null && !string.IsNullOrEmpty(x.Currency)) return "Currency requires an amount.";
        }
        var fields = new[] { "overview", "opening" }.Concat(Enum.GetNames<DeadlineKind>().Select(x=>"deadline."+x)).Concat(Enum.GetNames<FundingKind>().Select(x=>"funding."+x));
        if (d.Evidence.Any(x=>!fields.Contains(x.Field) || !Https(x.SourceUrl) || !Text(x.Excerpt,2000))) return "Evidence needs a supported field, HTTPS source and a short excerpt (up to 2000 characters).";
        return null;
    }
    public static string? ReviewError(OpportunityCycle c)
    {
        bool Has(string field) => c.Evidence.Any(e=>e.Field==field);
        if (!Has("overview")) return "Add overview evidence identifying the programme, award and intake.";
        if(c.ApplicationStatus != ApplicationStatus.Unknown && !Has("opening")) return "Add evidence for the claimed application opening state or mark it Unknown.";
        foreach(var x in c.Deadlines) if(x.Precision != DeadlinePrecision.Unknown && !Has("deadline."+x.Kind)) return "Add source evidence for "+x.Kind+" deadline.";
        foreach(var x in c.Funding) if(x.Coverage != Coverage.Unknown && !Has("funding."+x.Kind)) return "Add source evidence for "+x.Kind+" funding.";
        return null;
    }
    public static Deadline Deadline(DeadlineInput x) => new() { Id=Guid.NewGuid(),Kind=x.Kind,OriginalText=x.OriginalText,Precision=x.Precision,LocalDate=x.LocalDate,LocalTime=x.LocalTime,TimeZone=string.IsNullOrWhiteSpace(x.TimeZone)?null:x.TimeZone };
    public static bool Text(string? text,int max) => !string.IsNullOrWhiteSpace(text) && text.Length<=max;
    public static bool Https(string? value) => value?.Length<=2000 && Uri.TryCreate(value,UriKind.Absolute,out var uri) && uri.Scheme=="https" && string.IsNullOrEmpty(uri.UserInfo);
}


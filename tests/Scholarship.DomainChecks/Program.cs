using Scholarship.Core;

void Check(bool value, string name) { if (!value) throw new Exception(name); Console.WriteLine("PASS: " + name); }
var deadline = new Deadline { OriginalText = "15 January 2027", Precision = DeadlinePrecision.Date, LocalDate = new(2027, 1, 15) };
Check(DeadlineRules.Resolve(deadline) == null && deadline.InstantUtc == null, "Date-only stays date-only");
deadline.LocalTime = new(23, 59);
Check(DeadlineRules.Resolve(deadline) != null, "Date-only cannot invent end of day");
deadline.Precision = DeadlinePrecision.DateTime;
Check(DeadlineRules.Resolve(deadline) == null && deadline.InstantUtc == null, "Unknown timezone stays unknown");
deadline.TimeZone = "Africa/Addis_Ababa";
Check(DeadlineRules.Resolve(deadline) == null && deadline.InstantUtc?.Hour == 20, "Known zone resolves UTC");
deadline.TimeZone = "Europe/Paris"; deadline.LocalDate = new(2026, 10, 25); deadline.LocalTime = new(2,30);
Check(DeadlineRules.Resolve(deadline) != null && deadline.InstantUtc == null, "DST ambiguity is rejected");
deadline.LocalDate = new(2026,3,29);
Check(DeadlineRules.Resolve(deadline) != null, "DST missing time is rejected");
deadline.TimeZone = "invented/zone";
Check(DeadlineRules.Resolve(deadline) != null, "Invalid timezone rejected");
Check(new FundingComponent().Coverage == Coverage.Unknown, "Funding defaults to explicit unknown");
Check(new OpportunityCycle { Title="Test",InstitutionName="Test",IntakeLabel="2027" }.PublicationStatus == PublicationStatus.Draft, "New records are private drafts");

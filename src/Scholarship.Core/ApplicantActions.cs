namespace Scholarship.Core;
public sealed class SavedOpportunity
{
 public required string UserId {get;set;}
 public Guid CycleId {get;set;}
 public OpportunityCycle Cycle {get;set;} = null!;
 public DateTimeOffset SavedAt {get;set;}
}
public sealed class InformationReport
{
 public Guid Id {get;set;}
 public required string UserId {get;set;}
 public Guid CycleId {get;set;}
 public OpportunityCycle Cycle {get;set;} = null!;
 public required string Message {get;set;}
 public DateTimeOffset CreatedAt {get;set;}
}


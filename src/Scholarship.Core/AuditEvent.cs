namespace Scholarship.Core;
public sealed class AuditEvent
{
 public Guid Id {get;set;}
 public Guid CycleId {get;set;}
 public required string ActorId {get;set;}
 public required string Action {get;set;}
 public Guid Version {get;set;}
 public string? PreviousStatus {get;set;}
 public required string NewStatus {get;set;}
 public required string ChangedFields {get;set;}
 public DateTimeOffset At {get;set;}
}


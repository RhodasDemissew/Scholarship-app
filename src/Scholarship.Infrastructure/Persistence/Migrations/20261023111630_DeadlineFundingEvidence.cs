using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scholarship.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DeadlineFundingEvidence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Deadline",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OpportunityCycleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Kind = table.Column<string>(type: "text", nullable: false),
                    OriginalText = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Precision = table.Column<string>(type: "text", nullable: false),
                    LocalDate = table.Column<DateOnly>(type: "date", nullable: true),
                    LocalTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    TimeZone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InstantUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deadline", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deadline_OpportunityCycles_OpportunityCycleId",
                        column: x => x.OpportunityCycleId,
                        principalTable: "OpportunityCycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FieldEvidence",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OpportunityCycleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Field = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    SourceUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Excerpt = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ReviewerId = table.Column<string>(type: "text", nullable: true),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldEvidence", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldEvidence_OpportunityCycles_OpportunityCycleId",
                        column: x => x.OpportunityCycleId,
                        principalTable: "OpportunityCycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FundingComponent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OpportunityCycleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Kind = table.Column<string>(type: "text", nullable: false),
                    Coverage = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Conditions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingComponent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FundingComponent_OpportunityCycles_OpportunityCycleId",
                        column: x => x.OpportunityCycleId,
                        principalTable: "OpportunityCycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deadline_OpportunityCycleId_Kind",
                table: "Deadline",
                columns: new[] { "OpportunityCycleId", "Kind" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FieldEvidence_OpportunityCycleId_Field",
                table: "FieldEvidence",
                columns: new[] { "OpportunityCycleId", "Field" });

            migrationBuilder.CreateIndex(
                name: "IX_FundingComponent_OpportunityCycleId_Kind",
                table: "FundingComponent",
                columns: new[] { "OpportunityCycleId", "Kind" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Deadline");

            migrationBuilder.DropTable(
                name: "FieldEvidence");

            migrationBuilder.DropTable(
                name: "FundingComponent");
        }
    }
}

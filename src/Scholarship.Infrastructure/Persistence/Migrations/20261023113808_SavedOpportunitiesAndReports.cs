using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scholarship.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SavedOpportunitiesAndReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InformationReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CycleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InformationReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InformationReports_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InformationReports_OpportunityCycles_CycleId",
                        column: x => x.CycleId,
                        principalTable: "OpportunityCycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SavedOpportunities",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CycleId = table.Column<Guid>(type: "uuid", nullable: false),
                    SavedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedOpportunities", x => new { x.UserId, x.CycleId });
                    table.ForeignKey(
                        name: "FK_SavedOpportunities_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SavedOpportunities_OpportunityCycles_CycleId",
                        column: x => x.CycleId,
                        principalTable: "OpportunityCycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InformationReports_CycleId",
                table: "InformationReports",
                column: "CycleId");

            migrationBuilder.CreateIndex(
                name: "IX_InformationReports_UserId_CreatedAt",
                table: "InformationReports",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SavedOpportunities_CycleId",
                table: "SavedOpportunities",
                column: "CycleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InformationReports");

            migrationBuilder.DropTable(
                name: "SavedOpportunities");
        }
    }
}

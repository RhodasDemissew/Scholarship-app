using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scholarship.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CatalogueIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationStatus",
                table: "OpportunityCycles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "FundingAwardId",
                table: "OpportunityCycles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastReviewedAt",
                table: "OpportunityCycles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProgrammeId",
                table: "OpportunityCycles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "PublicationStatus",
                table: "OpportunityCycles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Round",
                table: "OpportunityCycles",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "Version",
                table: "OpportunityCycles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "FundingAwards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Sponsor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Key = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    OfficialUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingAwards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Institutions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Domain = table.Column<string>(type: "character varying(253)", maxLength: 253, nullable: false),
                    Country = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Institutions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Programmes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InstitutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DegreeLevel = table.Column<string>(type: "text", nullable: false),
                    OfficialUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Programmes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Programmes_Institutions_InstitutionId",
                        column: x => x.InstitutionId,
                        principalTable: "Institutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Institutions",
                columns: new[] { "Id", "Country", "Domain", "Name" },
                values: new object[] { new Guid("e40f60a3-e248-4498-a532-dfcdf56bd001"), "Fictional country", "example.invalid", "Fictional Example University" });

            migrationBuilder.UpdateData(
                table: "OpportunityCycles",
                keyColumn: "Id",
                keyValue: new Guid("c950dff5-741a-4946-a266-7f532a613027"),
                columns: new[] { "ApplicationStatus", "FundingAwardId", "LastReviewedAt", "ProgrammeId", "PublicationStatus", "Round", "Version" },
                values: new object[] { "Unknown", null, null, new Guid("e40f60a3-e248-4498-a532-dfcdf56bd002"), "Published", "main", new Guid("e40f60a3-e248-4498-a532-dfcdf56bd003") });

            migrationBuilder.InsertData(
                table: "Programmes",
                columns: new[] { "Id", "DegreeLevel", "InstitutionId", "Key", "Name", "OfficialUrl" },
                values: new object[] { new Guid("e40f60a3-e248-4498-a532-dfcdf56bd002"), "Masters", new Guid("e40f60a3-e248-4498-a532-dfcdf56bd001"), "EXAMPLE MASTERS", "Example Master's Programme", "https://example.invalid" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityCycles_FundingAwardId",
                table: "OpportunityCycles",
                column: "FundingAwardId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityCycles_ProgrammeId_FundingAwardId_IntakeLabel_Ro~",
                table: "OpportunityCycles",
                columns: new[] { "ProgrammeId", "FundingAwardId", "IntakeLabel", "Round" },
                unique: true)
                .Annotation("Npgsql:NullsDistinct", false);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityCycles_PublicationStatus_IntakeLabel",
                table: "OpportunityCycles",
                columns: new[] { "PublicationStatus", "IntakeLabel" });

            migrationBuilder.CreateIndex(
                name: "IX_FundingAwards_Key",
                table: "FundingAwards",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Institutions_Domain",
                table: "Institutions",
                column: "Domain",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Programmes_InstitutionId_Key",
                table: "Programmes",
                columns: new[] { "InstitutionId", "Key" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_OpportunityCycles_FundingAwards_FundingAwardId",
                table: "OpportunityCycles",
                column: "FundingAwardId",
                principalTable: "FundingAwards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OpportunityCycles_Programmes_ProgrammeId",
                table: "OpportunityCycles",
                column: "ProgrammeId",
                principalTable: "Programmes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OpportunityCycles_FundingAwards_FundingAwardId",
                table: "OpportunityCycles");

            migrationBuilder.DropForeignKey(
                name: "FK_OpportunityCycles_Programmes_ProgrammeId",
                table: "OpportunityCycles");

            migrationBuilder.DropTable(
                name: "FundingAwards");

            migrationBuilder.DropTable(
                name: "Programmes");

            migrationBuilder.DropTable(
                name: "Institutions");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityCycles_FundingAwardId",
                table: "OpportunityCycles");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityCycles_ProgrammeId_FundingAwardId_IntakeLabel_Ro~",
                table: "OpportunityCycles");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityCycles_PublicationStatus_IntakeLabel",
                table: "OpportunityCycles");

            migrationBuilder.DropColumn(
                name: "ApplicationStatus",
                table: "OpportunityCycles");

            migrationBuilder.DropColumn(
                name: "FundingAwardId",
                table: "OpportunityCycles");

            migrationBuilder.DropColumn(
                name: "LastReviewedAt",
                table: "OpportunityCycles");

            migrationBuilder.DropColumn(
                name: "ProgrammeId",
                table: "OpportunityCycles");

            migrationBuilder.DropColumn(
                name: "PublicationStatus",
                table: "OpportunityCycles");

            migrationBuilder.DropColumn(
                name: "Round",
                table: "OpportunityCycles");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "OpportunityCycles");
        }
    }
}

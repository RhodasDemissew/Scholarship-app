using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scholarship.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FirstOpportunityCycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OpportunityCycles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    InstitutionName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IntakeLabel = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    IsFictional = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityCycles", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "OpportunityCycles",
                columns: new[] { "Id", "InstitutionName", "IntakeLabel", "IsFictional", "Title" },
                values: new object[] { new Guid("c950dff5-741a-4946-a266-7f532a613027"), "Fictional Example University", "2027 intake", true, "Example Master's Scholarship" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OpportunityCycles");
        }
    }
}

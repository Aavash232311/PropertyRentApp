using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rentify.Server.Migrations
{
    /// <inheritdoc />
    public partial class HighLight : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "HighlightId",
                table: "properties",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Highlights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Highlights", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_properties_HighlightId",
                table: "properties",
                column: "HighlightId");

            migrationBuilder.AddForeignKey(
                name: "FK_properties_Highlights_HighlightId",
                table: "properties",
                column: "HighlightId",
                principalTable: "Highlights",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_properties_Highlights_HighlightId",
                table: "properties");

            migrationBuilder.DropTable(
                name: "Highlights");

            migrationBuilder.DropIndex(
                name: "IX_properties_HighlightId",
                table: "properties");

            migrationBuilder.DropColumn(
                name: "HighlightId",
                table: "properties");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;
using Rentify.Server.Services;

#nullable disable

namespace Rentify.Server.Migrations
{
    /// <inheritdoc />
    public partial class seedPropertyProperlyProxy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Generate seed data
            var seeder = new Helper();
            var properties = seeder.SeedProperties(110, 27.69325634309158, 85.34403056649698);

            foreach (var property in properties)
            {
                Console.WriteLine(property);
                migrationBuilder.InsertData(
                    table: "properties",
                    columns: new[] { "Id", "Name", "Gps", "Location", "Description", "Rules", "HotWatter", "WaterAllTime", "AccessToRoof", "CarParking", "AllowanceOfPet", "PreFurnished", "AccessToNaturalSun", "StorageFacility", "FlatSpace", "FrontRoadAccess", "PricePerMonth", "type", "image_1", "AddedDate" },
                    values: new object[] {
                        property.Id,
                        property.Name,
                        string.Join(";", property.Gps),
                        property.Location,
                        property.Description,
                        property.Rules,
                        property.HotWatter,
                        property.WaterAllTime,
                        property.AccessToRoof,
                        property.CarParking,
                        property.AllowanceOfPet,
                        property.PreFurnished,
                        property.AccessToNaturalSun,
                        property.StorageFacility,
                        property.FlatSpace,
                        property.FrontRoadAccess,
                        property.PricePerMonth,
                        property.type,
                        property.image_1,
                        property.AddedDate
                    }
                );
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}

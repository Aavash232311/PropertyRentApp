using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Rentify.Server.Models
{
    public class Property
    {
        public Guid Id { get; set; }
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(100), Required]
        public List<String> Gps { get; set; } = new List<String>();
        [MaxLength(50)]
        public string Location { get; set; } = string.Empty; // location in words
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        [MaxLength(1000)]
        public string Rules { get; set; } = string.Empty;
        public bool HotWatter { get; set; } = false;
        public bool WaterAllTime { get; set; } = false;
        public bool AccessToRoof { get; set; } = false;
        public bool CarParking { get; set; } = false;
        public bool AllowanceOfPet { get; set; } = false;
        public bool PreFurnished { get; set; } = false;
        public bool AccessToNaturalSun { get; set; } = false;
        public bool StorageFacility { get; set; } = false;
        public decimal FlatSpace { get; set; } = 0;
        public decimal FrontRoadAccess { get; set; } = 0;
        public decimal PricePerMonth { get; set; } = 0;
        public string type { get; set; } = string.Empty;
        public string image_1 { get; set; } = string.Empty;
        public string? image_2 { get; set; } = string.Empty;
        public string? image_3 { get; set; } = string.Empty;
        public string? image_4 { get; set; } = string.Empty;
        public string? image_5 { get; set; } = string.Empty;
        public string? image_6 { get; set; } = string.Empty;
        public string? image_7 { get; set; } = string.Empty;
        public string? image_8 { get; set; } = string.Empty;
        [JsonIgnore]
        public ApplicationUser User { get; set; } = new ApplicationUser();
        public DateTime AddedDate { get; set; } = DateTime.Now; 

    }
}

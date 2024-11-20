
using Rentify.Server.Models;
using System.ComponentModel.DataAnnotations;
namespace Rentify.Server.Searlizer
{ 
    public class UserProfileExtended
    {
        [MaxLength(50)]
        public string Addres { get; set; } = string.Empty;
        public string? OfficeAddress { get; set; } = string.Empty;
        [MaxLength(50)]
        public string FullName { get; set; } = string.Empty;
        [MaxLength(20)]
        public string? ContactNumber { get; set; } = string.Empty;
        public IFormFile? Profile { get; set; }
        [MaxLength(50)]
        public string Phone { get; set; } = string.Empty;
        [MaxLength(500)]
        public string? Bio { get; set; } = string.Empty;
    }
    public class PropertyFromImageExtended
    {
        [Required]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "At least one image is required")]
        public IFormFile image_1 { get; set; }
        public IFormFile? image_2 { get; set; }
        public IFormFile? image_3 { get; set; }
        public IFormFile? image_4 { get; set; }
        public IFormFile? image_5 { get; set; }
        public IFormFile? image_6 { get; set; }
        public IFormFile? image_7 { get; set; }
        public IFormFile? image_8 { get; set; }
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(100), Required]
        public List<String> Gps { get; set; } = new List<String>();
        [MaxLength(50)]
        public string Location { get; set; } = string.Empty; // location in words
        [MaxLength (1000)]
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
        public ApplicationUser User { get; set; } = new ApplicationUser();
    }
    public class UploadThemeImage
    {
        public IFormFile Image { get; set;}
    }
    public class HaverSineSearchQuery
    {
        public List<decimal> Coordinate { get; set; }
        public int Distance { get; set; }
        public string Type { get; set; } = string.Empty;
        public int page { get; set; } = 1;
    }
}

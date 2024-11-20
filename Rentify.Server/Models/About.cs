using System.ComponentModel.DataAnnotations;

namespace Rentify.Server.Models
{
    public class About
    {
        public int Id { get; set; }
        [MaxLength(1255)]    
        public string AboutUs { get; set; } = string.Empty;
        [MaxLength(255)]
        public string? InstaGram { get; set; } = string.Empty;
        [MaxLength(255)]
        public string? FaceBookPage { get; set; } = string.Empty;
        [MaxLength(255)]
        public string? YoutubePage { get; set; } = string.Empty;
        [MaxLength(255)]
        public string ContactEmail { get; set; } = string.Empty;
        [MinLength(10)]
        [MaxLength(10)]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "The phone number must be exactly 10 digits.")]
        public string? ContactPhone { get; set; } = string.Empty;
    }
}

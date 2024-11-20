using System.ComponentModel.DataAnnotations;

namespace Rentify.Server.Models
{
    public class ThemeHomeImage
    {
        public Guid Id { get; set; }
        [MaxLength(2555)]
        public string Image { get; set; } = string.Empty;
    }
}

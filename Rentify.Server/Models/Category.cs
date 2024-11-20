using System.ComponentModel.DataAnnotations;

namespace Rentify.Server.Models
{
    public class CategoryClass
    {
        public Guid Id { get; set; }
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        public bool ShowFrontPage { get; set; } = false;
    }
}

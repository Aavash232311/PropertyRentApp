using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Rentify.Server.Models
{
    public class ApplicationUser: IdentityUser
    {
        public int EmailConformCode { get; set; }
        [MaxLength(50)]
        public string Addres { get; set; } = string.Empty;
        [MaxLength(50), MinLength(0)]
        public string? OfficeAddress { get; set; } = string.Empty;
        [MaxLength(50)]
        public string FullName { get; set; } = string.Empty;
        [MaxLength(5000)]
        public string Profile { get; set; } = string.Empty;
        [MaxLength(128), MinLength(0)]
        public string? Bio { get; set; } = string.Empty;
    }
}

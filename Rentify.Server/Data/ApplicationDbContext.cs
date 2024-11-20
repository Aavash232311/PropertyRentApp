using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rentify.Server.Models;

namespace Rentify.Server.Data
{
    public class ApplicationDbContext: IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) :
        base(options)
        {
        }
        public DbSet<ApplicationUser> User { get; set; }
        public DbSet<Property> properties { get; set; }
        public DbSet<ThemeHomeImage> ThemeImages { get; set; }
        public DbSet<CategoryClass> CategoryOfProperty { get; set; }
        public DbSet<Highlight> Highlights { get; set; }
        public DbSet<AdminLogs> AdminLogs { get; set; }
        public DbSet<About> About { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<ApplicationUser>().HasIndex(u => u.Email).IsUnique();
            base.OnModelCreating(builder);
        }
     }
}

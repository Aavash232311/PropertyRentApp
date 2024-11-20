using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Rentify.Server.Data;
using Rentify.Server.Models;
using Rentify.Server.Services;
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("dbs"))
);

// Identity framework
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<ApplicationUser>(options => options.SignIn.RequireConfirmedEmail = true) // later in production set it to true
     .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
builder.Services.AddScoped<UserManager<ApplicationUser>, CustomUserManager<ApplicationUser>>();
builder.Services.AddSingleton<Helper>();
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

// email send
builder.Services.AddTransient<IEmailSender, EmailService>();

var app = builder.Build();
app.MapIdentityApi<ApplicationUser>();
// https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization?view=aspnetcore-8.0#use-the-get-confirmemail-endpoint

app.UseCors(builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
});

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    // seed default roles

    string[] roles = new[] { "superuser", "Client", "staff" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
    // create superuser
    var adminEmail = "aavash2005@gmail.com";
    var getUser = await userManager.FindByEmailAsync(adminEmail);
    if (getUser == null)
    {
        var user = new ApplicationUser() { Email = adminEmail, UserName = "aavash2005@gmail.com" };
        var status = await userManager.CreateAsync(user, "Admin!9841");
        if (status.Succeeded)
        {
            var userId = user.Id;
            await userManager.RemoveFromRoleAsync(user, "Client");
            await userManager.AddToRoleAsync(user, "superuser");
        }
    }
    else { 
        await userManager.RemoveFromRoleAsync(getUser, "Client");
        await userManager.AddToRoleAsync(getUser, "superuser");
    }
}

app.MapDefaultEndpoints();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "images")),
    RequestPath = "/images"
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

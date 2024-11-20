using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Rentify.Server.Data;
using Rentify.Server.Models;
using Rentify.Server.Searlizer;
using Rentify.Server.Services;
using System.ComponentModel.DataAnnotations;

namespace Rentify.Server.Controllers
{
    public class UserCreationAdmin
    {
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(150)]
        public string Address { get; set; } = string.Empty;
        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;
        [MaxLength(10)]
        public string PhoneNumber { get; set; } = string.Empty;
        [MaxLength(50)]
        public string Email { get; set; } = string.Empty;
    }
    public class ChangePassword
    {
        [MaxLength(50)]
        public string UserNamePassword { get; set; } = string.Empty;
        [MaxLength(50)]
        public string CurrentPassword { get; set; } = string.Empty;
        [MaxLength(50)]
        public string NewPassword { get; set; } = string.Empty;
    }
    [Route("superuser/[controller]")]
    [ApiController]
    [Authorize(Roles = "superuser")]
    public class AdminController : ControllerBase
    {
        public ApplicationDbContext _context;
        public readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public Helper helper;
        public AdminController(ApplicationDbContext options, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = options;
            _userManager = userManager;
            _roleManager = roleManager;
            helper = new Helper();
        }
        [Route("set-property-type")]
        [HttpGet]
        public async Task<IActionResult> SaveType(string Name)
        {
            CategoryClass category = new CategoryClass()
            {
                Name = Name
            };
            this._context.CategoryOfProperty.Add(category);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("display-property-home")]
        [HttpGet]   
        public async Task<IActionResult> DisplayPropertyHome(bool condition, Guid id)
        {
            var getType = _context.CategoryOfProperty.Where(x => x.Id == id).FirstOrDefault();
            if (getType == null) return new JsonResult(NotFound());
            getType.ShowFrontPage = condition;
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("del-type-property")]
        [HttpGet]
        public async Task<IActionResult> DeleteTypeProperty(Guid id)
        {
            var getClass = _context.CategoryOfProperty.Where(X => X.Id == id).FirstOrDefault(); 
            if (getClass == null) return new JsonResult(NotFound());
            _context.CategoryOfProperty.Remove(getClass);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("upload-home-page-theme-image")]
        [HttpPost]
        public async Task<IActionResult> UploadThemeHomePage(UploadThemeImage content)
        {
            var file = content.Image;
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            string name = this.helper.GenerateImageName(file.FileName);
            var path = Path.Combine(Directory.GetCurrentDirectory(), "images", name);
            var isImage = file.ContentType.StartsWith("image/");
            if (!isImage) { return new JsonResult(BadRequest(new { errors = "Unsupported file" })); }
            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var hostedPath = Path.Combine("images", name);
            ThemeHomeImage uploadSlot = new ThemeHomeImage();
            // let's see if there is any slot saved
            var checkForSaved = _context.ThemeImages.FirstOrDefault();
            if (checkForSaved != null)
            {
                string TempPath = checkForSaved.Image;
                if (System.IO.File.Exists(TempPath))
                {
                    System.IO.File.Delete(TempPath);
                }
                _context.ThemeImages.Remove(checkForSaved);
                await _context.SaveChangesAsync();
            }
            uploadSlot.Image = hostedPath;
            _context.ThemeImages.Add(uploadSlot);
            AdminLogs logs = new AdminLogs()
            {
                Log = $"Theme Image uploaded by {user.UserName}",
                UserName = user.UserName,
                ActionDate = DateTime.Now,

            };
            _context.AdminLogs.Add(logs);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok(content));
        }
        [Route("admin-search-property")]
        [HttpGet]
        public IActionResult GetPropertyNameAdmin(string searchBy, string query, int page)
        {
            if (string.IsNullOrEmpty(searchBy) || string.IsNullOrEmpty(query)) return new JsonResult(BadRequest());
            if (searchBy == "id")
            {
                try
                {
                    Guid Id = Guid.Parse(query);
                    var getProperty = _context.properties.Where(x => x.Id == Id).FirstOrDefault();     
                    return new JsonResult(Ok(new { property = getProperty, totalPage = 1}));
                }
                catch (Exception ex) { return new JsonResult(BadRequest(new {error = ex.Message})); }
            }
            int pageSize = 5;
            var regularQueryWithoutSkip = _context.properties.Where(x => x.Name.ToLower().Contains(query.ToLower()));
            var getPropertyByLabel = regularQueryWithoutSkip
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
            int totalProperties = regularQueryWithoutSkip.Count();
            int totalPages = (int)Math.Ceiling(totalProperties / (double)pageSize);
            return new JsonResult(Ok(new {property = getPropertyByLabel, totalPage = totalPages}));
        }
        [Route("create-theme")]
        [HttpGet]
        public async Task<IActionResult> CreateTheme(string name)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            if (string.IsNullOrEmpty(name)) return new JsonResult(BadRequest());
            Highlight highlight = new Highlight();
            highlight.Label = name;
            _context.Highlights.Add(highlight);
            AdminLogs logs = new AdminLogs()
            {
                Log = $"created theme ${name} by {user.UserName}",
                UserName = user.UserName,
                ActionDate = DateTime.Now,

            };
            _context.AdminLogs.Add(logs);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("addToHighLight")]
        [HttpGet]
        public async Task<IActionResult> AddToHighLight(Guid propertyId, Guid highLightId)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            var property = _context.properties.Where(x => x.Id == propertyId).FirstOrDefault(); 
            if (highLightId == Guid.Empty)
            {
                // we need to remove particular product from highlight;
                // rember one product on one slot
                var getPropertyHighlights = _context.Highlights.Where(h => h.Properties.Any(p => p.Id == propertyId)).FirstOrDefault();
                if (getPropertyHighlights == null || property == null) return new JsonResult(NoContent());
                getPropertyHighlights.Properties.Remove(property);
                await _context.SaveChangesAsync();
                return new JsonResult(Ok());
            }
            var highlight = _context.Highlights.Where(x => x.Id == highLightId).FirstOrDefault();
            if (property == null || highlight == null) return new JsonResult(BadRequest(new {error = "NULL", p = propertyId, h = highLightId }));
            List<Property> properties = highlight.Properties;
            if (!properties.Contains(property))
            {
                highlight.Properties.Add(property);
                await _context.SaveChangesAsync();
            }
            AdminLogs logs = new AdminLogs()
            {
                Log = $"added to highlight by {user.UserName}",
                UserName = user.UserName,
                ActionDate = DateTime.Now,

            };
            _context.AdminLogs.Add(logs);
            return new JsonResult(Ok());
        }
        [Route("remove-from-highlight")]
        [HttpGet]
        public async Task<IActionResult> RemoveFromId(Guid propertyId)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            var getProperty = _context.properties.Where(x => x.Id == propertyId).FirstOrDefault();
            if (getProperty == null) return new JsonResult(NoContent());
            var getPropertyHighlights = _context.Highlights.Where(h => h.Properties.Any(p => p.Id == propertyId)).FirstOrDefault();
            if (getPropertyHighlights == null) return new JsonResult(NoContent());
            getPropertyHighlights.Properties.Remove(getProperty);
            AdminLogs logs = new AdminLogs()
            {
                Log = $"removed from highlight by {user.UserName}",
                UserName = user.UserName,
                ActionDate = DateTime.Now,

            };
            _context.AdminLogs.Add(logs);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("delete-highlgiht")]
        [HttpGet]
        public async Task<IActionResult> DeleteHighlight(Guid highlightId)
        {
            // to prevent cascade delete issue
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            var highlight = _context.Highlights.Where(X => X.Id == highlightId).Include(p => p.Properties).FirstOrDefault();   
            if (highlight == null) return new JsonResult(NoContent());
            _context.Remove(highlight);
            AdminLogs logs = new AdminLogs()
            {
                Log = $"deleted highlight by {user.UserName}",
                UserName = user.UserName,
                ActionDate = DateTime.Now,
               
            };
            _context.AdminLogs.Add(logs);   
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("user-create")]
        [HttpPost]
        public async Task<IActionResult> CreateUser(UserCreationAdmin userCreationAdmin)
        {
            ApplicationUser user = new ApplicationUser()
            {
                FullName = userCreationAdmin.Name,
                Email = userCreationAdmin.Email,
                PhoneNumber = userCreationAdmin.PhoneNumber,
                UserName = userCreationAdmin.Name,
                EmailConfirmed = true
            };
            var checkForUserWithSameEmail = await _userManager.FindByEmailAsync(user.Email);

            if (checkForUserWithSameEmail != null)
            {
                List<object> ErrorList = new List<object>()
                {
                    new { description = "Email must be unique, your email is already taken"  }
                };
                return new JsonResult(NotFound(ErrorList.ToList()));
            }
            var newUser = await _userManager.CreateAsync(user, userCreationAdmin.Password);
            var adminUserCurrent = await _userManager.GetUserAsync(HttpContext.User);
            if (adminUserCurrent == null) { return BadRequest(); }
            if (newUser.Succeeded)
            {
                AdminLogs LogRport = new AdminLogs()
                {
                    Log = $"created user {adminUserCurrent.UserName}",
                    ActionDate = DateTime.Now,
                    UserName = user.UserName
                };
                _context.AdminLogs.Add(LogRport);
                await _context.SaveChangesAsync();
                return new JsonResult(Ok(newUser));
            }
            return new JsonResult(NotFound(newUser.Errors));
        }
        [Route("user-all")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers(int page)
        {
            if (page == 0) return new JsonResult(NoContent());
            int pageSize = 10;
            var defaultQuery = _context.User.ToList();
            var result = defaultQuery
                 .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            int totalUsers = defaultQuery.Count();
            // in result we have small data to getting roles will be fine
            var roles = new List<object>();
            foreach (var obj in result)
            {
                var getRoles = await _userManager.GetRolesAsync(obj);
                roles.Add(new { id = obj.Id, name = getRoles });
            }
            int totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);
            return new JsonResult(Ok(new {result, totalPages, roles }));
        }

        [Route("user-search-id-email")]
        [HttpGet]
        public async Task<IActionResult> GetUser(string type, string? query)
        {
            if (type == null) return new JsonResult(BadRequest());
            ApplicationUser? SearchedUser = null;
            if (type == "id" && query != null && query != string.Empty)
            {
                var user = await _userManager.FindByIdAsync(query);
                if (user == null) return new JsonResult(NotFound());
                SearchedUser = user;
            }
            if (type == "email" && query != null && query != string.Empty)
            {
                var getUser = await _userManager.FindByEmailAsync(query);
                if (getUser == null ) return new JsonResult(NotFound());
                SearchedUser = getUser;
            }
            if (SearchedUser == null) return new JsonResult(NotFound());
            var roles = new List<object>();
            var getRoles = await _userManager.GetRolesAsync(SearchedUser);
            roles.Add(new { id = SearchedUser.Id, name = getRoles });
            return new JsonResult(Ok(new {result = SearchedUser, roles }));
        }

        [Route("delete-user")]
        [HttpGet]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString()); // user to delete
            if (user.Email == helper.GetSuperUserEmail())
            {
                var currentAdmin = await _userManager.GetUserAsync(HttpContext.User);
                AdminLogs logs = new AdminLogs()
                {
                    ActionDate = DateTime.Now,
                    Log = $"attempted in deleting admin by {currentAdmin.Email}",
                    UserName = currentAdmin.Email
                };
                List<object> errors = new List<object>()
                {
                     new { description = "Can't delete admin privilege user, your action will be reported in server log"  }
                };
                _context.AdminLogs.Add(logs);
                await _context.SaveChangesAsync();
                return new JsonResult(BadRequest(errors));
            }
            if (user == null)  return new JsonResult(NoContent());
            var getUserRole = await _userManager.GetRolesAsync(user);
            if (getUserRole.Contains("superuser"))
            {
                List<object> errors = new List<object>()
                {
                     new { description = "Can't delete admin privilege user"  }
                };
                return new JsonResult(BadRequest(errors));
            }
            var deleteItsProperty = _context.properties.Where(X => X.User.Id == user.Id);
            var properties = typeof(PropertyFromImageExtended).GetProperties();
            // we need to delete the model accsociated with the user
            var currentUser = await _userManager.GetUserAsync(HttpContext.User);
            foreach (var model in deleteItsProperty)
            {
                // here we are deleting image, since it is stored as a path in db
                var currentProperty = model;
                foreach (var i in properties)
                {
                    if (i.PropertyType == typeof(IFormFile))
                    {
                        var getHostImagePath = helper.GetAttr(currentProperty, i.Name).ToString();
                        if (getHostImagePath == string.Empty || getHostImagePath == null) continue;
                        var GetServerAbsolutePath = Path.Combine(helper.GetServerRoute(), getHostImagePath);
                        if (System.IO.File.Exists(GetServerAbsolutePath))
                        {
                            System.IO.File.Delete(GetServerAbsolutePath);   
                        }
                    }
                }
                AdminLogs LogReportPrpperty = new AdminLogs()
                {
                    UserName = currentUser.UserName,
                    ActionDate = DateTime.Now,
                    Log = $"Deleted model property with id {(currentProperty.Id).ToString()} in part if deleting user {currentProperty.User.UserName} "
                };
                _context.AdminLogs.Add(LogReportPrpperty);
                _context.properties.Remove(currentProperty);
            }
            // we need to delete the profile Image Too
            var getUserProfileStaticDirectory = (user.Profile).ToString();
            if (getUserProfileStaticDirectory != null || getUserProfileStaticDirectory != string.Empty)
            {
                var GetServerAbsolutePath = Path.Combine(helper.GetServerRoute(), getUserProfileStaticDirectory);
                if (System.IO.File.Exists(GetServerAbsolutePath))
                {
                    System.IO.File.Delete(GetServerAbsolutePath);
                }
            }
            AdminLogs LogReport = new AdminLogs()
            {
                UserName = currentUser.UserName,
                ActionDate = DateTime.Now,
                Log = $"Deleted user {user.UserName}"
            };
            _context.AdminLogs.Add(LogReport);
            var condition = await _userManager.DeleteAsync(user);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("change-password")]
        [HttpPost]
        public async Task<IActionResult> ChangePasswordAdmin(ChangePassword Information)
        {
            if (Information == null) return new JsonResult(NoContent());
            var user = await _userManager.FindByEmailAsync(Information.UserNamePassword);
            if (user == null) return new JsonResult(NoContent());
            var result = await _userManager.ChangePasswordAsync(user, Information.CurrentPassword, Information.NewPassword);
            if (result.Succeeded) return new JsonResult(Ok());
            List<object> errors = new List<object>();
            foreach (var error in result.Errors)
            {
                errors.Add(new
                {
                    error
                });
            }
            return new JsonResult(BadRequest(new {error = errors}));
        }
        [Route("get-logs")]
        [HttpGet]
        public IActionResult GetAdminServerLogs(int page, string user, DateTime? date)
        {
            if (page == 0) return new JsonResult(NoContent());
            int pageSize = 5;
            List<AdminLogs> adminLogs = new List<AdminLogs>();
            if (user != "all")
            {
                adminLogs = _context.AdminLogs.OrderByDescending(d => d.ActionDate)
                    .Where(x => x.UserName == user)
                    .ToList();
            }
            else
            {
                adminLogs = _context.AdminLogs.OrderByDescending(d => d.ActionDate).ToList();
            }
            if (!(adminLogs.Any()))
            {
                return new JsonResult(NoContent());
            }
            if (date.HasValue)
            {
                adminLogs = adminLogs.Where(x => x.ActionDate.Date == date.Value.Date).ToList();
            }

            var result = adminLogs
                 .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            int totalUsers = adminLogs.Count();
            int totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);
            return new JsonResult(Ok(new { result, totalPages }));
        }
        [Route("get-admin-users")]
        [HttpGet]
        public async Task<IActionResult> GetAdminUsers()
        {
            var Admins = await _userManager.GetUsersInRoleAsync("superuser");
            if (!Admins.Any())
            { 
                return new JsonResult(NoContent());
            }
            var Infoamrtion = Admins.Select(user => new
            {
                user.Id,
                user.UserName,
                user.Email,
            });
            return new JsonResult(Ok(Infoamrtion));
        }
        [Route("property-delete-admin")]
        [HttpGet]
        public async Task<IActionResult> DeletePropertyAdmin(Guid id)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            var getProperty = _context.properties.Where(x => x.Id == id).FirstOrDefault();  
            if (getProperty == null) return new JsonResult(NoContent());
            helper.DeletePropertyImages(new List<Property>() { getProperty });
            _context.properties.Remove(getProperty);
            AdminLogs reoprt = new AdminLogs()
            {
                Log = $"{user.Email} deleted, property <br /> {getProperty.Id} of user {getProperty.User.Id}",
                UserName = user.UserName,
                ActionDate = DateTime.Now,
            };
            _context.AdminLogs.Add(reoprt);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("all-roles")]
        [HttpGet]
        public IActionResult AllRoles()
        {
            var roles = _roleManager.Roles;
            return new JsonResult(Ok(roles));
        }
        [Route("assign-roles")]
        [HttpGet]
        public async Task<IActionResult> AssignRoles(string Role, string Id)
        {
            var getAssignedUser = await _userManager.FindByIdAsync(Id);
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            if (getAssignedUser == null) return new JsonResult(NotFound());
            if (user.Email != helper.GetSuperUserEmail())
            {
                return new JsonResult(NotFound(new {error = "no permission"}));
            }
                var getRoles = await _roleManager.FindByNameAsync(Role);
            if (getRoles == null) return new JsonResult(NotFound(new {error = "role not found"}));
            // remove its old role

            var userRoles = await _userManager.GetRolesAsync(getAssignedUser);
            var removeOldRolesResult = await _userManager.RemoveFromRolesAsync(getAssignedUser, userRoles);

            var getAssignedUserRole = await _userManager.GetRolesAsync(getAssignedUser);
            if (getAssignedUser.Email == helper.GetSuperUserEmail()) return new JsonResult(NotFound(new {error = "admin cannot be manupulated"}));
            var result = await _userManager.AddToRoleAsync(getAssignedUser, Role);
            if (result.Succeeded)
            {
                AdminLogs logs = new AdminLogs()
                {
                    ActionDate = DateTime.Now,
                    Log = $"Assigned role {Role} to user {getAssignedUser.Email} by {user.Email}",
                    UserName = user.Email,
                };
                _context.AdminLogs.Add(logs);
                await _context.SaveChangesAsync();
                return new JsonResult(Ok());
            }
            return new JsonResult(BadRequest(new {error = "something went wrong"}));
        }
        [Route("clear-logs")]
        [HttpGet]
        public async Task<IActionResult> ClearLogs()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return new JsonResult(NotFound());
            if (currentUser.Email == helper.GetSuperUserEmail())
            {
                var logs = _context.AdminLogs.ToList();
                if (logs.Any())
                {
                    AdminLogs newLog = new AdminLogs()
                    {
                        ActionDate = DateTime.Now,
                        Log = $" {currentUser.Email}  cleared logs ",
                        UserName = currentUser.Email,
                    };
                    _context.AdminLogs.RemoveRange(logs);
                    _context.AdminLogs.Add(newLog);
                    await _context.SaveChangesAsync();
                }
                return new JsonResult(Ok());
            }
            return new JsonResult(Forbid());
        }
        [Route("add-about")]
        [HttpPost]
        public async Task<IActionResult> AddAbout(About about)
        {
            if (about == null)
            {
                return new JsonResult(BadRequest(new { errors = new List<object>() { new { ContentError = "No Content" } } }));
            }
            var checkIfAny = _context.About.Any();
            if (checkIfAny)
            {
                var getExisting = _context.About.FirstOrDefault();
                getExisting.AboutUs = about.AboutUs;
                getExisting.InstaGram = about.InstaGram;
                getExisting.FaceBookPage = about.FaceBookPage;
                getExisting.YoutubePage = about.YoutubePage;
                getExisting.ContactEmail = about.ContactEmail;
                getExisting.ContactPhone = about.ContactPhone;
                await _context.SaveChangesAsync();
                return new JsonResult(Ok());
            }
            About newAbout = new About()
            {
                AboutUs = about.AboutUs,
                InstaGram = about.InstaGram,
                FaceBookPage = about.FaceBookPage,
                YoutubePage = about.YoutubePage,
                ContactEmail = about.ContactEmail,
                ContactPhone = about.ContactPhone,
            };
            _context.About.Add(newAbout);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
    }
}

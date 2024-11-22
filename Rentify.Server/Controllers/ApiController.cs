using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Rentify.Server.Data;
using Rentify.Server.Models;
using Rentify.Server.Services;
using Rentify.Server.Searlizer;
using Microsoft.EntityFrameworkCore;

namespace Rentify.Server.Controllers
{

    [Route("[controller]")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        public ApplicationDbContext _context;
        public readonly UserManager<ApplicationUser> _userManager;
        public Helper helper;
        public ApiController(ApplicationDbContext options, UserManager<ApplicationUser> userManager) 
        {
            _context = options;
            _userManager = userManager;
            helper = new Helper();
        }
        [Route("property-add")]
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UploadProperty(PropertyFromImageExtended getProperty)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null)
            {
                return new JsonResult(Unauthorized());
            }
            // system.reflection to iterate
            var properties = typeof(PropertyFromImageExtended).GetProperties();
            var newProperty = new Property();
            foreach (var i in properties)
            {
                if (i.PropertyType == typeof(IFormFile))
                {
                    var file = i.GetValue(getProperty) as IFormFile;
                    if (file != null)
                    {
                        string name = this.helper.GenerateImageName(file.FileName);
                        var path = Path.Combine(Directory.GetCurrentDirectory(), "images", name);
                        var isImage = file.ContentType.StartsWith("image/");
                        // image file restriction
                        if (!isImage) { return new JsonResult(BadRequest( new {errors = new List<object>() { new { MediaError = "unsupported media" } } } ));}
                        long imageSizeBytes = file.Length; // Size in bytes
                        double imageSizeMB = (double)imageSizeBytes / (1024 * 1024); // mb
                        if (imageSizeMB > 3) { return new JsonResult(BadRequest(new { errors = new List<object>() { new { SizeError = "Size should be less than 3 mega byte" } } })); }
                        using (var stream = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }
                        var hostedPath = Path.Combine("images", name);
                        this.helper.SetPropertyValue(newProperty, i.Name, hostedPath);
                    }
                }
            }
            // The GPS value from the map cannot be just any thing 
            // it should come in proper format
            // else it will stop the entire functionality of the site
            // due to the nature of the query, I know I AM VILOATING DRY BUT 
            // ILL REFACTOR IT LATER
            try
            {
                var gpsCurrent = getProperty.Gps[0].Split(",");
                decimal lat1 = decimal.Parse(gpsCurrent[0]);
                decimal lon1 = decimal.Parse(gpsCurrent[1]);
            }
            catch (Exception ex) { return new JsonResult(BadRequest(new { errors = new List<object>() { new { MediaError = "set value in map" } } })); }
            newProperty.Name = getProperty.Name;
            newProperty.Description = getProperty.Description;
            newProperty.Rules = getProperty.Rules;
            newProperty.Location = getProperty.Location;
            newProperty.Gps = getProperty.Gps;
            newProperty.HotWatter = getProperty.HotWatter;
            newProperty.WaterAllTime = getProperty.WaterAllTime;
            newProperty.AccessToRoof = getProperty.AccessToRoof;
            newProperty.CarParking = getProperty.CarParking;
            newProperty.AllowanceOfPet = getProperty.AllowanceOfPet;
            newProperty.PreFurnished = getProperty.PreFurnished;
            newProperty.AccessToNaturalSun = getProperty.AccessToNaturalSun;
            newProperty.StorageFacility = getProperty.StorageFacility;
            newProperty.FlatSpace = getProperty.FlatSpace;
            newProperty.FrontRoadAccess = getProperty.FrontRoadAccess;
            newProperty.PricePerMonth = getProperty.PricePerMonth;
            newProperty.type = getProperty.type;
            newProperty.User = user;
            _context.properties.Add(newProperty);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }

        [Route("property-update")]
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateProperty(PropertyFromImageExtended getProperty, Guid id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (getProperty == null) return new JsonResult(NoContent());   
            if (user == null)
            {
                return new JsonResult(Unauthorized());
            }
            var newProperty = _context.properties.Where(x => x.Id == id).FirstOrDefault();
            if (newProperty == null) return new JsonResult(BadRequest());
            if (newProperty.User.Id != user.Id) return new JsonResult(Unauthorized());

            // deal with updating images
            var properties = typeof(PropertyFromImageExtended).GetProperties();
            foreach (var i in properties)
            {
                if (i.PropertyType == typeof(IFormFile))
                {
                    // only thing thats gonna change is the way we deal with the images

                    var file = i.GetValue(getProperty) as IFormFile;
                    if (file != null)
                    {
                        string name = this.helper.GenerateImageName(file.FileName);
                        var path = Path.Combine(Directory.GetCurrentDirectory(), "images", name);
                        var isImage = file.ContentType.StartsWith("image/");
                        if (!isImage) { return new JsonResult(BadRequest(new { errors = new List<object>() { new { MediaError = "unsupported media" } } })); }
                        long imageSizeBytes = file.Length; // Size in bytes
                        double imageSizeMB = (double)imageSizeBytes / (1024 * 1024); // mb
                        if (imageSizeMB > 3) { return new JsonResult(BadRequest(new { errors = new List<object>() { new { SizeError = "Size should be less than 3 mega byte" } } })); }
                        // if already exists then we need to delete it
                        var getValue = helper.GetAttr(newProperty, i.Name) as string; // existing value
                        // in producation, use env not getcurrdir
                        if (getValue != null || getValue != string.Empty)
                        {
                            // if there is value in the server and the client side returns empty;
                            // let's not touch it

                            var absoluteServerPath = Path.Combine(Directory.GetCurrentDirectory(), getValue.ToString());
                            if (System.IO.File.Exists(absoluteServerPath))
                            {
                                System.IO.File.Delete(absoluteServerPath);
                            }
                        }

                        using (var stream = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }
                        var hostedPath = Path.Combine("images", name);
                        this.helper.SetPropertyValue(newProperty, i.Name, hostedPath);
                    }
                }
            }
            try
            {
                var gpsCurrent = getProperty.Gps[0].Split(",");
                decimal lat1 = decimal.Parse(gpsCurrent[0]);
                decimal lon1 = decimal.Parse(gpsCurrent[1]);
            }
            catch (Exception ex) { return new JsonResult(BadRequest(new { errors = new List<object>() { new { MediaError = "set value in map" } } })); }
            newProperty.Name = getProperty.Name;
            newProperty.Description = getProperty.Description;
            newProperty.Rules = getProperty.Rules;
            newProperty.Location = getProperty.Location;
            newProperty.Gps = getProperty.Gps;
            newProperty.HotWatter = getProperty.HotWatter;
            newProperty.WaterAllTime = getProperty.WaterAllTime;
            newProperty.AccessToRoof = getProperty.AccessToRoof;
            newProperty.CarParking = getProperty.CarParking;
            newProperty.AllowanceOfPet = getProperty.AllowanceOfPet;
            newProperty.PreFurnished = getProperty.PreFurnished;
            newProperty.AccessToNaturalSun = getProperty.AccessToNaturalSun;
            newProperty.StorageFacility = getProperty.StorageFacility;
            newProperty.FlatSpace = getProperty.FlatSpace;
            newProperty.FrontRoadAccess = getProperty.FrontRoadAccess;
            newProperty.PricePerMonth = getProperty.PricePerMonth;
            newProperty.type = getProperty.type;
            newProperty.User = user;
            _context.properties.Update(newProperty);
            await _context.SaveChangesAsync();
            return new JsonResult(Ok(new {p = newProperty, g = getProperty}));
        }
      
        [Route("user-update")]
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UserInfoUpdate(UserProfileExtended UserInfo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            string profile = string.Empty;
            if (UserInfo.Profile != null)
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "images", UserInfo.Profile.FileName);
                var contentType = UserInfo.Profile.ContentType;
                var isImage = contentType.StartsWith("image/");
                if (!isImage) { return new JsonResult(BadRequest(new { errors = new List<object>() { new { MediaError = "unsupported media" } } })); }
                // if user is updating his profile we should delete the old one
                long imageSizeBytes = UserInfo.Profile.Length; // Size in bytes
                double imageSizeMB = (double)imageSizeBytes / (1024 * 1024); // mb
                if (imageSizeMB > 3) { return new JsonResult(BadRequest(new { errors = new List<object>() { new { SizeError = "Size should be less than 3 mega byte" } } })); }
                string? path = user.Profile;
                if (path != null || path != string.Empty)
                {
                    var currentImageDirectory = Path.Combine(Directory.GetCurrentDirectory(), path);
                    if (System.IO.File.Exists(currentImageDirectory))
                    {
                        System.IO.File.Delete(currentImageDirectory);
                    }
                }
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await UserInfo.Profile.CopyToAsync(stream);
                }
                profile = Path.Combine("images", UserInfo.Profile.FileName);
                user.Profile = profile; // changing only if we want to change or update profilew
            }
            if (UserInfo.OfficeAddress != null || UserInfo.OfficeAddress != string.Empty)
            {
                user.OfficeAddress = UserInfo.OfficeAddress;
            }
            user.Addres = UserInfo.Addres;
            user.Bio = UserInfo.Bio;
            user.FullName = UserInfo.FullName;
            if (UserInfo.Phone == null || UserInfo.Phone.Length != 10 || !UserInfo.Phone.All(char.IsDigit))
            {
                { return new JsonResult(BadRequest(new { errors = new List<object>() { new { PhoneNumberError = "Invalid phone number. It should be a 10-digit number." } } })); }
            }

            user.PhoneNumber = UserInfo.Phone;
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("get-particular-user")]
        [HttpGet]
        public async Task<IActionResult> GetAccount(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return new JsonResult(NotFound());
            return new JsonResult(Ok(new
            {
                email = user.Email,
                address = user.Addres,
                Bio = user.Bio,
                FullName = user.FullName,   
                Phone = user.PhoneNumber,
                Profile = user.Profile,
            }));
        }
        [Route("get-current-client")]
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(NotFound());
            return new JsonResult(Ok(new
            {
                email = user.Email,
                address = user.Addres,
                Bio = user.Bio,
                FullName = user.FullName,
                Phone = user.PhoneNumber,
                Profile = user.Profile,
                OffieAddress= user.OfficeAddress
            }));
        }
        [Route("getRls")]
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);

            if (user == null) return new JsonResult(BadRequest("user not found"));
            var userRole = await _userManager.GetRolesAsync(user);

            return new JsonResult(Ok(userRole));
        }
        [Route("get-property")]
        [Authorize]
        [HttpGet]
        public async Task<IActionResult>  GetProperty(int page)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(NotFound());
            if (page == 0) return new JsonResult(NotFound("0? you fr"));
            int pageSize = 5;
            var defaultQuery = _context.properties.Where(x => x.User.Id == user.Id);
            var properties = defaultQuery
                .Where(x => x.User.Id == user.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            int totalProperties = defaultQuery.Count();
            int totalPages = (int)Math.Ceiling(totalProperties / (double)pageSize);
            return new JsonResult(Ok(new { property = properties, page = totalPages }));
        }
        [Route("get-type-property")]
        [HttpGet]
        public IActionResult GetPropertyTypes()
        {
            var res = _context.CategoryOfProperty.ToList(); 
            return new JsonResult(Ok(res));
        }
        [Route("get-themed-image")]
        [HttpGet]   
        public IActionResult GetThemeImage()
        {
            return new JsonResult(Ok(_context.ThemeImages.FirstOrDefault()));    
        }
        [Route("property-home-page")]
        [HttpGet]
        public IActionResult GetPropertyHomePage()
        {
            var getCategories = _context.CategoryOfProperty.ToList();
            var property = new List<object>(); 
            foreach (var category in getCategories)
            {
                if (category.ShowFrontPage == true)
                {
                    var getData = _context.properties.Where(x => x.type == category.Name).ToList().Take(5);
                    property.Add(new
                    {
                        type = category.Name,
                        data = getData
                    });
                }
            }
            return new JsonResult(Ok(property));
        }
        [Route("get-recent-property")]
        [HttpGet]
        public IActionResult GetProperty()
        {
            var recentProperty = _context.properties.Take(5).ToList();
            return new JsonResult(Ok(recentProperty));
        }
        [Route("get-themes-admin-home")]
        [HttpGet]
        public IActionResult GetThemes()
        {
            // small dataset so shouldn't be a problem
            var themes = _context.Highlights.Include(p => p.Properties).ToList();
            return new JsonResult(Ok(themes));
        }
        [Route("hv-search")]
        [HttpPost]
        public IActionResult HaverSineSearch(HaverSineSearchQuery module)
        {
            int pageSize = 10; 
            // Search isn't happening at SQL level marking
            // which loads the variable, converts it as a c# enum
            // and then the query executes
            // we need better plans as the dataset grows,

            // make sure not to poke this api too much in production
            var defaultQuery = _context.properties.AsEnumerable() 
                .Where(x => helper.Haversine(module.Coordinate[0], module.Coordinate[1], helper.ConvertDecimal(x.Gps[0])[0], helper.ConvertDecimal(x.Gps[0])[1])  <= module.Distance && x.type.ToLower().Contains(module.Type.ToLower()));
            var result = defaultQuery
                 .Skip((module.page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            int totalProperties = defaultQuery.Count();
            int totalPages = (int)Math.Ceiling(totalProperties / (double)pageSize);
            return new JsonResult(Ok(new {result = result, totalPage = totalPages }));
        }
        [Route("search")]
        [HttpGet]
        public IActionResult GetResult(string query, string type, int page)
        {
            int pageSize = 10;
            var search = _context.properties
                .Where(x => x.Location.ToLower().Contains(query.ToLower()) || x.Name.ToLower().Contains(query.ToLower()) && x.type == type);
            var result = search
               .Skip((page - 1) * pageSize)
               .Take(pageSize)
               .ToList();
            int totalProperties = search.Count();
            int totalPages = (int)Math.Ceiling(totalProperties / (double)pageSize);
            return new JsonResult(Ok(new { result = result, totalPage = totalPages }));
        }
        [Route("get-user-property")]
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUserProperty(Guid id)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            var obj = _context.properties.Include(u => u.User).Where(x => x.Id == id && x.User.Id == user.Id).FirstOrDefault();
            if (obj == null) return new JsonResult(NotFound());
            return new JsonResult(Ok(obj));
        }
        [Route("get-particular-property")]
        [HttpGet]
        public IActionResult GetParticularProperty(Guid id, bool recomendation)
        {
            var obj = _context.properties.Include(u => u.User).Where(x => x.Id == id).FirstOrDefault();
            if (obj == null) return new JsonResult(NotFound());
            var propertyUserId = obj.User.Id;
            if ( recomendation == false)
            {

                return new JsonResult(Ok(obj));
            }
            // generating property near this one
            var gpsCurrent = obj.Gps[0].Split(",");
            decimal lat1 = decimal.Parse(gpsCurrent[0]);
            decimal lon1 = decimal.Parse(gpsCurrent[1]);
            int nearRnage = 5; // km
            int takeElelement = 4; // how many to take in small recomendation
            var simialLocation = _context.properties.AsEnumerable()  // near searched property, same type, but not the one looking for
                         .Where(x => helper.Haversine(lat1, lon1, helper.ConvertDecimal(x.Gps[0])[0], helper.ConvertDecimal(x.Gps[0])[1]) <= nearRnage && x.Id != obj.Id && x.type == obj.type).ToList().Take(takeElelement);
            var otherProperties = _context.properties.Where(x => x.Id != obj.Id).ToList().Take(takeElelement);
            var otherFromLandLord = _context.properties.Where(x => x.Id != obj.Id && x.User.Id == obj.User.Id).ToList().Take(takeElelement);
            return new JsonResult(Ok(new {property = obj, userId = propertyUserId, simialLocation, otherProperties, otherFromLandLord }));
        }
        [Route("delete-property-image")]
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> DeletePropertyResullt(Guid id, string image)
        {
            if (image == "image_1")
            {
                return new JsonResult(BadRequest(new { error = "Cannot be removed" }));
            }
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            var getProperty = _context.properties.Where(x => x.Id == id && x.User.Id == user.Id).FirstOrDefault();
            if (getProperty == null) return new JsonResult(NoContent());
            var getHostPath = helper.GetAttr(getProperty, image).ToString();
            var absoluteServerPath = Path.Combine(helper.GetServerRoute(), getHostPath);
            if (System.IO.File.Exists(absoluteServerPath))
            {
                System.IO.File.Delete(absoluteServerPath);
            }
            // once we delete the image, we need to set its path to null 
            helper.SetPropertyValue(getProperty, image, "");
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("delete-property")]
        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> DeletePropertyInParticular(Guid propertyId)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null) return new JsonResult(Unauthorized());
            var getUserProperty = _context.properties.Where(x => x.Id == propertyId && x.User.Id == user.Id).FirstOrDefault(); // if we ignore first or default it will find a list of properties for us, but we want to delete only one, which increases the complexity
            if (getUserProperty == null) return new JsonResult(NoContent());
            helper.DeletePropertyImages(new List<Property>() { getUserProperty });
            _context.properties.Remove(getUserProperty);
            // if a model is delete it should be deleted from highlight too
            await _context.SaveChangesAsync();
            return new JsonResult(Ok());
        }
        [Route("About-Site")]
        [HttpGet]
        public IActionResult GetAbout()
        {
            var about = _context.About.First();
            return new JsonResult(Ok(about));
        }
    }
}

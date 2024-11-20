using MimeKit;
using MailKit.Security;
using MimeKit.Text;
using MailKit.Net.Smtp;
using System.Reflection;
using Rentify.Server.Models;
using Org.BouncyCastle.Asn1.X509;
using Rentify.Server.Searlizer;
using Rentify.Server.Data;


namespace Rentify.Server.Services
{
    public class Helper
    {
        Random random = new Random();
        private const double EarthRadiusKm = 6371.0;
        public const string AppPassword = "cflyyiwwgrvvwlmt";
        private const string AppEmail = "aavash2005@gmail.com";
        public List<String> GenerateGps(double lat, double lon, double radiusKm)
        {
            var random = new Random();
            var u = random.NextDouble();
            var v = random.NextDouble();
            var w = radiusKm / EarthRadiusKm;
            var t = 2 * Math.PI * v;
            var x = w * Math.Cos(t);
            var y = w * Math.Sin(t);

            var newLat = lat + (x / Math.Cos(lat * Math.PI / 180));
            var newLon = lon + y;
            return new List<String> { newLat.ToString(), newLon.ToString() };
        }
        public List<Property> SeedProperties(int count, double baseLat, double baseLon)
        {  // Development environment for seeding database
            var properties = new List<Property>();
            List<String> types = new List<String>() { "Home", "Office", "Shop", "Land", "Room" };
            for (int i = 0; i < count; i++)
            {
                var gps = GenerateGps(baseLat, baseLon, 10);
                Console.WriteLine($"[\"{gps[0]},{gps[1]}\"]");
                properties.Add(new Property
                {
                    Id = Guid.NewGuid(),
                    Name = $"Property {i + 1}",
                    Gps = new List<string> { $"[\"{gps[0]},{gps[1]}\"]" },
                    Location = $"Location {i + 1}",
                    Description = "Sample description",
                    Rules = "Sample rules",
                    HotWatter = random.Next(2) == 0 ? true : false,
                    WaterAllTime = random.Next(2) == 0 ? true : false,
                    AccessToRoof = random.Next(2) == 0 ? true : false,
                    CarParking = random.Next(2) == 0 ? true : false,
                    AllowanceOfPet = random.Next(2) == 0 ? true : false,
                    PreFurnished = random.Next(2) == 0 ? true : false,
                    AccessToNaturalSun = random.Next(2) == 0 ? true : false,
                    StorageFacility = random.Next(2) == 0 ? true : false,
                    FlatSpace = random.Next(1, 100),
                    FrontRoadAccess = random.Next(1, 100),
                    PricePerMonth = random.Next(5000, 100000),
                    type = types[random.Next(types.Count)],
                    image_1 = "images\\477498Screenshot 2024-09-17 195619.png",
                    image_2 = "",
                    image_3 = "",
                    image_4 = "",
                    image_5 = "",
                    image_6 = "",
                    image_7 = "",
                    image_8 = "",
                    AddedDate = DateTime.Now,
                    User = new ApplicationUser()
                });
            }
            return properties;
        }
        public string GenerateImageName(string fileNameWithExtension)
        {
            string t = DateTime.Now.Second.ToString();
            return t + random.Next(0, 10000) + fileNameWithExtension;
        }
        public void SetPropertyValue(object obj, dynamic propertyName, object value)
        {
            // Get the Type object corresponding to the object's type
            Type type = obj.GetType();

            // Get the PropertyInfo object for the specified property
            PropertyInfo propertyInfo = type.GetProperty(propertyName);

            // Set the value of the property
            propertyInfo.SetValue(obj, value);
        }
        public void SendEmailLoginCode(string Email, int code)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(AppEmail));
            email.To.Add(MailboxAddress.Parse(Email));
            email.Subject = "Email verification";
            email.Body = new TextPart(TextFormat.Html)
            {
                Text = $"Hi we would like to comform your" +
                $" login your code is: {code}" +
                $" -VINTAGE STEP team, SR ER Aavash Lamichhane"
            };

            using var smtp = new SmtpClient();
            smtp.Connect("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            smtp.Authenticate(AppEmail, AppPassword); // your own app password and email or mail password
            smtp.Send(email);
            smtp.Disconnect(true);
        }

        public void SendEmail(string Email, string body)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse("aavash2005@gmail.com"));
            email.To.Add(MailboxAddress.Parse(Email));
            email.Subject = "Email verification";
            email.Body = new TextPart(TextFormat.Html)
            {
                Text = body
            };

            using var smtp = new SmtpClient();
            smtp.Connect("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            smtp.Authenticate(AppEmail, AppPassword); 
            smtp.Send(email);
            smtp.Disconnect(true);
        }

        public double Haversine(decimal lat1, decimal long1, decimal lat2, decimal long2)
        {
            {
                const double R = 6371; // Earth radius in kilometers
                var lat = (double)(lat2 - lat1) * Math.PI / 180.0;
                var lon = (double)(long2 - long1) * Math.PI / 180.0;

                var a = Math.Sin(lat / 2) * Math.Sin(lat / 2) +
                        Math.Cos((double)lat1 * Math.PI / 180.0) * Math.Cos((double)lat2 * Math.PI / 180.0) *
                        Math.Sin(lon / 2) * Math.Sin(lon / 2);

                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                return R * c;
            }
        }
        // ugh, you need extreme enlightment to understand 
        // how database and language intragated query works together
        public List<decimal> ConvertDecimal(string args)
        {
            var coordinate = args.Split(',');
            var decimals = new List<decimal>()
            {
                decimal.Parse(coordinate[0]),
                decimal.Parse(coordinate[1]),
            };
            return decimals;
        }
        public object GetAttr(dynamic classObject, dynamic name)
        {
            Type type = classObject.GetType();
            PropertyInfo propertyInfos = type.GetProperty(name);
            return propertyInfos.GetValue(classObject);
        }

        public string GetServerRoute()
        {
            // if needed change this in production
            return Directory.GetCurrentDirectory();
        }
        public void DeletePropertyImages(List<Property> deleteItsProperty)
        {
            var properties = typeof(PropertyFromImageExtended).GetProperties();
            // we need to delete the model accsociated with the user
            foreach (var model in deleteItsProperty)
            {
                // here we are deleting image, since it is stored as a path in db
                var currentProperty = model;
                foreach (var i in properties)
                {
                    if (i.PropertyType == typeof(IFormFile))
                    {
                        var getHostImagePath = GetAttr(currentProperty, i.Name).ToString();
                        if (getHostImagePath == string.Empty || getHostImagePath == null) continue;
                        var GetServerAbsolutePath = Path.Combine(GetServerRoute(), getHostImagePath);
                        if (System.IO.File.Exists(GetServerAbsolutePath))
                        {
                            System.IO.File.Delete(GetServerAbsolutePath);
                        }
                    }
                }
            }
        }
        public string GetSuperUserEmail()
        {
            return AppEmail;
        }

    }
}


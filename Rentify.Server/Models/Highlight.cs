namespace Rentify.Server.Models
{
    public class Highlight
    {
        public Guid Id { get; set; }    
        public List<Property> Properties { get; set; } = new List<Property>();
        public string Label { get; set; } = string.Empty;
    }
}

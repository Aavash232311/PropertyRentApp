namespace Rentify.Server.Models
{
    public class AdminLogs
    {
        public Guid Id { get; set; }    
        public string UserName { get; set; } = string.Empty;
        public string Log { get; set; } = string.Empty;
        public DateTime ActionDate { get; set; } = DateTime.Now;

    }
}

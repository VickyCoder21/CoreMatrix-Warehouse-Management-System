using Microsoft.AspNetCore.Mvc;

namespace SmartWarehouse.API.Controllers
{
    public class BaseController : Controller
    {
        protected readonly string _connectionString;
        public BaseController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
    }
}

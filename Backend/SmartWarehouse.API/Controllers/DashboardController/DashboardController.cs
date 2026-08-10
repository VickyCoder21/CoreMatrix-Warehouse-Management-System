using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Controllers;
using SmartWarehouse.API.Data;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace SmartWarehouse.API.Controllers.DashboardController
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : BaseController
    {
        public DashboardController(IConfiguration configuration) : base(configuration)
        {
        }

        [HttpGet]
        [Route("DashboardPageLoad")]
        public IActionResult DashboardPageLoad()
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convert = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[DASHBOARD].[DASHBOARD_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    conn.Open();

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);

                    if (ds.Tables.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            dashboard = convert.ConvertTableToList(ds.Tables[0])
                        });
                    }
                }

                return Ok(new
                {
                    result = false,
                    dashboard = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    result = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet]
        [Route("DashboardPurchaseOrderSummary")]
        public IActionResult DashboardPurchaseOrderSummary()
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[DASHBOARD].[DASHBOARD_PURCHASEORDER_SUMMARY]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds != null && ds.Tables.Count > 1)
                    {
                        return Ok(new
                        {
                            result = true,
                            recentOrders = convertdatatable.ConvertTableToList(ds.Tables[0]),
                            chartData = convertdatatable.ConvertTableToList(ds.Tables[1]),
                        });
                    }
                }

                return NotFound(new { result = false, message = "No data found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }

    }
}




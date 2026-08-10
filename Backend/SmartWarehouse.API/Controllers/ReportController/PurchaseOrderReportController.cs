using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Data;
using SmartWarehouse.API.Models;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace SmartWarehouse.API.Controllers.ReportController
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderReportController : BaseController
    {
        //private readonly IConfiguration _configuration;

        public PurchaseOrderReportController(IConfiguration configuration) : base(configuration)
        {
        }

        [HttpGet]
        [Route("PurchaseOrderReportPageLoad")]
        public IActionResult PurchaseOrderReportPageLoad()
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[REPORTS].[PURCHASEORDER_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    conn.Open();
                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            SupplierList = convertdatatable.ConvertTableToList(ds.Tables[0])
                        });
                    }
                }

                return Ok(new
                {
                    result = true,
                    SupplierList = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }


        [HttpPost]
        [Route("GeneratePurchaseOrderReport")]
        public IActionResult GeneratePurchaseOrderReport([FromBody] PurchaseorderReport request)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                if (request == null || string.IsNullOrWhiteSpace(request.FROMDATE) || string.IsNullOrWhiteSpace(request.TODATE))
                {
                    return BadRequest(new { result = false, message = "From Date and To Date are required." });
                }

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[REPORTS].[PURCHASEORDER_GENERATE]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@FROMDATE", string.IsNullOrWhiteSpace(request.FROMDATE) ? DBNull.Value : request.FROMDATE);
                    cmd.Parameters.AddWithValue("@TODATE", string.IsNullOrWhiteSpace(request.TODATE) ? DBNull.Value : request.TODATE);

                    string supplierParam = string.IsNullOrWhiteSpace(request.SUPPLIER) ? null : request.SUPPLIER.Trim();
                    cmd.Parameters.AddWithValue("@SUPPLIER", (object)supplierParam ?? DBNull.Value);

                    conn.Open();
                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            resultData = convertdatatable.ConvertTableToList(ds.Tables[0])
                        });
                    }
                }

                return Ok(new
                {
                    result = false,
                    message = "No records found for the selected criteria",
                    resultData = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }
    }
}

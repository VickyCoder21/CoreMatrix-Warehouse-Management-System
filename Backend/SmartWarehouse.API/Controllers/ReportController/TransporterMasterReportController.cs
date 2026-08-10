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
    public class TransporterMasterReportController : BaseController
    {
        public TransporterMasterReportController(IConfiguration configuration) : base(configuration)
        {
        }

        [HttpGet]
        [Route("TransporterMasterReportPageLoad")]
        public IActionResult TransporterMasterReportPageLoad()
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[REPORTS].[TRANSPORTERMASTER_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    conn.Open();

                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    return Ok(new
                    {
                        result = true,
                        TransporterList = ds.Tables.Count > 0 ? convertdatatable.ConvertTableToList(ds.Tables[0]) : new List<Dictionary<string, object>>(),
                        StatusList = ds.Tables.Count > 1 ? convertdatatable.ConvertTableToList(ds.Tables[1]) : new List<Dictionary<string, object>>()
                    });
                }
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

        [HttpPost]
        [Route("GenerateTransporterMasterReport")]
        public IActionResult GenerateTransporterMasterReport([FromBody] TransportermasterReport request)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[REPORTS].[TRANSPORTERMASTER_GENERATE]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@TRANSPORTERCODE",string.IsNullOrWhiteSpace(request.TRANSPORTERCODE) ? DBNull.Value : request.TRANSPORTERCODE.Trim());

                    cmd.Parameters.AddWithValue(
                        "@STATUS",
                        string.IsNullOrWhiteSpace(request.STATUS)
                            ? DBNull.Value
                            : request.STATUS.Trim());

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
                    message = "No records found.",
                    resultData = new List<object>()
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
    }
}

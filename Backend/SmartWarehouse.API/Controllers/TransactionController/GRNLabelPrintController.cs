using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Data;
using SmartWarehouse.API.Models;
using System.Data;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;

namespace SmartWarehouse.API.Controllers.TransactionController
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GRNLabelPrintController : BaseController
    {
        private readonly IConfiguration _configuration;
        public GRNLabelPrintController(IConfiguration configuration) : base(configuration) { }

        [HttpGet]
        [Route("GRNLabelPrintPageload")]
        public IActionResult GRNLabelPrintPageload(int pageNumber = 1, int pageSize = 50)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRNLABELPRINT_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PageNumber", pageNumber);
                    cmd.Parameters.AddWithValue("@PageSize", pageSize);
                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds.Tables.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            GrnDetails = ds.Tables.Count > 0 ? convertdatatable.ConvertTableToList(ds.Tables[0]) : new List<Dictionary<string, object>>(),
                            GrnSaveDetails = ds.Tables.Count > 1 ? convertdatatable.ConvertTableToList(ds.Tables[1]) : new List<Dictionary<string, object>>(),
                            TotalRecords = ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0 ? Convert.ToInt32(ds.Tables[2].Rows[0]["TotalRecords"]) : 0
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

        [HttpPost]
        [Route("GRNLabelPrintInsert")]
        public IActionResult GRNLabelPrintInsert(RequestGRNLabelPrint request)
        {
            try
            {
                using (TransactionScope scope = new TransactionScope())
                {
                    ConvertTabletoList convertdatatable = new ConvertTabletoList();
                    using (SqlConnection conn = new SqlConnection(_connectionString))
                    {
                        conn.Open();

                        int rowcount = 0;
                        DataTable barcodeTable = null;

                        foreach (var record in request.GRNDetails)
                        {
                            DataSet ds = new DataSet();

                            using (SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRNLABELPRINT_INSERT]", conn))
                            {
                                cmd.CommandType = CommandType.StoredProcedure;
                                cmd.Parameters.AddWithValue("@GRNNO", record.GRNNO);
                                cmd.Parameters.AddWithValue("@ITEMCODE", record.ITEMCODE);
                                cmd.Parameters.AddWithValue("@ITEMNAME", record.ITEMNAME);
                                cmd.Parameters.AddWithValue("@ACCEPTEDQTY", record.ACCEPTEDQTY);
                                cmd.Parameters.AddWithValue("@STUFFINGQTY", record.STUFFINGQTY);
                                cmd.Parameters.AddWithValue("@USERCODE", "ADMIN");

                                SqlDataAdapter oda = new SqlDataAdapter(cmd);
                                oda.Fill(ds);

                                if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0 && ds.Tables[0].Rows[0]["ERRORSTATUS"].ToString().Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                {
                                    rowcount++;
                                    // Save barcode details returned by SP
                                    if (ds.Tables.Count > 1)
                                    {
                                        barcodeTable = ds.Tables[1];
                                    }
                                }
                                else
                                {
                                    return BadRequest(new
                                    {
                                        result = false,
                                        message = ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0 ? ds.Tables[0].Rows[0]["ERRORNUMBER"].ToString() : "Failed to generate barcode."
                                    });
                                }
                            }
                        }

                        if (rowcount == request.GRNDetails.Count)
                        {
                            scope.Complete();
                            return Ok(new
                            {
                                result = true,
                                BarcodeDetails = barcodeTable != null ? convertdatatable.ConvertTableToList(barcodeTable) : new List<Dictionary<string, object>>()
                            });
                        }
                    }
                }
                return BadRequest(new { result = false, message = "Failed to generate barcode." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }


        [HttpPost]
        [Route("FetchGrnLabelRePrint")]
        public IActionResult FetchGrnLabelRePrint(GRNLabelRePrint request)
        {
            try
            {
                DataSet ds = new DataSet();
                    ConvertTabletoList convertdatatable = new ConvertTabletoList();
                    using (SqlConnection conn = new SqlConnection(_connectionString))
                    {
                        conn.Open();
                        using (SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRNLABELREPRINT]", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@GRNNO", request.GRNNO);
                            cmd.Parameters.AddWithValue("@ITEMCODE", request.ITEMCODE);
                            cmd.Parameters.AddWithValue("@BARCODE", request.BARCODE);

                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);
                            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                return Ok(new
                                {
                                    result = true,
                                    BarcodeDetails = convertdatatable.ConvertTableToList(ds.Tables[0]),

                                });
                            }
                        }
                    }
                return NotFound(new { result = false, message = "Data not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }
    }
}

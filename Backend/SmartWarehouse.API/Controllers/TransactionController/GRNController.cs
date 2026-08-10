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
    [Route("api/[controller]")]
    [ApiController]
    public class GRNController : BaseController
    {
        private readonly IConfiguration _configuration;
        public GRNController(IConfiguration configuration) : base(configuration) { }

        [HttpGet]
        [Route("GRNPageload")]
        public IActionResult GRNPageload(int pageNumber = 1, int pageSize = 50)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRN_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PageNumber", pageNumber);
                    cmd.Parameters.AddWithValue("@PageSize", pageSize);
                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            Grnno = ds.Tables[0].Rows[0]["GRNNO"].ToString(),
                            Invoiceno = ds.Tables[1].Rows[0]["INVOICENO"].ToString(),
                            poDetails = convertdatatable.ConvertTableToList(ds.Tables[2]),
                            TotalRecords = Convert.ToInt32(ds.Tables[3].Rows[0]["TotalRecords"]),
                            GrnDetails = convertdatatable.ConvertTableToList(ds.Tables[4])
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


        [HttpGet]
        [Route("GRNPoNoFetch")]
        public IActionResult GRNPoNoFetch(string PoNo)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRN_PONOFETCH]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PONO", PoNo);

                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            Supdetails = convertdatatable.ConvertTableToList(ds.Tables[0]),
                            Itemdetails = convertdatatable.ConvertTableToList(ds.Tables[1]),

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
        [Route("GRNInsert")]
        public IActionResult GRNInsert([FromBody] GRNEntry request)
        {

            try
            {
                DataSet ds = new DataSet();
                if (request.Autoid.ToString() == "0")
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        ConvertTabletoList convertdatatable = new ConvertTabletoList();
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRNHEADER_INSERT]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@GRNNO", request.GRNNO));
                            cmd.Parameters.Add(new SqlParameter("@GRNDATE", request.GRNDATE));
                            cmd.Parameters.Add(new SqlParameter("@INVOICENO", request.INVOICENO));
                            cmd.Parameters.Add(new SqlParameter("@INVOICEDATE", request.INVOICEDATE));
                            cmd.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIER", request.SUPPLIER));
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTER", request.TRANSPORTER));
                            cmd.Parameters.Add(new SqlParameter("@REMARKS", request.REMARKS));
                            cmd.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));
                            conn.Open();
                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);
                            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                string result = ds.Tables[0].Rows[0][0].ToString();
                                if (result.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                {

                                    foreach (var item in request.AddedItems)
                                    {
                                        DataSet dsDetail = new DataSet();
                                        SqlCommand cmdDetail = new SqlCommand("[TRANSACTIONS].[GRNDETAILS_INSERT]", conn);
                                        cmdDetail.CommandType = CommandType.StoredProcedure;
                                        cmdDetail.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                                        cmdDetail.Parameters.Add(new SqlParameter("@GRNNO", request.GRNNO));
                                        //cmdDetail.Parameters.Add(new SqlParameter("@INVOICENO", request.INVOICENO));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMCODE", item.ITEMCODE));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMNAME", item.ITEMNAME));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ORDEREDQTY", item.ORDEREDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@RECEIVEDQTY", item.RECEIVEDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ACCEPTEDQTY", item.ACCEPTEDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@REJECTEDQTY", item.REJECTEDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));

                                        SqlDataAdapter daDetail = new SqlDataAdapter(cmdDetail);
                                        daDetail.Fill(dsDetail);

                                        if (dsDetail == null || dsDetail.Tables.Count == 0 || dsDetail.Tables[0].Rows.Count == 0)
                                        {
                                            return BadRequest(new { result = false, message = $"Failed to insert item {item.ITEMCODE}" });
                                        }

                                        string detailResult = dsDetail.Tables[0].Rows[0][0].ToString();
                                        if (!detailResult.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                        {
                                            return BadRequest(new { result = false, message = $"Failed to insert item {item.ITEMCODE}" });
                                        }
                                    }

                                    scope.Complete();

                                    return Ok(new
                                    {
                                        result = true,
                                        message = ds.Tables[0].Rows[0][1].ToString()

                                    });

                                }
                            }

                        }

                    }
                    return NotFound(new { result = false, message = "No data found" });
                }
                else
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        ConvertTabletoList convertdatatable = new ConvertTabletoList();
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRNHEADER_UPDATE]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@GRNNO", request.GRNNO));
                            cmd.Parameters.Add(new SqlParameter("@GRNDATE", request.GRNDATE));
                            cmd.Parameters.Add(new SqlParameter("@INVOICENO", request.INVOICENO));
                            cmd.Parameters.Add(new SqlParameter("@INVOICEDATE", request.INVOICEDATE));
                            cmd.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIER", request.SUPPLIER));
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTER", request.TRANSPORTER));
                            cmd.Parameters.Add(new SqlParameter("@REMARKS", request.REMARKS));
                            cmd.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));
                            conn.Open();
                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);
                            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                string result = ds.Tables[0].Rows[0][0].ToString();
                                if (result.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                {

                                    foreach (var item in request.AddedItems)
                                    {
                                        DataSet dsDetail = new DataSet();
                                        SqlCommand cmdDetail = new SqlCommand("[TRANSACTIONS].[GRNDETAILS_INSERT]", conn);
                                        cmdDetail.CommandType = CommandType.StoredProcedure;
                                        cmdDetail.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                                        cmdDetail.Parameters.Add(new SqlParameter("@GRNNO", request.GRNNO));
                                        //cmdDetail.Parameters.Add(new SqlParameter("@INVOICENO", request.INVOICENO));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMCODE", item.ITEMCODE));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMNAME", item.ITEMNAME));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ORDEREDQTY", item.ORDEREDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@RECEIVEDQTY", item.RECEIVEDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ACCEPTEDQTY", item.ACCEPTEDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@REJECTEDQTY", item.REJECTEDQTY));
                                        cmdDetail.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));

                                        SqlDataAdapter daDetail = new SqlDataAdapter(cmdDetail);
                                        daDetail.Fill(dsDetail);

                                        if (dsDetail == null || dsDetail.Tables.Count == 0 || dsDetail.Tables[0].Rows.Count == 0)
                                        {
                                            return BadRequest(new { result = false, message = $"Failed to insert item {item.ITEMCODE}" });
                                        }

                                        string detailResult = dsDetail.Tables[0].Rows[0][0].ToString();
                                        if (!detailResult.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                        {
                                            return BadRequest(new { result = false, message = $"Failed to insert item {item.ITEMCODE}" });
                                        }
                                    }
                                    scope.Complete();

                                    return Ok(new
                                    {
                                        result = true,
                                        message = ds.Tables[0].Rows[0][1].ToString()

                                    });

                                }
                            }


                        }

                    }

                }
                return NotFound(new { result = false, message = ds.Tables[0].Rows[0][1].ToString() });
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
        [Route("GRNEdit")]
        public IActionResult GRNEdit(string GRNNo)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRN_EDIT]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@GRNNO", GRNNo);

                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            headerdetails = convertdatatable.ConvertTableToList(ds.Tables[0]),
                            itemdetails = convertdatatable.ConvertTableToList(ds.Tables[1]),

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

        [HttpGet]
        [Route("GRNView")]
        public IActionResult GRNView(string GRNNo)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[GRN_DETAILSVIEW]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@GRNNO", GRNNo);

                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            itemdetails = convertdatatable.ConvertTableToList(ds.Tables[0]),
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

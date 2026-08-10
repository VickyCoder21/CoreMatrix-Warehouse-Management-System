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
    public class PurchaseOrderController : BaseController
    {
        private readonly IConfiguration _configuration;
        public PurchaseOrderController(IConfiguration configuration) : base(configuration) { }

        [HttpGet]
        [Route("PurchaseOrderPageLoad")]
        public IActionResult PurchaseOrderPageLoad(int PageNumber = 1, int PageSize = 50)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@PageNumber", PageNumber);
                    cmd.Parameters.AddWithValue("@PageSize", PageSize);

                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    return Ok(new
                    {
                        result = true,
                        pono = ds.Tables[0].Rows[0]["PONO"].ToString(),
                        supplierList = convertdatatable.ConvertTableToList(ds.Tables[1]),
                        transporterList = convertdatatable.ConvertTableToList(ds.Tables[2]),
                        itemList = convertdatatable.ConvertTableToList(ds.Tables[3]),
                        terms = convertdatatable.ConvertTableToList(ds.Tables[4]),
                        dispatch = convertdatatable.ConvertTableToList(ds.Tables[5]),
                        delivery = convertdatatable.ConvertTableToList(ds.Tables[6]),
                        totalRecords = Convert.ToInt32(ds.Tables[7].Rows[0]["TotalRecords"]),
                        poDetails = convertdatatable.ConvertTableToList(ds.Tables[8])

                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("PurchaseOrderFetch")]
        public IActionResult PurchaseOrderFetch(string itemcode)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_FETCHITEM]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ITEMCODE", itemcode);

                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            itemfetchdetails = convertdatatable.ConvertTableToList(ds.Tables[0]),

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
        [Route("PurchaseOrderInsert")]
        public IActionResult PurchaseOrderInsert([FromBody] PurchaseorderDt request)
        {

            try
            {
                DataSet ds = new DataSet();
                if (request.AUTOID == 0)
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        ConvertTabletoList convertdatatable = new ConvertTabletoList();
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_HEADERINSERT]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                            cmd.Parameters.Add(new SqlParameter("@PODATE", request.PODATE));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERCODE", request.SUPPLIERCODE));
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTERCODE", request.TRANSPORTERCODE));
                            cmd.Parameters.Add(new SqlParameter("@GSTNO", request.GSTNO));
                            cmd.Parameters.Add(new SqlParameter("@TERMSOFPAYMENT", request.TERMSOFPAYMENT));
                            cmd.Parameters.Add(new SqlParameter("@DISPATCHTHROUGH", request.DISPATCHTHROUGH));
                            cmd.Parameters.Add(new SqlParameter("@DELIVERY", request.DELIVERY));
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
                                        SqlCommand cmdDetail = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_DETAILSINSERT]", conn);
                                        cmdDetail.CommandType = CommandType.StoredProcedure;
                                        cmdDetail.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMCODE", item.ITEMCODE.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMNAME", item.ITEMNAME.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@QUANTITY", item.QUANTITY.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@UNITPRICE", item.UNITPRICE.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@TOTALAMOUNT", item.TOTALAMOUNT.Trim()));
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
                            SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_HEADERUPDATE]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@AUTOID", request.AUTOID));
                            cmd.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                            cmd.Parameters.Add(new SqlParameter("@PODATE", request.PODATE));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERCODE", request.SUPPLIERCODE));
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTERCODE", request.TRANSPORTERCODE));
                            cmd.Parameters.Add(new SqlParameter("@GSTNO", request.GSTNO));
                            cmd.Parameters.Add(new SqlParameter("@TERMSOFPAYMENT", request.TERMSOFPAYMENT));
                            cmd.Parameters.Add(new SqlParameter("@DISPATCHTHROUGH", request.DISPATCHTHROUGH));
                            cmd.Parameters.Add(new SqlParameter("@DELIVERY", request.DELIVERY));
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
                                        SqlCommand cmdDetail = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_DETAILSINSERT]", conn);
                                        cmdDetail.CommandType = CommandType.StoredProcedure;
                                        cmdDetail.Parameters.Add(new SqlParameter("@PONO", request.PONO));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMCODE", item.ITEMCODE.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@ITEMNAME", item.ITEMNAME.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@QUANTITY", item.QUANTITY.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@UNITPRICE", item.UNITPRICE.Trim()));
                                        cmdDetail.Parameters.Add(new SqlParameter("@TOTALAMOUNT", item.TOTALAMOUNT.Trim()));
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
                return NotFound(new { result = false, message = "Update failed" });
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
        [Route("PurchaseOrderEdit")]
        public IActionResult PurchaseOrderEdit(string PONO)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_EDIT]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PONO", PONO);

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
        [Route("PurchaseOrderView")]
        public IActionResult PurchaseOrderView(string PONO)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[TRANSACTIONS].[PURCHASEORDER_DETAILSVIEW]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PONO", PONO);

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

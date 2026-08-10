using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Data;
using SmartWarehouse.API.Models;
using System.Data;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;

namespace SmartWarehouse.API.Controllers.MasterController
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ItemMasterController : BaseController
    {
        private readonly IConfiguration _configuration;
        public ItemMasterController(IConfiguration configuration) : base(configuration) { }


        [HttpGet]
        [Route("ItemMasterPageload")]
        public IActionResult ItemMasterPageload(int page = 1, int pageSize = 50)
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[MASTERS].[ITEMMASTER_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PageNumber", page);
                    cmd.Parameters.AddWithValue("@PageSize", pageSize);
                    conn.Open();

                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[3].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            RecordStatus = convertdatatable.ConvertTableToList(ds.Tables[0]),
                            UOM = convertdatatable.ConvertTableToList(ds.Tables[1]),
                            ItemType = convertdatatable.ConvertTableToList(ds.Tables[2]),
                            ItemDetails = convertdatatable.ConvertTableToList(ds.Tables[3]),
                            TotalRecords = ds.Tables.Count > 4 ? Convert.ToInt32(ds.Tables[4].Rows[0]["TotalCount"]) : 0,
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
        [Route("ItemMasterInsert")]
        public IActionResult ItemMasterInsert([FromBody] Itemmaster itemmaster)
        {
            try
            {
                DataSet ds = new DataSet();

                if (itemmaster.Autoid.ToString() == "0")
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        ConvertTabletoList convertdatatable = new ConvertTabletoList();
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[MASTERS].[ITEMMASTER_INSERT]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@ITEMCODE", itemmaster.itemcode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@ITEMNAME", itemmaster.itemname.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STUFFINGQTY", itemmaster.stuffingqty.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@UOM", itemmaster.uom.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@ITEMTYPE", itemmaster.itemtype.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", itemmaster.Status.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));
                            conn.Open();
                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);
                            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                string result = ds.Tables[0].Rows[0][0].ToString();
                                if (result.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                {
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

                else
                {
                    using (TransactionScope scope = new TransactionScope())
                    {
                        ConvertTabletoList convertdatatable = new ConvertTabletoList();
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[MASTERS].[ITEMMASTER_UPDATE]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@ITEMCODE", itemmaster.itemcode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@ITEMNAME", itemmaster.itemname.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STUFFINGQTY", itemmaster.stuffingqty.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@UOM", itemmaster.uom.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@ITEMTYPE", itemmaster.itemtype.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", itemmaster.Status.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@AUTOID", itemmaster.Autoid));
                            cmd.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));
                            conn.Open();
                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);
                            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                string result = ds.Tables[0].Rows[0][0].ToString();
                                if (result.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                {
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
    }
}

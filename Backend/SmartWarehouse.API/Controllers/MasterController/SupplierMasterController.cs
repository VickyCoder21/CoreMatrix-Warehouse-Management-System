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
    public class SupplierMasterController : BaseController
    {
        private readonly IConfiguration _configuration;

        public SupplierMasterController(IConfiguration configuration) : base(configuration)
        {
        }


        [HttpGet]
        [Route("SupplierMasterPageload")]
        public IActionResult SupplierMasterPageload(int pageNumber = 1, int pageSize = 50)
        {
            try
            {


                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[MASTERS].[SUPPLIERMASTER_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PageNumber", pageNumber);
                    cmd.Parameters.AddWithValue("@PageSize", pageSize);
                    conn.Open();

                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            RecordStatus = convertdatatable.ConvertTableToList(ds.Tables[0]),
                            SupplierDetails = convertdatatable.ConvertTableToList(ds.Tables[1]),
                            TotalRecords = ds.Tables.Count > 2 ? Convert.ToInt32(ds.Tables[2].Rows[0]["TotalCount"]) : 0,
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
        [Route("SupplierMasterInsert")]
        public IActionResult SupplierMasterInsert(Suppliermaster supplierMaster)
        {
            try
            {

                DataSet ds = new DataSet();

                if (supplierMaster.Autoid.ToString() == "0")
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        ConvertTabletoList convertdatatable = new ConvertTabletoList();
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[MASTERS].[SUPPLIERMASTER_INSERT]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERCODE", supplierMaster.Suppliercode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERNAME", supplierMaster.Suppliername.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERADDRESS", supplierMaster.Supplieraddress.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTPERSON", supplierMaster.Contactperson.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTNO", supplierMaster.Contactno.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@EMAILID", supplierMaster.Emailid.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@GSTNO", supplierMaster.GSTNo.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", supplierMaster.Status.Trim()));
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
                            SqlCommand cmd = new SqlCommand("[MASTERS].[SUPPLIERMASTER_UPDATE]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@AUTOID", supplierMaster.Autoid));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERCODE", supplierMaster.Suppliercode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERNAME", supplierMaster.Suppliername.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@SUPPLIERADDRESS", supplierMaster.Supplieraddress.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTPERSON", supplierMaster.Contactperson.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTNO", supplierMaster.Contactno.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@EMAILID", supplierMaster.Emailid.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@GSTNO", supplierMaster.GSTNo.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", supplierMaster.Status.Trim()));
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

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
    public class TransporterMasterController : BaseController
    {
        private readonly IConfiguration _configuration;

        public TransporterMasterController(IConfiguration configuration) : base(configuration)
        {
        }


        [HttpGet]
        [Route("TransporterMasterPageload")]
        public IActionResult TransporterMasterPageload(int pageNumber = 1, int pageSize = 50)
        {
            try
            {


                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[MASTERS].[TRANSPORTERMASTER_PAGELOAD]", conn);
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
                            TransporterDetails = convertdatatable.ConvertTableToList(ds.Tables[1]),
                            TotalRecords = ds.Tables.Count > 1 ? Convert.ToInt32(ds.Tables[2].Rows[0]["TotalCount"]) : 0,
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
        [Route("TransporterMasterInsert")]
        public IActionResult TransporterMasterInsert(Transportermaster transportermaster)
        {
            try
            {

                DataSet ds = new DataSet();

                if (transportermaster.AutoId.ToString() == "0")
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        ConvertTabletoList convertdatatable = new ConvertTabletoList();
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[MASTERS].[TRANSPORTERMASTER_INSERT]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTERCODE", transportermaster.TransporterCode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTERNAME", transportermaster.TransporterName.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTPERSON", transportermaster.ContactPerson.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTNO", transportermaster.ContactNo.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@EMAILID", transportermaster.EmailId.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@ADDRESS", transportermaster.Address.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", transportermaster.Status.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));
                            conn.Open();
                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);
                            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                string status = ds.Tables[0].Rows[0]["ERRORSTATUS"].ToString();
                                string message = ds.Tables[0].Rows[0]["ERRORNUMBER"].ToString();

                                if (status.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                {
                                    scope.Complete();
                                    return Ok(new
                                    {
                                        result = true,
                                        message = message
                                    });
                                }
                                else
                                {
                                    return Ok(new
                                    {
                                        result = false,
                                        message = message
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
                            SqlCommand cmd = new SqlCommand("[MASTERS].[TRANSPORTERMASTER_UPDATE]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@AUTOID", transportermaster.AutoId));
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTERCODE", transportermaster.TransporterCode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@TRANSPORTERNAME", transportermaster.TransporterName.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTPERSON", transportermaster.ContactPerson.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTNO", transportermaster.ContactNo.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@EMAILID", transportermaster.EmailId.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@ADDRESS", transportermaster.Address.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", transportermaster.Status.Trim()));
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

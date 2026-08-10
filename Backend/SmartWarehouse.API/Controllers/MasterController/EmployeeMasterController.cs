using SmartWarehouse.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Data;
using System.Data;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;

namespace SmartWarehouse.API.Controllers.MasterController
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeMasterController : BaseController
    {
        //private readonly IConfiguration _configuration;

        public EmployeeMasterController(IConfiguration configuration) : base(configuration)
        {
        }


        [HttpGet]
        [Route("EmployeeMasterPageload")]
        public IActionResult EmployeeMasterPageload(int pageNumber = 1, int pageSize = 50)
        {
            try
            {

                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[MASTERS].[EMPLOYEEMASTER_PAGELOAD]", conn);
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
                            EmployeeDetails = convertdatatable.ConvertTableToList(ds.Tables[1]),
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
        [Route("EmployeeMasterInsert")]
        public IActionResult EmployeeMasterInsert(Employeemaster employeemaster)
        {
            try
            {

                DataSet ds = new DataSet();

                if (employeemaster.Autoid.ToString() == "0")
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[MASTERS].[EMPLOYEEMASTER_INSERT]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEECODE", employeemaster.Employeecode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEENAME", employeemaster.Employeename.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@DEPARTMENT", employeemaster.Department.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@DESIGNATION", employeemaster.Designation.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTNUMBER", employeemaster.Contactno.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@EMAILID", employeemaster.Emailid.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@RECORDSTATUS", employeemaster.Status.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));
                            conn.Open();
                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);
                            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                string result = ds.Tables[0].Rows[0][0]?.ToString() ?? "";
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
                    return NotFound(new { result = false, message = "No data found" });

                }

                else
                {
                    using (TransactionScope scope = new TransactionScope())
                    {
                        using (SqlConnection conn = new SqlConnection(_connectionString))
                        {
                            SqlCommand cmd = new SqlCommand("[MASTERS].[EMPLOYEEMASTER_UPDATE]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@AUTOID", employeemaster.Autoid));
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEECODE", employeemaster.Employeecode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEENAME", employeemaster.Employeename.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@DEPARTMENT", employeemaster.Department.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@DESIGNATION", employeemaster.Designation.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONTACTNUMBER", employeemaster.Contactno.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@EMAILID", employeemaster.Emailid.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@RECORDSTATUS", employeemaster.Status.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERCODE", "Admin"));
                            conn.Open();
                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                            oda.Fill(ds);

                            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                            {
                                string result = ds.Tables[0].Rows[0][0]?.ToString() ?? "";
                                if (result.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                                {
                                    scope.Complete();
                                    return Ok(new
                                    {
                                        result = true,
                                        message = ds.Tables[0].Rows[0][1]?.ToString() ?? ""
                                    });
                                }
                                return NotFound(new
                                {
                                    result = false,
                                    message = ds.Tables[0].Rows[0][1]?.ToString() ?? "Update failed"
                                });
                            }
                        }
                    }
                    return NotFound(new { result = false, message = "No data found" });
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



    }

}

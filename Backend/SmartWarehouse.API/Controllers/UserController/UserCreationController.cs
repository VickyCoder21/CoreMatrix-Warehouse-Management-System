using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SmartWarehouse.API.Data;
using SmartWarehouse.API.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;

namespace SmartWarehouse.API.Controllers.UserController
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserCreationController : BaseController
    {
        private readonly IConfiguration _configuration;

        public UserCreationController(IConfiguration configuration) : base(configuration)
        {

        }


        [HttpGet]
        [Route("UserCreationPageload")]
        public IActionResult UserCreationPageload(int pageNumber = 1, int pageSize = 50)
        {
            try
            {


                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[USERS].[USERCREATION_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PageNumber", pageNumber);
                    cmd.Parameters.AddWithValue("@PageSize", pageSize);
                    conn.Open();

                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            EmployeeCodedetails = convertdatatable.ConvertTableToList(ds.Tables[0]),
                            RecordStatus = convertdatatable.ConvertTableToList(ds.Tables[1]),
                            EmployeeDetails = convertdatatable.ConvertTableToList(ds.Tables[2]),
                            TotalRecords = ds.Tables.Count > 1 ? Convert.ToInt32(ds.Tables[3].Rows[0]["TotalCount"]) : 0,
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
        [Route("UserCreationInsert")]
        public IActionResult UserCreationInsert(UserCreation usercreation)
        {
            try
            {
                DataSet ds = new DataSet();

                using (TransactionScope scope = new TransactionScope())
                {

                    ConvertTabletoList convertdatatable = new ConvertTabletoList();
                    using (SqlConnection conn = new SqlConnection(_connectionString))
                    {
                        if (usercreation.Autoid == 0)
                        {
                            SqlCommand cmd = new SqlCommand("[USERS].[USERCREATION_INSERT]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEECODE", usercreation.Employeecode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEENAME", usercreation.Employeename.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERNAME", usercreation.Username.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERPASSWORD", usercreation.Password.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONFIRMPASSWORD", usercreation.Confirmpassword.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", usercreation.Status.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CREATEDBY", "Admin"));
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
                        else
                        {
                            SqlCommand cmd = new SqlCommand("[USERS].[USERCREATION_UPDATE]", conn);
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add(new SqlParameter("@AUTOID", usercreation.Autoid));
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEECODE", usercreation.Employeecode.Trim().ToUpper()));
                            cmd.Parameters.Add(new SqlParameter("@EMPLOYEENAME", usercreation.Employeename.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERNAME", usercreation.Username.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@USERPASSWORD", usercreation.Password.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CONFIRMPASSWORD", usercreation.Confirmpassword.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@STATUS", usercreation.Status.Trim()));
                            cmd.Parameters.Add(new SqlParameter("@CREATEDBY", "Admin"));
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

        [HttpGet]
        [Route("GetUserById/{id}")]
        public IActionResult GetUserById(int id)
        {
            try
            {
                DataSet ds = new DataSet();

                using (TransactionScope scope = new TransactionScope())
                {

                    ConvertTabletoList convertdatatable = new ConvertTabletoList();
                    using (SqlConnection conn = new SqlConnection(_connectionString))
                    {
                        SqlCommand cmd = new SqlCommand("[USERS].[USERCREATION_FETCHEMPLOYEECODE]", conn);
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@AUTOID", id));
                        conn.Open();
                        SqlDataAdapter oda = new SqlDataAdapter(cmd);
                        oda.Fill(ds);
                        if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                        {
                            scope.Complete();
                            return Ok(new
                            {
                                result = true,
                                UserDetails = convertdatatable.ConvertTableToList(ds.Tables[0]),

                            });
                        }

                    }

                }
                return NotFound(new { result = false, message = "data not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }

    }
}

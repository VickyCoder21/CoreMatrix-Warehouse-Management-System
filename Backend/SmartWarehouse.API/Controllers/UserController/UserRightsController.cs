using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Data;
using SmartWarehouse.API.Models;
using System.Data;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;

namespace SmartWarehouse.API.Controllers.UserController
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserRightsController : BaseController
    {
        private readonly IConfiguration _configuration;

        public UserRightsController(IConfiguration configuration) : base(configuration)
        {

        }
        [HttpGet]
        [Route("UserrightsPageload")]
        public IActionResult UserrightsPageload()
        {
            try
            {

                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("[USERS].[USERAUTHENTICATION_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();

                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Ok(new
                        {
                            result = true,
                            Usernamesdetails = convertdatatable.ConvertTableToList(ds.Tables[0]),

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
        [Route("GetUserByUername/{username}")]
        public IActionResult GetUserByUername(string username)
        {
            try
            {
                DataSet ds = new DataSet();


                using (TransactionScope scope = new TransactionScope())
                {

                    ConvertTabletoList convertdatatable = new ConvertTabletoList();
                    using (SqlConnection conn = new SqlConnection(_connectionString))
                    {
                        SqlCommand cmd = new SqlCommand("[USERS].[USERAUTHENTICATION_FETCHSCREENDETAILSBYUSERNAME]", conn);
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@USERNAME", username));
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

        [HttpPost]
        [Route("GetUserInsert")]
        public IActionResult GetUserInsert(ReuestUserRights request)
        {
            try
            {
                DataSet ds = new DataSet();
                using (TransactionScope scope = new TransactionScope())
                {
                    ConvertTabletoList convertdatatable = new ConvertTabletoList();
                    using (SqlConnection conn = new SqlConnection(_connectionString))
                    {
                        conn.Open();
                        int rowcount = 0;
                        SqlCommand cmd1 = new SqlCommand("[USERS].[USERAUTHENTICATION_DELETE]", conn);
                        cmd1.CommandType = CommandType.StoredProcedure;
                        cmd1.Parameters.Add(new SqlParameter("@USERNAME", request.USERNAME));
                        SqlDataAdapter oda1 = new SqlDataAdapter(cmd1);
                        DataSet ds1 = new DataSet();
                        oda1.Fill(ds1);
                        if (ds1 != null)
                        {
                            if (ds1.Tables[0].Rows[0][0].ToString() == "SUCCESS")
                            {
                                foreach (var record in request.SCREENRIGHTS)
                                {
                                    if (record.VIEW == "true")
                                    {
                                        using (SqlCommand cmd = new SqlCommand("[USERS].[USERAUTHENTICATION_INSERT]", conn))
                                        {
                                            cmd.CommandType = CommandType.StoredProcedure;
                                            cmd.Parameters.AddWithValue("@SCREENID", record.SCREENID);
                                            cmd.Parameters.AddWithValue("@SCREENNAME", record.SCREENNAME);
                                            cmd.Parameters.AddWithValue("@FUNCTIONNAME", record.FUNCTIONNAME);
                                            cmd.Parameters.AddWithValue("@USERVIEW", record.VIEW);
                                            cmd.Parameters.AddWithValue("@USERNAME", request.USERNAME);

                                            SqlDataAdapter oda = new SqlDataAdapter(cmd);
                                            oda.Fill(ds);
                                            if (ds != null)
                                            {
                                                if (ds.Tables[0].Rows[ds.Tables[0].Rows.Count - 1][0].ToString() == "SUCCESS")
                                                {
                                                    rowcount++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (ds.Tables[0].Rows[ds.Tables[0].Rows.Count - 1][0].ToString() == "SUCCESS" && request.SCREENRIGHTS.Count == rowcount)
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

                return NotFound(new { result = false, message = "Data not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }
    }
}

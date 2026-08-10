using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Data;
using SmartWarehouse.API.Models;
using System.Data;
using SmartWarehouse.API.Helpers;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public LoginController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("Login")]
    public IActionResult Login([FromBody] LoginCheck request)
    {
        try
        {
            DataSet ds = new DataSet();
            ConvertTabletoList convertdatatable = new ConvertTabletoList();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                SqlCommand cmd = new SqlCommand("[USERS].[LOGIN_CHECK]", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@USERNAME", request.Username.Trim().ToUpper());
                cmd.Parameters.AddWithValue("@USERPASSWORD", request.Password.Trim());

                conn.Open();

                SqlDataAdapter oda = new SqlDataAdapter(cmd);
                oda.Fill(ds);

                if (ds.Tables.Count > 0 &&
                    ds.Tables[0].Rows.Count > 0 &&
                    ds.Tables[0].Rows[0]["ERRORSTATUS"].ToString() == "SUCCESS")
                {
                    // Generate JWT Token
                    JwtTokenGenerator jwt = new JwtTokenGenerator(_configuration);

                    string token = jwt.GenerateToken(
                        ds.Tables[0].Rows[0]["USERNAME"].ToString(),
                        ds.Tables[0].Rows[0]["EMPLOYEECODE"].ToString()
                    );

                    return Ok(new
                    {
                        result = true,
                        message = "Login Successful",

                        // JWT Token
                        token = token,

                        // User Details
                        loginDetails = convertdatatable.ConvertTableToList(ds.Tables[0]),

                        // Screen Rights
                        screenDetails = ds.Tables.Count > 1
                            ? convertdatatable.ConvertTableToList(ds.Tables[1])
                            : new List<Dictionary<string, object>>()
                    });
                }

                return Unauthorized(new
                {
                    result = false,
                    message = "Invalid Username or Password"
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
}
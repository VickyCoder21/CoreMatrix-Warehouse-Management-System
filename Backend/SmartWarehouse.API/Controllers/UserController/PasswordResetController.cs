using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SmartWarehouse.API.Data;
using System.Data;
using System.IdentityModel.Tokens.Jwt;


namespace SmartWarehouse.API.Controllers.UserController
{

    public class PasswordResetRequestDto
    {
        public string Username { get; set; }
    }

    public class PasswordResetApproveDto
    {
        public int AutoId { get; set; }
        public string NewPassword { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PasswordResetController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public PasswordResetController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Public — a locked-out user can't be required to log in to ask for help
        [AllowAnonymous]
        [HttpPost]
        [Route("RequestReset")]
        public IActionResult RequestReset([FromBody] PasswordResetRequestDto request)
        {
            try
            {
                DataSet ds = new DataSet();
                using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
                {
                    SqlCommand cmd = new SqlCommand("[USERS].[PASSWORDRESET_REQUEST_INSERT]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@USERNAME", request.Username.Trim().ToUpper());
                    conn.Open();

                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        var status = ds.Tables[0].Rows[0]["ERRORSTATUS"].ToString();
                        var message = ds.Tables[0].Rows[0]["ERRORMESSAGE"].ToString();

                        if (status == "SUCCESS")
                            return Ok(new { result = true, message });

                        return BadRequest(new { result = false, message });
                    }
                }

                return StatusCode(500, new { result = false, message = "Unexpected error." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }

        // Admin-only — requires a valid token, same as every other protected controller
        [Authorize]
        [HttpGet]
        [Route("PasswordResetPageload")]
        public IActionResult PasswordResetPageload()
        {
            try
            {
                DataSet ds = new DataSet();
                ConvertTabletoList convertdatatable = new ConvertTabletoList();

                using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
                {
                    SqlCommand cmd = new SqlCommand("[USERS].[PASSWORDRESET_PAGELOAD]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();

                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    return Ok(new
                    {
                        result = true,
                        requestDetails = ds.Tables.Count > 0
                            ? convertdatatable.ConvertTableToList(ds.Tables[0])
                            : new List<Dictionary<string, object>>()
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        [Route("ApproveReset")]
        public IActionResult ApproveReset([FromBody] PasswordResetApproveDto request)
        {
            try
            {
                // JwtTokenGenerator sets the username under the standard "sub"
                // claim, not ClaimTypes.Name — so User.Identity.Name would be
                // null here. Read it directly off the "sub" claim instead.
                var adminUsername = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? "ADMIN";

                DataSet ds = new DataSet();
                using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
                {
                    SqlCommand cmd = new SqlCommand("[USERS].[PASSWORDRESET_APPROVE]", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@AUTOID", request.AutoId);
                    cmd.Parameters.AddWithValue("@NEWPASSWORD", request.NewPassword.Trim());
                    cmd.Parameters.AddWithValue("@ADMINUSERNAME", adminUsername);
                    conn.Open();

                    SqlDataAdapter oda = new SqlDataAdapter(cmd);
                    oda.Fill(ds);

                    if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        var status = ds.Tables[0].Rows[0]["ERRORSTATUS"].ToString();
                        var message = ds.Tables[0].Rows[0]["ERRORMESSAGE"].ToString();

                        if (status == "SUCCESS")
                            return Ok(new { result = true, message });

                        return BadRequest(new { result = false, message });
                    }
                }

                return StatusCode(500, new { result = false, message = "Unexpected error." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { result = false, message = ex.Message });
            }
        }
    }
}

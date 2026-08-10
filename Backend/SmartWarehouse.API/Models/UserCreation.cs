using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartWarehouse.API.Models
{
    [Keyless]
    [Table("USERCREATION", Schema = "USERS")]
    public partial class UserCreation
    {
        [Column("AUTOID")]
        public int Autoid { get; set; }

        [Column("EMPLOYEECODE")]
        [StringLength(50)]
        [Unicode(false)]
        public string Employeecode { get; set; } = null!;

        [Column("EMPLOYEENAME")]
        [StringLength(50)]
        [Unicode(false)]
        public string Employeename { get; set; }

        [Column("USERNAME")]
        [StringLength(50)]
        [Unicode(false)]
        public string Username { get; set; }

        [Column("USERPASSWORD")]
        [StringLength(50)]
        [Unicode(false)]
        public string Password { get; set; }

        [Column("CONFIRMPASSWORD")]
        [StringLength(50)]
        [Unicode(false)]
        public string Confirmpassword { get; set; }

        [Column("STATUS")]
        [StringLength(50)]
        [Unicode(false)]
        public string Status { get; set; }

    }
}

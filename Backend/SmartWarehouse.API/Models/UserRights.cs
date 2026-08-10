using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartWarehouse.API.Models
{
    [Keyless]
    [Table("USERAUTHENTICATION", Schema = "USERS")]
    public partial class UserRights
    {
        [Column("SCREENID")]
        [StringLength(20)]
        [Unicode(false)]
        public string SCREENID { get; set; } = null!;

        [Column("SCREENNAME")]
        [StringLength(50)]
        [Unicode(false)]
        public string SCREENNAME { get; set; }


        [Column("FUNCTIONNAME")]
        [StringLength(50)]
        [Unicode(false)]
        public string FUNCTIONNAME { get; set; }


        [Column("USERVIEW")]
        public string VIEW { get; set; }
    }

    public class ReuestUserRights
    {
        public string USERNAME { get; set; }
        public List<UserRights> SCREENRIGHTS { get; set; }
    }
}

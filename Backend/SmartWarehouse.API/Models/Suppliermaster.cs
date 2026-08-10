using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartWarehouse.API.Models
{
    [Keyless]
    [Table("SUPPLIERMASTER", Schema = "MASTERS")]
    public partial class Suppliermaster
    {
        [Key]
        [Column("AUTOID")]
        public int Autoid { get; set; }

        [Column("SUPPLIERCODE")]
        [StringLength(50)]
        [Unicode(false)]
        public string Suppliercode { get; set; }

        [Column("SUPPLIERNAME")]
        [StringLength(100)]
        [Unicode(false)]
        public string Suppliername { get; set; }

        [Column("SUPPLIERADDRESS")]
        [StringLength(200)]
        [Unicode(false)]
        public string Supplieraddress { get; set; }

        [Column("CONTACTPERSON")]
        [StringLength(100)]
        [Unicode(false)]
        public string Contactperson { get; set; }

        [Column("CONTACTNO")]
        [StringLength(20)]
        [Unicode(false)]
        public string Contactno { get; set; }

        [Column("EMAILID")]
        [StringLength(100)]
        [Unicode(false)]
        public string Emailid { get; set; }

        [Column("GSTNO")]
        [StringLength(50)]
        [Unicode(false)]
        public string GSTNo { get; set; }

        [Column("STATUS")]
        [StringLength(100)]
        [Unicode(false)]
        public string Status { get; set; }

    }
}

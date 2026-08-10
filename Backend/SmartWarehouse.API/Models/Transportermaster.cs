using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartWarehouse.API.Models
{
    [Keyless]
    [Table("TRANSPORTERMASTER", Schema = "MASTERS")]
    public partial class Transportermaster
    {
        [Column("AUTOID")]
        public int AutoId { get; set; }

        [Column("TRANSPORTERCODE")]
        [StringLength(50)]
        [Unicode(false)]
        public string TransporterCode { get; set; }

        [Column("TRANSPORTERNAME")]
        [StringLength(100)]
        [Unicode(false)]
        public string TransporterName { get; set; }

        [Column("CONTACTPERSON")]
        [StringLength(50)]
        [Unicode(false)]
        public string ContactPerson { get; set; }

        [Column("CONTACTNO")]
        [StringLength(10)]
        public string ContactNo { get; set; }

        [Column("EMAILID")]
        [StringLength(50)]
        [Unicode(false)]
        public string EmailId { get; set; }

        [Column("ADDRESS")]
        [StringLength(50)]
        [Unicode(false)]
        public string Address { get; set; }


        [Column("STATUS")]
        [StringLength(100)]
        [Unicode(false)]
        public string Status { get; set; }

    }
}

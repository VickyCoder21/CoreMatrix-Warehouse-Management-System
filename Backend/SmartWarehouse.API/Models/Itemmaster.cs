using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartWarehouse.API.Models
{
    [Keyless]
    [Table("ITEMMASTER", Schema = "MASTERS")]
    public partial class Itemmaster
    {
        [Column("AUTOID")]
        public int Autoid { get; set; }

        [Column("ITEMCODE")]
        [StringLength(100)]
        [Unicode(false)]
        public string itemcode { get; set; }

        [Column("ITEMNAME")]
        [StringLength(200)]
        [Unicode(false)]
        public string itemname { get; set; }

        [Column("STUFFINGQTY")]
        [StringLength(200)]
        [Unicode(false)]
        public string stuffingqty { get; set; }

        [Column("UOM")]
        [StringLength(100)]
        [Unicode(false)]
        public string uom { get; set; }

        [Column("ITEMTYPE")]
        [StringLength(100)]
        [Unicode(false)]
        public string itemtype { get; set; }

        [Column("STATUS")]
        [StringLength(100)]
        [Unicode(false)]
        public string Status { get; set; }

    }
}
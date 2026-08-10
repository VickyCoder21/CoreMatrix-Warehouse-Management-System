using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SmartWarehouse.API.Models;

[Keyless]
[Table("EMPLOYEEMASTER", Schema = "MASTERS")]
public partial class Employeemaster
{
    [Column("AUTOID")]
    public int Autoid { get; set; }

    [Column("EMPLOYEECODE")]
    [StringLength(50)]
    [Unicode(false)]
    public string Employeecode { get; set; }

    [Column("EMPLOYEENAME")]
    [StringLength(100)]
    [Unicode(false)]
    public string Employeename { get; set; }

    [Column("DEPARTMENT")]
    [StringLength(50)]
    [Unicode(false)]
    public string Department { get; set; }

    [Column("EMAILID")]
    [StringLength(50)]
    [Unicode(false)]
    public string Emailid { get; set; }

    [Column("CONTACTNO")]
    [StringLength(10)]
    public string Contactno { get; set; }

    [Column("DESIGNATION")]
    [StringLength(50)]
    [Unicode(false)]
    public string Designation { get; set; }

    [Column("STATUS")]
    [StringLength(30)]
    [Unicode(false)]
    public string Status { get; set; }

}

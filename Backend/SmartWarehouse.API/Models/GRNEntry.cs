namespace SmartWarehouse.API.Models
{
    public class GRNEntry
    {
        public int Autoid { get; set; }
        public string GRNNO { get; set; }
        public string GRNDATE { get; set; }
        public string INVOICENO { get; set; }
        public string INVOICEDATE { get; set; }
        public string PONO { get; set; }
        public string SUPPLIER { get; set; }
        public string TRANSPORTER { get; set; }
        public string REMARKS { get; set; }
        public List<PoDt> AddedItems { get; set; }
    }

    public class PoDt
    {
        public string ITEMCODE { get; set; }
        public string ITEMNAME { get; set; }
        public string ORDEREDQTY { get; set; }
        public string RECEIVEDQTY { get; set; }
        public string ACCEPTEDQTY { get; set; }
        public string REJECTEDQTY { get; set; }
    }
}

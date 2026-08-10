namespace SmartWarehouse.API.Models
{
    public class GRNLabelPrint
    {
        public string GRNNO { get; set; }
        public string ITEMCODE { get; set; }
        public string ITEMNAME { get; set; }
        public decimal ACCEPTEDQTY { get; set; }
        public decimal STUFFINGQTY { get; set; }
    }

    public class RequestGRNLabelPrint
    {
        public List<GRNLabelPrint> GRNDetails { get; set; }
    }

    public class GRNLabelRePrint
    {
        public string GRNNO { get; set; }
        public string ITEMCODE { get; set; }
        public string BARCODE { get; set; }
    }
}

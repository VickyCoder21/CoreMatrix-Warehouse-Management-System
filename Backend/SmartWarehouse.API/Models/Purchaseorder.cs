namespace SmartWarehouse.API.Models
{
    public class PurchaseorderDt
    {
        public int AUTOID { get; set; }
        public string PONO { get; set; }
        public string PODATE { get; set; }
        public string SUPPLIERCODE { get; set; }
        public string TRANSPORTERCODE { get; set; }
        public string GSTNO { get; set; }
        public string TERMSOFPAYMENT { get; set; }
        public string DISPATCHTHROUGH { get; set; }
        public string DELIVERY { get; set; }
        public List<ItemsDt> AddedItems { get; set; }

    }

    public class ItemsDt
    {
        public string ITEMCODE { get; set; }
        public string ITEMNAME{ get; set; }
        public string QUANTITY { get; set; }
        public string UNITPRICE { get; set; }
        public string TOTALAMOUNT { get; set; }
    }
}

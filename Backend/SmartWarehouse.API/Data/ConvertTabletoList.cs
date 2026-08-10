using System.Data;

namespace SmartWarehouse.API.Data
{
    public partial class ConvertTabletoList
    {
        public List<Dictionary<string, object>> ConvertTableToList(DataTable table)
        {
            var list = new List<Dictionary<string, object>>();
            foreach (DataRow row in table.Rows)
            {
                var dict = new Dictionary<string, object>();
                foreach (DataColumn col in table.Columns)
                {
                    dict[col.ColumnName] = row[col];
                }
                list.Add(dict);
            }
            return list;
        }
    }
}

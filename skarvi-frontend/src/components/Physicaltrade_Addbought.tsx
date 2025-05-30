import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Change if your backend runs elsewhere

const TABS = [
  "Basic Details",
  "Logistics",
  "Quantity & Density",
  "Pricing & Terms",
  "Credit & Trade Info",
];

interface Field {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  options?: string[];
}
const users = [
    { id: "1", name: "Manolis Mihaletos" },
    { id: "2", name: "Odysseas Pegkos" },
    { id: "3", name: "George Pateros" },
    { id: "4", name: "Michalis Tziovas" },
    { id: "5", name: "Savitri" },
  ];
const FIELD_GROUPS: Record<string, Field[]> = {
  "Basic Details": [
    { label: "Trans. Reference", name: "tran_ref_no", required: true },
    { label: "Purchase Contract ID", name: "purchase_contract_id", required: true },
    { label: "Seller", name: "seller_name", required: true },
    { label: "Trader", name: "trader_name", required: true },
    { label: "Deal Date", name: "deal_date", type: "date", required: true },
    { label: "Portfolio", name: "portfolio", required: true },
    { label: "Cargo Desc.", name: "cargo_name", required: true },
    { label: "Group", name: "group_name" },
  ],
  "Logistics": [
    { label: "Destination", name: "destination", required: true },
    { label: "2nd Destination", name: "second_destination" },
    { label: "NOR Destination", name: "nor_desination" },
    { label: "Port", name: "port" },
    { label: "Laycan From", name: "seller_loading_laycan_from", type: "date", required: true },
    { label: "Laycan To", name: "seller_loading_laycan_to", type: "date", required: true },
    { label: "Narrow to", name: "seller_narrowed_days" },
    { label: "Days By", name: "seller_narrowed_date", type: "date" },
    { label: "BL Date", name: "seller_bl_date", type: "date" },
    { label: "NOR Date", name: "seller_nor_date", type: "date" },
    { label: "Est. BL Date", name: "seller_estimated_bl_date", type: "date" },
    { label: "Est. NOR Date", name: "seller_estimated_nor_date", type: "date" },
  ],
  "Quantity & Density": [
    { label: "Qty (Mtons Air)", name: "seller_contract_quantiity_mton_air", required: true },
    { label: "Qty (Barrels)", name: "seller_contract_quantiity_barrels", required: true },
    { label: "Cont Density", name: "seller_contract_specific_gravity" },
    { label: "Loaded Density", name: "seller_loaded_specific_gravity" },
    { label: "Price Density", name: "seller_price_calculation_density" },
    { label: "O.T. (%)", name: "seller_Operational_Tolerence" },
    { label: "Tol. Option", name: "seller_oper_tol_option", options: ["Buyer", "Seller", "Terminal"] },
    { label: "Inv. Qty B.", name: "seller_invoice_qtybasis", options: ["bl", "out-turn"] },
    { label: "P.B.", name: "seller_pricingbasis", options: ["Platts", "Future", "Fixed price"] },
  ],
  "Pricing & Terms": [
    { label: "Terms", name: "seller_term", options: ["Fob", "Cfr", "Cif", "Dap", "Pipeline", "Trucks", "in_tank_transfer"] },
    { label: "Term/Spot", name: "seller_term_spot", required: true, options: ["Term", "Spot"] },
    { label: "Pricing Unit", name: "seller_Pricing_Unit", options: ["BBL", "Mt Air", "Mt Vac"] },
    { label: "Pricing Period", name: "seller_pricing_period_basis", required: true, options: [
      "After bl", "Around bl", "Before bl", "From bl", "After nor", "Around nor", "Before nor", "From nor", "fixed_pricing_period", "Trigger date"
    ] },
    { label: "Premium/Discount", name: "seller_premium_discount" },
    { label: "Pricing Quote", name: "seller_pricing_quotes" },
    { label: "Round Price To", name: "seller_price_rounded" },
    { label: "Esc/D-Esc", name: "esc_de_esc_value", options: ["Yes", "No"] },
    { label: "Payment Terms", name: "seller_payment_terms", options: ["Standby IC", "Documentary IC", "Open Account"] },
    { label: "LC Issue Date", name: "seller_LC", type: "date" },
    { label: "Prepayment Req.", name: "seller_LC_days", options: ["yes", "no"] },
  ],
  "Credit & Trade Info": [
    { label: "Credit (D)", name: "seller_credit" },
    { label: "Days After", name: "seller_credit_days", options: ["After", "Before", "From"] },
    { label: "Credit Option", name: "seller_credit_option", options: ["BL", "COD", "LoadPort_NOR", "Discharge_NOR"] },
    { label: "Laytime Hours", name: "seller_Laytime_Hours" },
    { label: "Demurrage", name: "seller_anydeductions", options: ["Charterparty", "Afra"] },
    { label: "Weekend Clause", name: "seller_weekend_clause", options: [
      "Fridays/Holidays Before OR Sunday/Monday After", "All Holidays Before", "All Holidays After"
    ] },
    { label: "GTC", name: "gtc", options: ["Sonangol", "Shell", "BP", "Exxonmobil", "Chevron", "KPC", "TOTSA"] },
    { label: "Traded By", name: "traded_by",options: users.map(user => user.name) },
    { label: "Trade Created", name: "trade_created", type: "date" },
    { label: "Approved By", name: "approved_by" },
    { label: "Trade Approved", name: "trade_approved", type: "date" },
  ],
};

const SULFUR_FIELDS: Field[] = [
  { label: "Base Sulfur", name: "esc_base_density" },
  { label: "Esc/De-Esc", name: "esc_deesc" },
  { label: "Per", name: "esc_deesc1" },
  { label: "Contractual Max Sulfur", name: "esc_contract_density" },
  { label: "Loaded Sulfur", name: "esc_loaded_density" },
  { label: "Base Kin Sulfur", name: "kin_base_density" },
  { label: "Esc/De-Esc", name: "kin_deesc" },
  { label: "Per", name: "kin_deesc1" },
  { label: "Contractual Max Kin Sulfur", name: "kin_contract_density" },
  { label: "Loaded Kin Sulfur", name: "kin_loaded_density" },
  { label: "Base Al+Si", name: "ai_base_density" },
  { label: "Esc/De-Esc", name: "ai_deesc" },
  { label: "Per", name: "ai_deesc1" },
  { label: "Contractual Max Al+Si", name: "ai_contract_density" },
  { label: "Loaded Al+Si", name: "ai_loaded_density" },
];

const TabbedTransactionForm: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(TABS[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    const token = localStorage.getItem("access_token"); // or your JWT key

    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/physical_trades/api/save-trade`, formData,
        {
    headers: {
      Authorization: `Bearer ${token}`,
    }},
      );
      alert("Trade saved successfully!");
      setFormData({});
    } catch (err: any) {
  if (err.response && err.response.data) {
    alert("Failed to save trade: " + JSON.stringify(err.response.data, null, 2));
    console.error(err.response.data);
  } else {
    alert("Failed to save trade. Please try again.");
    console.error(err);
  }
}
  };

  const renderField = ({ label, name, type = "text", required, options }: Field) => (
    <div key={name} style={{ display: "flex", flexDirection: "column" }}>
      <label style={{ fontWeight: "bold", marginBottom: "4px" }}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      {options ? (
        <select name={name} value={formData[name] || ""} onChange={handleChange} style={inputStyle}>
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} value={formData[name] || ""} onChange={handleChange} style={inputStyle} />
      )}
    </div>
  );

  return (
    <div style={{ padding: "32px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 8px auto", fontSize: "16px", fontWeight: "bold", color: "#333" }}>
        Trades &gt; Physical Trade &gt; Add Bought Trade
      </div>

      <div style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: 1200,
        margin: "0 auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        background: "#f9f9f9",
      }}>
        <div style={{
          display: "flex",
          background: "#1F325C",
          color: "#fff",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
        }}>
          {TABS.map((tab) => (
            <div
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: "16px 24px",
                cursor: "pointer",
                background: selectedTab === tab ? "#fff" : "inherit",
                color: selectedTab === tab ? "#1F325C" : "#fff",
                borderRight: "1px solid #2d456a",
                fontWeight: selectedTab === tab ? "bold" : "normal",
                flexShrink: 0,
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        <div style={{ padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}>
              {FIELD_GROUPS[selectedTab].map(renderField)}
            </div>

            {selectedTab === "Pricing & Terms" && formData.esc_de_esc_value === "yes" && (
              <>
                <h3 style={{ marginTop: 24 }}>Sulfur Esc/De-Esc Details</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "16px",
                }}>
                  {SULFUR_FIELDS.map(renderField)}
                </div>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <button type="submit" style={{
                background: "#1F325C",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: "8px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

export default TabbedTransactionForm;
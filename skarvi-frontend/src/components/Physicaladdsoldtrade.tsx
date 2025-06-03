import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/utils";

API_URL;

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

const FIELD_GROUPS: Record<string, Field[]> = {
  "Basic Details": [
    { label: "Trans. Reference", name: "tran_ref_no", required: true },
    { label: "Sale Contract ID", name: "sale_contract_id", required: true }, // changed here
    { label: "Seller", name: "seller_name", required: true },
    { label: "Trader", name: "trader_name", required: true },
    { label: "Deal Date", name: "deal_date", type: "date", required: true },
    { label: "Portfolio", name: "portfolio_name", required: true },
    { label: "Cargo Desc.", name: "cargo_description", required: true },
    { label: "Group", name: "group_name" },
  ],
  "Logistics": [
    { label: "Destination", name: "destination", required: true },
    { label: "2nd Destination", name: "second_destination" },
    { label: "NOR Destination", name: "nor_at_destination" },
    { label: "Port", name: "port" },
    { label: "Laycan From", name: "loading_laycan_from", type: "date", required: true },
    { label: "Laycan To", name: "loading_laycan_to", type: "date", required: true },
    { label: "Narrow to", name: "to_be_narrowed_down_to" },
    { label: "Days By", name: "days_by", type: "date" },
    { label: "BL Date", name: "bl_date", type: "date" },
    { label: "NOR Date", name: "nor_date", type: "date" },
    { label: "Est. BL Date", name: "estimated_bl_date", type: "date" },
    { label: "Est. NOR Date", name: "estimated_nor_date", type: "date" },
  ],
  "Quantity & Density": [
    { label: "Qty (Mtons Air)", name: "contr_qty_mtons_air", required: true },
    { label: "Qty (Barrels)", name: "contr_qty_barrels", required: true },
    { label: "Density", name: "cont_density" },
    { label: "Loaded Density", name: "loaded_density" },
    { label: "Price Density", name: "price_density" },
    { label: "O.T. (%)", name: "ot_percent" },
    { label: "Tol. Option", name: "oper_tol_option", options: ["Buyer", "Seller"] },
    { label: "Inv. Qty B.", name: "inv_qty_b" },
    { label: "P.B.", name: "pb" },
  ],
  "Pricing & Terms": [
    { label: "Terms", name: "terms", options: ["FOB", "CIF", "Others"] },
    { label: "Term/Spot", name: "term_spot", required: true },
    { label: "Pricing Unit", name: "pricing_unit" },
    { label: "Pricing Period", name: "pricing_period_basis", required: true, options: ["After BL", "Before BL", "Others"] },
    { label: "Premium/Discount", name: "premium_discount" },
    { label: "Platts Assess.", name: "platts_assessment" },
    { label: "Pricing Quote", name: "pricing_quote" },
    { label: "Round Price To", name: "price_to_be_rounded_to" },
    { label: "Esc/D-Esc", name: "esc_de_esc", options: ["Yes", "No"] },
    { label: "Payment Terms", name: "payment_terms", options: ["Standby IC", "Cash", "Others"] },
    { label: "LC Issue Date", name: "lc_to_be_issued_by", type: "date" },
    { label: "Prepayment Req.", name: "pre_payment_required", options: ["Yes", "No"] },
  ],
  "Credit & Trade Info": [
    { label: "Credit (D)", name: "credit_days" },
    { label: "Days After", name: "after_trigger_date" },
    { label: "Credit Option", name: "credit_option", options: ["BL", "NOR"] },
    { label: "Laytime Hours", name: "laytime_hours" },
    { label: "Demurrage", name: "demurrage" },
    { label: "Weekend Clause", name: "weekend_clause" },
    { label: "GTC", name: "gtc" },
    { label: "Charter Party", name: "charter_party" },
    { label: "Traded By", name: "traded_by" },
    { label: "Trade Created", name: "trade_created_on", type: "date" },
    { label: "Verified By", name: "verified_by" },
    { label: "Trade Verified", name: "trade_verified_on", type: "date" },
    { label: "Approved By", name: "approved_by" },
    { label: "Trade Approved", name: "trade_approved_on", type: "date" },
  ],
};

const SULFUR_FIELDS: Field[] = [
  { label: "Base Sulfur", name: "base_sulfur_2" },
  { label: "Esc/De-Esc Per", name: "esc_de_esc_per_2" },
  { label: "Max Sulfur", name: "contractual_max_sulfur_2" },
  { label: "Loaded Sulfur", name: "loaded_sulfur_2" },
  { label: "Base Kin Sulfur", name: "base_kin_sulfur" },
  { label: "Esc/De-Esc Per", name: "kin_esc_de_esc_per" },
  { label: "Max Kin Sulfur", name: "contractual_max_kin_sulfur" },
  { label: "Loaded Kin Sulfur", name: "loaded_kin_sulfur" },
  { label: "Base Al+Si", name: "base_al_si" },
  { label: "Esc/De-Esc Per", name: "al_si_esc_de_esc_per" },
  { label: "Max Al+Si", name: "contractual_max_al_si" },
  { label: "Loaded Al+Si", name: "loaded_al_si" },
];

const TabbedTransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>(TABS[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    await axios.post(
      `${API_URL}/api/physical-trades/sold/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Trade saved successfully!");
    setFormData({});
  } catch (err) {
    alert("Failed to save trade. Please try again.");
    console.error(err);
  } finally {
    setLoading(false);
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
      <div
  style={{
    maxWidth: 1200,
    margin: "0 auto 8px auto",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  }}
>
  Trades &gt;{" "}
  <span
    style={{ color: "#1F325C", cursor: "pointer" }}
    onClick={() => navigate("/physical-trades")}
  >
    Physical Trade
  </span>
  &gt; Add Sold Trade
</div>

      <div
        style={{
          fontFamily: "Arial, sans-serif",
          maxWidth: 1200,
          margin: "0 auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "#f9f9f9",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#1F325C",
            color: "#fff",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              {FIELD_GROUPS[selectedTab].map(renderField)}
            </div>

            {selectedTab === "Pricing & Terms" && formData.esc_de_esc === "Yes" && (
              <>
                <h3 style={{ marginTop: 24 }}>Sulfur Esc/De-Esc Details</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {SULFUR_FIELDS.map(renderField)}
                </div>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <button
                type="submit"
                style={{
                  background: "#1F325C",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
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

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/utils";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = API_URL;

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
    { label: "Transaction Reference", name: "tran_ref_no" },
    { label: "Purchase Contract ID", name: "purchase_contract_id" },
    { label: "Trader Name", name: "trader_name", options: ["Trader 1", "Trader 2", "Trader 3"] },
    { label: "Seller Name", name: "seller_name", options: ["Seller 1", "Seller 2", "Seller 3"] },
    { label: "Portfolio Name", name: "portfolio", options: ["Portfolio 1", "Portfolio 2"] },
    { label: "Cargo Description", name: "cargo_name", options: ["Cargo 1", "Cargo 2"] },
    { label: "Group Name", name: "group_name", options: ["Group 1", "Group 2"] },
    { label: "Deal Date", name: "deal_date", type: "date" },
  ],
  "Logistics": [
    { label: "Destination", name: "destination", options: ["Free", "Port A", "Port B"] },
    { label: "Port", name: "port", options: ["Port 1", "Port 2"] },
    { label: "Terms", name: "seller_term", options: ["Fob", "Cfr", "Cif", "Dap", "Pipeline", "Trucks", "in_tank_transfer"] },
    { label: "Term/Spot", name: "seller_term_spot", options: ["Term", "Spot"] },
    { label: "To be narrowed down to", name: "seller_narrowed_days" },
    { label: "Days By", name: "seller_narrowed_date", type: "date" },
    { label: "BL Date", name: "seller_bl_date", type: "date" },
    { label: "NOR Date", name: "seller_nor_date", type: "date" },
    { label: "Estimated BL Date", name: "seller_estimated_bl_date", type: "date" },
    { label: "Estimated NOR Date", name: "seller_estimated_nor_date", type: "date" },
    { label: "Laycan From", name: "seller_loading_laycan_from", type: "date" },
    { label: "Laycan To", name: "seller_loading_laycan_to", type: "date" },
    { label: "2nd Destination", name: "second_destination" },
    { label: "NOR Destination", name: "nor_desination" },
  ],
  "Quantity & Density": [
    { label: "Cont. Qty. Mtons Air", name: "seller_contract_quantiity_mton_air" },
    { label: "Cont. Qty. Barrels", name: "seller_contract_quantiity_barrels" },
    { label: "Cont Density", name: "seller_contract_specific_gravity" },
    { label: "Loaded Density", name: "seller_loaded_specific_gravity" },
    { label: "Price Density", name: "seller_price_calculation_density" },
    { label: "O.T.(%)", name: "seller_Operational_Tolerence" },
    { label: "Oper. Tol. Option", name: "seller_oper_tol_option", options: ["Buyer", "Seller", "Terminal"] },
    { label: "Pricing Unit", name: "seller_Pricing_Unit", options: ["BBL", "Mt Air", "Mt Vac"] },
    { label: "Inv. Qty B.", name: "seller_invoice_qtybasis", options: ["BL", "Out-turn"] },
    { label: "P. B.", name: "seller_pricingbasis", options: ["Platts Assessment", "Future", "Fixed price"] },
  ],
  "Pricing & Terms": [
    { label: "Pricing Period Basis", name: "seller_pricing_period_basis", options: [
      "After bl", "Around bl", "Before bl", "From bl", "After nor", "Around nor", "Before nor", "From nor", "fixed_pricing_period", "Trigger date"
    ] },
    { label: "Premium/Discount", name: "seller_premium_discount" },
    { label: "Pricing Quote", name: "seller_pricing_quotes" },
    { label: "Price to be rounded to", name: "seller_price_rounded" },
    { label: "Esc/DI-Esc", name: "esc_de_esc_value", options: ["Yes", "No"] },
    { label: "Payment Terms", name: "seller_payment_terms", options: ["Standby IC", "Documentary IC", "Open Account"] },
    { label: "Pre payment required", name: "seller_LC_days", options: ["Yes", "No"] },
    { label: "LC Issue Date", name: "seller_LC", type: "date" },
  ],
  "Credit & Trade Info": [
    { label: "Credit(ID)", name: "seller_credit" },
    { label: "Days", name: "seller_credit_days", options: ["After", "Before", "From"] },
    { label: "Credit Option", name: "seller_credit_option", options: ["BL", "COD", "LoadPort_NOR", "Discharge_NOR"] },
    { label: "Laytime Hours", name: "seller_Laytime_Hours" },
    { label: "Demurrage", name: "seller_anydeductions", options: ["CharterParty", "Afra"] },
    { label: "Weekend Clause", name: "seller_weekend_clause", options: [
      "Fridays/Holidays Before OR Sunday/Monday After", "All Holidays Before", "All Holidays After"
    ] },
    { label: "GTC", name: "gtc", options: ["Sonangol", "Shell", "BP", "Exxonmobil", "Chevron", "KPC", "TOTSA"] },
    { label: "Traded By", name: "traded_by", options: users.map(user => user.name) },
    { label: "Trade Created on", name: "trade_created", type: "date" },
    { label: "Verified By", name: "verified_by", options: users.map(user => user.name) },
    { label: "Trade Verified on", name: "trade_verified", type: "datetime-local" },
    { label: "Approved By", name: "approved_by", options: users.map(user => user.name) },
    { label: "Trade Approved on", name: "trade_approved", type: "datetime-local" },
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

// Simulate company name from session or user context
const getCompanyPrefix = (companyName: string) => {
  if (companyName === "Bharat Petroleum Corporation") return "C1TN";
  if (companyName === "Company 2") return "C2TN";
  if (companyName === "Company 3") return "C3TN";
  if (companyName === "Group Company") return "GCTN";
  return "C1TN";
};

// Always increment to the next available transaction number
const checkAndGenerateTranRefNo = async (companyName: string) => {
  const prefix = getCompanyPrefix(companyName);
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  try {
    const res = await axios.get(`${API_BASE_URL}/physical_trades/api/save-trade?prefix=${prefix}&yearMonth=${yearMonth}`);
    let maxNum = 0;
    res.data.forEach((item: any) => {
      const ref = item.tran_ref_no;
      if (ref && ref.startsWith(prefix + yearMonth)) {
        const num = parseInt(ref.slice((prefix + yearMonth).length), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextVal = (maxNum + 1).toString().padStart(5, "0");
    return `${prefix}${yearMonth}${nextVal}`;
  } catch {
    return `${prefix}${yearMonth}00001`;
  }
};

function generatePurchaseContractId() {
  return "1";
}

const TabbedTransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>(TABS[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const companyName = "Bharat Petroleum Corporation";

  // On mount, generate transaction number and contract id
  useEffect(() => {
    const setTranRefAndContractId = async () => {
      const tranRefNo = await checkAndGenerateTranRefNo(companyName);
      setFormData({
        tran_ref_no: tranRefNo,
        purchase_contract_id: generatePurchaseContractId(),
        deal_date: new Date().toISOString().slice(0, 10),
      });
    };
    setTranRefAndContractId();
    // eslint-disable-next-line
  }, []);

  const showLC = formData.seller_payment_terms && formData.seller_payment_terms !== "Open Account";
  const showPrepayment = formData.seller_LC_days === "Yes";
  const showSulfur = formData.esc_de_esc_value === "Yes";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQtyBarrelsCalc = () => {
    const mt = parseFloat(formData.seller_contract_quantiity_mton_air || "");
    const bbl = parseFloat(formData.seller_contract_quantiity_barrels || "");
    if (!isNaN(mt) && (!formData.seller_contract_quantiity_barrels || isNaN(bbl))) {
      setFormData((prev) => ({
        ...prev,
        seller_contract_quantiity_barrels: (mt * 7.33).toFixed(2),
      }));
    } else if (!isNaN(bbl) && (!formData.seller_contract_quantiity_mton_air || isNaN(mt))) {
      setFormData((prev) => ({
        ...prev,
        seller_contract_quantiity_mton_air: (bbl / 7.33).toFixed(2),
      }));
    } else {
      alert("Enter either Contract Qty. Mtons Air or Barrels to calculate the other.");
    }
  };

  // Save to all tables and increment transaction number after save
  const handleSubmit = async (e: FormEvent) => {
    const token = localStorage.getItem("access_token");
    e.preventDefault();
    try {
      setLoading(true);
      const tranRefNo = formData.tran_ref_no;
      const purchaseContractId = formData.purchase_contract_id;
      const today = new Date().toISOString().slice(0, 10);
      const submitData = { ...formData, deal_date: today };

      // Save Seller
      await axios.post(`${API_BASE_URL}/physical_trades/api/save-trade`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save Buyer
      await axios.post(`${API_BASE_URL}/physical_trades/api/physical-trades/bought`, {
        ...submitData,
        sale_contract_id: purchaseContractId, // or your logic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save Interim
      await axios.post(`${API_BASE_URL}/physical_trades/api/interim-transaction`, {
        ...submitData,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Trade saved successfully in all tables!");

      // After save, increment transaction number for next entry
      const nextTranRefNo = await checkAndGenerateTranRefNo(companyName);
      setFormData({
        tran_ref_no: nextTranRefNo,
        purchase_contract_id: generatePurchaseContractId(),
        deal_date: new Date().toISOString().slice(0, 10),
      });
    } catch (err: any) {
      alert("Failed to save trade.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderField = ({ label, name, type = "text", options }: Field) => {
    if (name === "seller_LC" && !showLC) return null;
    if (name === "prepayment" && !showPrepayment) return null;
    const isReadonly = name === "tran_ref_no" || name === "purchase_contract_id";
    return (
      <div key={name} style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", marginBottom: "4px" }}>
          {label}
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
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            style={inputStyle}
            readOnly={isReadonly}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "32px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 8px auto", fontSize: "16px", fontWeight: "bold", color: "#333" }}>
        Trades &gt;{" "}
        <span
          style={{ color: "#1F325C", cursor: "pointer" }}
          onClick={() => navigate("/physical-trades")}
        >
          Physical Trade
        </span>
        &gt; Add Bought Trade
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

            {selectedTab === "Quantity & Density" && (
              <div style={{ gridColumn: "1 / -1", margin: "16px 0", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={handleQtyBarrelsCalc}
                  style={{
                    background: "#1F325C",
                    color: "#fff",
                    padding: "8px 24px",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "15px"
                  }}
                >
                  Calculate Contract Qty & Barrels
                </button>
              </div>
            )}

            {selectedTab === "Pricing & Terms" && showSulfur && (
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
                padding: "10px 32px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "16px"
              }}>
                {loading ? "Saving..." : "SAVE"}
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
  border: "1px solid #b6d4fe",
  borderRadius: "4px",
  background: "#f6fbff"
};

export default TabbedTransactionForm;
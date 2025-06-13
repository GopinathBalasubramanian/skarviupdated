import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL  } from "../utils/utils";


// Adjust API_SAVE_TRADE_URL  for fetching if 'save-trade' doesn't return the full list
const API_SAVE_TRADE_URL = `${API_URL}/physical_trades/api/save-trade`;
const API_CLONE_URL = `${API_URL}/physical_trades/api/clone-transaction`; // Ensure this matches your backend path


// Only display these columns
const DISPLAY_COLUMNS = [
  { key: "tran_ref_no", label: "Transaction Ref" },
  { key: "group_name", label: "Product" },
  { key: "seller_name", label: "Seller" },
  { key: "buyer_name", label: "Buyer" },
  { key: "seller_loading_laycan_from", label: "Laycan" },
  { key: "seller_price_rounded", label: "Price" },
  { key: "nquantity", label: "Quantity" },
];

const PhysicalTradesEditTrade = () => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<"add" | "view" | false>(false);
  const [noteContent, setNoteContent] = useState(""); 
  const [isSendMailModalOpen, setIsSendMailModalOpen] = useState(false);
  const [mailId, setMailId] = useState("");
  const [trades, setTrades] = useState<any[]>([]);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  // NEW: Use selectedTradeId to store the ID of the trade to copy/move
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState("");

  const navigate = useNavigate();

  // Fetch all trades from backend
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(API_SAVE_TRADE_URL , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrades(res.data);
      } catch (err) {
        console.error("Failed to fetch trades:", err);
        setTrades([]);
        alert(
          "Failed to fetch trades. Please check the console for more details."
        );
      }
    };
    fetchTrades();
  }, []); // Empty dependency array means this runs once on component mount

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#1F325C",
    color: "white",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    marginLeft: "6px",
    cursor: "pointer",
    border: "none",
  };

  const thStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "6px 8px",
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "6px 8px",
    textAlign: "center",
    whiteSpace: "nowrap",
  };

  const handleDeleteClick = (trade: any) => {
    setSelectedTrade(trade);
    setIsDeleteModalOpen(true);
  };

  const handleCopyMove = async () => {
    // Validate that an ID and mode are selected
    if (selectedTradeId === null || !selectedMode) {
      alert("Please select both a transaction and mode.");
      return;
    }

    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        API_CLONE_URL,
        {
          id: selectedTradeId, // Pass the ID of the source transaction
          mode: selectedMode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newTranRef = response.data.new_tran_ref_no;
      setIsCopyModalOpen(false);
      alert(
        `Transaction ${
          selectedMode === "Move" ? "moved" : "copied"
        } successfully to new reference: ${newTranRef}`
      );

      // After successful copy/move, refresh the trades list (re-fetch)
      // and navigate to edit the new trade.
      // Using window.location.reload() can be a simpler way to ensure full data refresh
      window.location.reload();
      // Or you could refetch trades:
      // await fetchTrades(); // If you uncomment this, make sure fetchTrades is accessible here or defined inside handleCopyMove
      navigate(`/edit-physical-trade?tran_ref_no=${newTranRef}`);
    } catch (err: any) {
      console.error("Failed to clone transaction:", err);
      if (axios.isAxiosError(err) && err.response) {
        console.error("Backend Error Data:", err.response.data);
        // Display more specific error message from backend
        const errorMessage =
          err.response.data.error ||
          JSON.stringify(err.response.data) ||
          "Unknown error from server";
        alert(`Failed to clone transaction: ${errorMessage}`);
      } else {
        alert("Failed to clone transaction. Please check console for details.");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedTrade) {
      try {
        const token = localStorage.getItem("access_token");
      
        await axios.delete(API_SAVE_TRADE_URL , {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            tran_ref_no: selectedTrade.tran_ref_no, 
            purchase_contract_id: selectedTrade.purchase_contract_id,
          },
        });
        // Optimistically remove the deleted trade from the state
        setTrades(
          trades.filter(
            (t) =>
              t.tran_ref_no !== selectedTrade.tran_ref_no ||
              t.purchase_contract_id !== selectedTrade.purchase_contract_id
          )
        );
        alert("Trade deleted successfully!");
      } catch (err) {
        console.error("Failed to delete trade:", err);
        alert("Failed to delete trade");
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedTrade(null);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          color: "#4B5563",
          fontSize: "14px",
          fontWeight: 500,
          marginBottom: "12px",
        }}
      >
        {/* Physical Trades &gt; Edit Trades */}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <button
          style={buttonStyle}
          onClick={() => navigate("/add-physical-trade")}
        >
          Add Bought Cargoes
        </button>
        <button
          style={buttonStyle}
          onClick={() => navigate("/physical-add-sold-trade")}
        >
          Add Sold Cargoes
        </button>
        <button
          style={buttonStyle}
          onClick={() => setIsSendMailModalOpen(true)}
        >
          Send Mail
        </button>
        <button style={buttonStyle} onClick={() => setIsCopyModalOpen(true)}>
          Copy Transaction
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr>
              {DISPLAY_COLUMNS.map((col) => (
                <th style={thStyle} key={col.key}>
                  {col.label}
                </th>
              ))}
              <th style={thStyle}>Actions</th>
              <th style={thStyle}>Add Notes</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((row, index) => (
              <tr key={index}>
                {DISPLAY_COLUMNS.map((col) => (
                  <td style={tdStyle} key={col.key}>
                    {row[col.key]}
                  </td>
                ))}
                <td style={tdStyle}>
                  <button
                    style={buttonStyle}
                    onClick={() => navigate("save-trade", { state: row })}
                  >
                    Edit
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => handleDeleteClick(row)}
                  >
                    Delete
                  </button>
                </td>
                <td style={tdStyle}>
  <button
    style={buttonStyle}
    onClick={() => {
      setSelectedTrade(row);
      setIsNoteModalOpen("add");
    }}
  >
    Add
  </button>
  <button
    style={buttonStyle}
    onClick={() => {
      setSelectedTrade(row);
      setIsNoteModalOpen("view");
    }}
  >
    View
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Copy Modal */}
      {isCopyModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <button
              onClick={() => setIsCopyModalOpen(false)}
              style={closeButtonStyle}
            >
              ×
            </button>
            <h2
              style={{
                textAlign: "center",
                fontSize: "20px",
                marginBottom: "24px",
              }}
            >
              Copy Transaction
            </h2>

            <div
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "10px",
                padding: "24px",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label>Details to be taken from</label>
                <select
                  style={selectStyle}
                  value={selectedTradeId || ""} // Use selectedTradeId for value
                  onChange={(e) => setSelectedTradeId(Number(e.target.value))} // Convert to Number
                >
                  <option value="">Select</option>
                  {trades.map((item, idx) => (
                    <option key={idx} value={item.id}>
                      {" "}
                      {/* Use item.id as value */}
                      {item.tran_ref_no} (ID: {item.id}){" "}
                      {/* Display both for clarity */}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Move or Copy?</label>
                <select
                  style={selectStyle}
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Copy">Copy</option>
                  <option value="Move">Move</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button style={submitButtonStyle} onClick={handleCopyMove}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      

      {/* Send Mail Modal */}
      {isSendMailModalOpen && (
        <Modal
          title="Send Mail"
          onClose={() => setIsSendMailModalOpen(false)}
          subtitle="Send trade details via email."
        >
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              Transaction Ref
            </label>
            <select
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #ccc",
              }}
              onChange={(e) =>
                setSelectedTrade(
                  trades.find((t) => t.tran_ref_no === e.target.value)
                )
              } // Keep using tran_ref_no here if mail logic depends on it
            >
              <option value="">Select Transaction Ref</option>
              {trades.map((item, idx) => (
                <option key={idx} value={item.tran_ref_no}>
                  {item.tran_ref_no}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              Mail ID
            </label>
            <select
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #ccc",
              }}
              onChange={(e) => setMailId(e.target.value)}
            >
              <option value="">Select Mail ID</option>
              {trades.map((item, idx) => (
                <option key={idx} value={item.email_id}>
                  {item.email_id || "No Mail ID"} 
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button
              style={submitButtonStyle}
              onClick={() => {
                console.log("Sending mail to:", mailId);
                console.log(
                  "Selected Transaction Ref:",
                  selectedTrade?.tran_ref_no
                );
                setIsSendMailModalOpen(false);
              }}
            >
              Send
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div style={modalBackdropStyle}>
          <div
            style={{
              ...modalBoxStyle,
              width: "400px",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsDeleteModalOpen(false)} // or your state setter function
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
              }}
            >
              ×
            </button>

            <h2
              style={{
                fontWeight: "bold",
                fontSize: "20px",
                marginBottom: "20px",
              }}
            >
              Are You Sure Want to Delete Transaction?
            </h2>
            <button style={submitButtonStyle} onClick={handleConfirmDelete}>
              Delete
            </button>
          </div>
        </div>
      )}
      {isNoteModalOpen && selectedTrade && (
  <Modal
    title={isNoteModalOpen === "add" ? "Add Note" : "View Note"}
    onClose={() => {
      setIsNoteModalOpen(false);
      setNoteContent("");
    }}
  >
    {isNoteModalOpen === "add" ? (
      <>
        <textarea
          rows={5}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "14px",
            border: "1px solid #ccc",
            marginBottom: "16px",
          }}
          placeholder="Write your comment..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />
        <div style={{ textAlign: "center" }}>
          <button
            style={submitButtonStyle}
            onClick={async () => {
              try {
                const token = localStorage.getItem("access_token");
                await axios.post(
                  `${API_URL}/physical_trades/api/save-note/`,
                  {
                    tran_ref_no: selectedTrade.tran_ref_no,
                    note: noteContent,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                alert("Note saved successfully!");
                setIsNoteModalOpen(false);
              } catch (err) {
                console.error("Error saving note:", err);
                alert("Failed to save note.");
              }
            }}
          >
            Save Note
          </button>
        </div>
      </>
    ) : (
      <div style={{ fontSize: "14px", color: "#374151", whiteSpace: "pre-wrap" }}>
        <strong>Note:</strong>
        <br />
        {selectedTrade?.note || "No note available."}
      </div>
    )}
  </Modal>
)}


      <footer
        style={{
          marginTop: "360px",
          textAlign: "center",
          fontSize: "13px",
          color: "#6b7280",
        }}
      >
        Copyright © 2019{" "}
        <a href="#" style={{ color: "#1F325C", textDecoration: "underline" }}>
          Skarvi Systems
        </a>
        . All rights reserved.
      </footer>
    </div>
  );
};

// Modal component (remains the same)
const Modal = ({
  children,
  title,
  subtitle,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
}) => (
  <div style={modalBackdropStyle}>
    <div style={modalBoxStyle}>
      <button onClick={onClose} style={closeButtonStyle}>
        ×
      </button>
      <h2
        style={{
          textAlign: "center",
          fontSize: "18px",
          fontWeight: 600,
          marginBottom: "8px",
          color: "#1F325C",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#6B7280",
            marginBottom: "20px",
          }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  </div>
);

const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalBoxStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "32px",
  borderRadius: "12px",
  width: "600px",
  maxWidth: "90%",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  position: "relative",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "12px",
  right: "12px",
  background: "transparent",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  color: "#333",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  fontSize: "14px",
  backgroundColor: "#f0f8ff",
  marginTop: "6px",
};

const submitButtonStyle: React.CSSProperties = {
  backgroundColor: "#1F325C",
  color: "white",
  padding: "10px 32px",
  borderRadius: "6px",
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
};

export default PhysicalTradesEditTrade;

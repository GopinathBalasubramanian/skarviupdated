import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/physical_trades/api/save-trade"; // Adjust if needed

const PhysicalTradesEditTrade = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);

  const navigate = useNavigate();

  // Fetch all trades from backend
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrades(res.data);
      } catch (err) {
        setTrades([]);
        alert("Failed to fetch trades");
      }
    };
    fetchTrades();
  }, []);

  // Get all unique keys from all trades for dynamic columns
  const allKeys = Array.from(
    trades.reduce((acc, trade) => {
      Object.keys(trade).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>())
  );

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#1F325C',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    marginLeft: '6px',
    cursor: 'pointer',
    border: 'none',
  };

  const thStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '6px 8px',
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '6px 8px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  const handleDeleteClick = (trade: any) => {
    setSelectedTrade(trade);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTrade) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            tran_ref_no: selectedTrade.tran_ref_no,
            purchase_contract_id: selectedTrade.purchase_contract_id,
          },
        });
        setTrades(trades.filter(t => t.tran_ref_no !== selectedTrade.tran_ref_no || t.purchase_contract_id !== selectedTrade.purchase_contract_id));
      } catch (err) {
        alert("Failed to delete trade");
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedTrade(null);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ color: '#4B5563', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
        Physical Trades &gt; Edit Trades
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
        <button style={buttonStyle} onClick={() => navigate('/add-physical-trade')}>
          Add Bought Cargoes
        </button>
        <button style={buttonStyle} onClick={() => navigate('/physical-add-sold-trade')}>Add Sold Cargoes</button>
        <button style={buttonStyle}>Send Mail</button>
        <button style={buttonStyle} onClick={() => setIsCopyModalOpen(true)}>Copy Transaction</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Select</th>
              {allKeys.map((key) => (
                <th style={thStyle} key={key}>{key}</th>
              ))}
              <th style={thStyle}>Actions</th>
              <th style={thStyle}>Add Notes</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((row, index) => (
              <tr key={index}>
                <td style={tdStyle}><input type="checkbox" /></td>
                {allKeys.map((key) => (
                  <td style={tdStyle} key={key}>{row[key]}</td>
                ))}
                <td style={tdStyle}>
                  <button style={buttonStyle}>View</button>
                  <button style={buttonStyle}>Edit</button>
                  <button style={buttonStyle} onClick={() => handleDeleteClick(row)}>Delete</button>
                </td>
                <td style={tdStyle}>
                  <button style={buttonStyle}>Add</button>
                  <button style={buttonStyle}>View</button>
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
            <button onClick={() => setIsCopyModalOpen(false)} style={closeButtonStyle}>×</button>
            <h2 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '24px' }}>
              Copy Transaction
            </h2>

            <div style={{ backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label>Details to be taken from</label>
                <select style={selectStyle}>
                  <option>Select</option>
                  {trades.map((item, idx) => (
                    <option key={idx}>{item.tran_ref_no}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label>Move or Copy?</label>
                <select style={selectStyle}>
                  <option>Select</option>
                  <option>Copy</option>
                  <option>Move</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label>Copied to</label>
                <select style={selectStyle}>
                  <option>Select</option>
                  <option>New Transaction</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button style={submitButtonStyle} onClick={() => setIsCopyModalOpen(false)}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalBoxStyle, width: '400px', textAlign: 'center' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>
              Are You Sure Want to Delete Transaction?
            </h2>
            <button style={submitButtonStyle} onClick={handleConfirmDelete}>
              Delete
            </button>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '320px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
        Copyright © 2019{' '}
        <a href="#" style={{ color: '#1F325C', textDecoration: 'underline' }}>
          Skarvi Systems
        </a>
        . All rights reserved.
      </footer>
    </div>
  );
};

// Styles
const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
};

const modalBoxStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '32px',
  borderRadius: '12px',
  width: '600px',
  maxWidth: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  position: 'relative',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'transparent',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#333',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  fontSize: '14px',
  backgroundColor: '#f0f8ff',
  marginTop: '6px',
};

const submitButtonStyle: React.CSSProperties = {
  backgroundColor: '#1F325C',
  color: 'white',
  padding: '10px 32px',
  borderRadius: '6px',
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
};

export default PhysicalTradesEditTrade;
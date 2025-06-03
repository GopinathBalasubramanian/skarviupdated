import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const PhysicalTradesEditTrade = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);

  // Static data to mimic API response
  useEffect(() => {
    const staticData = [
      {
        transaction_ref: 'TXN001',
        product: 'Crude Oil',
        seller: 'Company A',
        buyer: 'Company B',
        laycan: '2025-06-10',
        price: '$60',
        quantity: '1000 BBL',
      },
      {
        transaction_ref: 'TXN002',
        product: 'Diesel',
        seller: 'Company C',
        buyer: 'Company D',
        laycan: '2025-06-15',
        price: '$75',
        quantity: '2000 BBL',
      },
    ];
    setTrades(staticData);
  }, []);
const navigate = useNavigate();
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
  };

  const tdStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '6px 8px',
    textAlign: 'center',
  };

  const handleDeleteClick = (trade: any) => {
    setSelectedTrade(trade);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTrade) {
      setTrades(trades.filter(t => t.transaction_ref !== selectedTrade.transaction_ref));
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

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Select</th>
            <th style={thStyle}>Transaction Ref</th>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Seller</th>
            <th style={thStyle}>Buyer</th>
            <th style={thStyle}>Laycan</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Quantity</th>
            <th style={thStyle}>Actions</th>
            <th style={thStyle}>Add Notes</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((row, index) => (
            <tr key={index}>
              <td style={tdStyle}><input type="checkbox" /></td>
              <td style={tdStyle}>{row.transaction_ref}</td>
              <td style={tdStyle}>{row.product}</td>
              <td style={tdStyle}>{row.seller}</td>
              <td style={tdStyle}>{row.buyer}</td>
              <td style={tdStyle}>{row.laycan}</td>
              <td style={tdStyle}>{row.price}</td>
              <td style={tdStyle}>{row.quantity}</td>
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
                    <option key={idx}>{item.transaction_ref}</option>
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

      <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
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

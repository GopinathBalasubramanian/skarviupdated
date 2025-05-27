import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../utils/utils";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/Papertrades.css";

const EditTrade: React.FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<any[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<any[] | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchFields, setSearchFields] = useState({ transactionRef: '', type: '' });
  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }
    const fetchTrades = async () => {
      try {
        const response = await fetch(`${API_URL}/paper_trades/hedging/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate('/');
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setTrades(data);
        }
      } catch (error) {}
    };
    fetchTrades();
  }, [accessToken, navigate]);

  const handleEdit = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/paper_trades/hedging/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const rawData = await response.json();
        navigate('/add-new-trade', { state: { tradeData: rawData } });
      }
    } catch (error) {}
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this trade?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${API_URL}/paper_trades/hedging/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 204) {
        alert('Trade deleted successfully!');
        setTrades(trades.filter((trade) => trade.id !== id));
      } else if (response.status === 404) {
        alert('Error: Trade not found.');
      } else {
        alert('Failed to delete trade');
      }
    } catch (error) {
      alert("An error occurred while deleting the trade.");
    }
  };

  const handleSearchSubmit = () => {
    const filtered = trades.filter((trade) => {
      const matchesTransactionRef = searchFields.transactionRef
        ? trade.tran_ref_no?.toLowerCase().includes(searchFields.transactionRef.toLowerCase())
        : true;
      const matchesType = searchFields.type
        ? trade.transaction_type?.toLowerCase().includes(searchFields.type.toLowerCase())
        : true;
      return matchesTransactionRef && matchesType;
    });
    setFilteredTrades(filtered);
    setShowSearchModal(false);
  };

  return (
    <>
      <style>
        {`
          .page-wrapper {
            min-height: 100%;
            display: flex;
            flex-direction: column;
          }
          .container {
            flex: 1;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .header {
            font-size: 20px;
            font-weight: bold;
            background: #f5f5f5;
            padding: 10px 20px;
            display: inline-block;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .header span {
            color: #1F325C;
          }
          .button-group {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          .main-button {
            background-color: #1F325C;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .main-button:hover {
            opacity: 0.9;
          }
          .trade-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .trade-table th,
          .trade-table td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
          }
          .trade-table th {
            background-color: #f9f9f9;
            font-weight: bold;
            position: relative;
          }
          .trade-table th .filter-icon {
            font-size: 12px;
            margin-left: 5px;
            color: #999;
          }
          .action-button {
            background-color: #1F325C;
            color: white;
            border: none;
            padding: 6px 12px;
            margin: 0 2px 5px;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;   
            display: inline;        
          }
          .action-button:hover {
            opacity: 0.9;
          }
          .footer {
            background: #f5f5f5;
            padding: 15px 10px;
            text-align: center;
            font-size: 12px;
            color: #555;
          }
          .footer a {
            color: #1F325C;
            text-decoration: none;
          }
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999;
          }
          .upload-modal {
            background: white;
            padding: 20px;
            border-radius: 12px;
            width: 500px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            position: relative;
            text-align: center;
          }
          .modal-content {
            background-color: #f7f7f7;
            padding: 30px;
            border-radius: 10px;
            margin-top: 20px;
          }
          .modal-close-icon {
            position: absolute;
            top: 12px;
            right: 16px;
            font-size: 20px;
            cursor: pointer;
            color: #999;
          }
          .modal-footer {
            display: flex;
            justify-content: center;
            margin-top: 20px;
          }
          .upload-header {
            margin-top: 0;
            font-size: 24px;
            color: #1F325C;
            font-weight: bold;
          }
          .upload-box {
            margin-bottom: 30px;
            text-align: left;
          }
          .upload-box label {
            font-weight: bold;
            display: inline;
            margin-bottom: 15px;
          }
          .input-transaction{
            border-radius: 5px;
            border: 1px solid rgb(122, 121, 121);
            padding: 10px;
            width: 400px;
          }
        `}
      </style>

      <div className="page-wrapper">
        <div className="container">
          <h2 className="header">
  Trades &gt;{" "}
  <span
    style={{ color: "#1F325C", textDecoration: "", cursor: "pointer" }}
    onClick={() => navigate("/paper-trades")}
  >
    Paper Trades
  </span>
</h2>

          <div className="button-group">
            <button className="main-button" onClick={() => setShowSearchModal(true)}>
              <span role="img" aria-label="search">🔍</span> Search Trade
            </button>
          </div>

          <table className="trade-table">
            <thead>
              <tr>
                <th>Unique Ref <span className="filter-icon"></span></th>
                <th>Trans Ref <span className="filter-icon"></span></th>
                <th>Trade <span className="filter-icon"></span></th>
                <th>Trade On <span className="filter-icon"></span></th>
                <th>Pricing Basis <span className="filter-icon"></span></th>
                <th>Pricing Period <span className="filter-icon"></span></th>
                <th>Broker <span className="filter-icon"></span></th>
                <th>Quantity <span className="filter-icon"></span></th>
                <th>Fixed Price <span className="filter-icon"></span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filteredTrades ?? trades).map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.tran_ref_no}</td>
                  <td>{item.transaction_type}</td>
                  <td>{item.traded_on}</td>
                  <td>{item.pricing_basis2}</td>
                  <td>{item.pricing_period_from}–{item.pricing_period_to}</td>
                  <td>{item.broker_name}</td>
                  <td>{item.quantity_mt}</td>
                  <td>{item.fixed_price}</td>
                  <td>
                    <button className="action-button" onClick={() => handleEdit(item.id)}>
                      Edit
                    </button>
                    <button
                      className="action-button"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="footer">
          Copyright © 2019 <a href="#">Skarvi Systems</a>. All rights reserved.
        </footer>
      </div>

      {showSearchModal && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="modal-close-icon" onClick={() => setShowSearchModal(false)}>×</div>
            <h2 className="upload-header">Search Trade</h2>
            <div className="modal-content">
              <div className="upload-box">
                <label>Transaction Ref</label>
                <input
                  type="text"
                  className="input-transaction"
                  value={searchFields.transactionRef}
                  onChange={(e) => {
                    setSearchFields({ ...searchFields, transactionRef: e.target.value });
                    setFilteredTrades(null);
                  }}
                />
                <label>Type</label>
                <input
                  type="text"
                  className="input-transaction"
                  value={searchFields.type}
                  onChange={(e) => setSearchFields({ ...searchFields, type: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="action-button" onClick={handleSearchSubmit}>Search</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTrade;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Breadcrumb } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../components/Papertrades.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faPenToSquare,
  faCopy,
  faExchangeAlt,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../utils/utils";
import type { ChangeEvent, MouseEvent } from "react";

const Papertrades: React.FC = () => {
  const navigate = useNavigate();

  // For Copy Trade modal
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedCopyOption, setSelectedCopyOption] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Fetch trades for copy modal
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      navigate("/"); // Redirect to login if no token
      return;
    }
    fetch(`${API_URL}/paper_trades/hedging/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/"); // Redirect to login if unauthorized
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data) setTrades(data);
      })
      .catch(() => setTrades([]));
  }, [showCopyModal, navigate]);

  const copyTradeOptions = trades.map(
    (trade) =>
      `${trade.pricing_basis2} ${trade.pricing_period_from} - ${trade.pricing_period_to}`
  );

  const handleCopySubmit = async () => {
    if (!selectedCopyOption) {
      alert("Please select an option to copy");
      return;
    }
    const selectedTrade = trades.find(
      (trade) =>
        `${trade.pricing_basis2} ${trade.pricing_period_from} - ${trade.pricing_period_to}` ===
        selectedCopyOption
    );
    if (selectedTrade) {
      const { id, ...tradeDataForCopy } = selectedTrade; // Remove id for new entry
      setShowCopyModal(false);

      // POST to backend to create a new trade
      const accessToken = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${API_URL}/paper_trades/hedging/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tradeDataForCopy),
        });
        if (response.ok || response.status === 201) {
          alert("Trade copied and added successfully!");
          // Optionally, refresh the trades list or navigate to edit page
          // window.location.reload(); // or fetch trades again
        } else {
          const errorData = await response.json();
          alert(
            "Failed to copy trade: " + (errorData.detail || "Unknown error")
          );
        }
      } catch (err) {
        alert("Error copying trade.");
      }
    } else {
      alert("Trade not found.");
    }
  };

  function handleUpload(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    if (!uploadedFile) {
      alert("Please select a file to upload.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", uploadedFile);

    fetch(`${API_URL}/paper_trades/upload-trades/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          alert("File uploaded successfully!");
          setShowModal(false);
          setUploadedFile(null);
        } else {
          alert("Failed to upload file.");
        }
      })
      .catch(() => alert("Error uploading file."));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    if (event.target.files && event.target.files.length > 0) {
      setUploadedFile(event.target.files[0]);
    }
  }

  return (
    <Container className="cards-container" style={{ marginTop: "-12px" }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item active>Trades</Breadcrumb.Item>
        <Breadcrumb.Item href="/paper-trades">Paper Trades</Breadcrumb.Item>
      </Breadcrumb>
      <Row className="cards-grid g-4">
        {/* Add New Trades and Create a Paper Entry */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="card-custom">
            <Card.Body>
              <FontAwesomeIcon icon={faCirclePlus} className="card-icon" />
              <h3 className="card-title">
                Add New Trades and Create a Paper Entry
              </h3>
              <p className="card-text">
                Create a new trade entry for physical trades.
              </p>
              <Button
                className="launch-button"
                style={{
                  marginBottom: "10px",
                  marginTop: "30px",
                  alignSelf: "flex-end",
                }}
                onClick={() => navigate("/add-new-trade")}
              >
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Edit Trades */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="card-custom">
            <Card.Body>
              <FontAwesomeIcon icon={faPenToSquare} className="card-icon" />
              <h3 className="card-title">Edit Trades</h3>
              <p className="card-text">Modify trade details for products.</p>
              <Button
                className="launch-button"
                style={{
                  marginBottom: "10px",
                  marginTop: "30px",
                  alignSelf: "flex-end",
                }}
                onClick={() => navigate("/edit-trade")}
              >
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Copy an Existing Trade for New Entry */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="card-custom">
            <Card.Body>
              <FontAwesomeIcon icon={faCopy} className="card-icon" />
              <h3 className="card-title">
                Copy an Existing Trade for New Entry
              </h3>
              <p className="card-text">
                Copy an existing trade to make a new entry.
              </p>
              <Button
                className="launch-button"
                style={{
                  marginBottom: "10px",
                  marginTop: "30px",
                  alignSelf: "flex-end",
                }}
                onClick={() => setShowCopyModal(true)}
              >
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Integrate ICE Trades for Effective Data Management */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="card-custom">
            <Card.Body>
              <FontAwesomeIcon icon={faExchangeAlt} className="card-icon" />
              <h3 className="card-title">
                Integrate ICE Trades for Effective Data Management
              </h3>
              <p className="card-text">
                Integrate ICE trade data for smooth management.
              </p>

              <Button
                className="launch-button"
                style={{
                  marginBottom: "10px",
                  marginTop: "10px",
                  alignSelf: "flex-end",
                }}
                onClick={() => setShowModal(true)}
              >
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col>
        {/* Validate ICE Trades for Heavy Products and Entries */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="card-custom">
            <Card.Body>
              <FontAwesomeIcon icon={faClipboardCheck} className="card-icon" />
              <h3 className="card-title">
                Validate ICE Trades for Heavy Products and Entries
              </h3>
              <p className="card-text">
                Validate product trades for accurate records.
              </p>
              <Button
                className="launch-button"
                style={{
                  marginBottom: "10px",
                  marginTop: "10px",
                  alignSelf: "flex-end",
                }}
                onClick={() => alert("Trade validation dummy")}
              >
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div
              className="modal-close-icon"
              onClick={() => setShowCopyModal(false)}
            >
              ×
            </div>
            <h2 className="upload-header">Copy Trade</h2>
            <div className="modal-content">
              <div className="upload-box">
                <label>Pricing Basis/Pricing Period</label>
                <select
                  style={{
                    marginTop: "10px",
                    width: "400px",
                    height: "40px",
                    borderRadius: "6px",
                  }}
                  value={selectedCopyOption}
                  onChange={(e) => setSelectedCopyOption(e.target.value)}
                >
                  <option value="">Select Option</option>
                  {copyTradeOptions.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  style={{
                    marginBottom: "20px",
                    marginRight: "155px",
                    marginTop: "20px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                    width: "100px",
                  }}
                  className="upload-submit-btn"
                  onClick={handleCopySubmit}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div
              className="modal-close-icon"
              onClick={() => setShowModal(false)}
            >
              ×
            </div>
            <h2 className="upload-header">Upload File</h2>
            <div className="upload-box">
              <label style={{ marginRight: "210px" }}>Upload Xlsx/Xlsb</label>
              <div className="file-input-row">
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xlsb"
                  onChange={handleFileChange}
                  className="choose-file-btn"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#e6eaf3",
                    color: "#1f325c",
                    padding: "8px 15px",
                    marginTop: "10px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    border: "none",
                    width: "auto",
                  }}
                />
                <span style={{ marginLeft: "10px" }}>
                  {uploadedFile ? uploadedFile.name : ""}
                </span>
              </div>
              <button
                style={{ marginTop: "20px" }}
                className="upload-submit-btn"
                onClick={handleUpload}
                disabled={!uploadedFile}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Papertrades;

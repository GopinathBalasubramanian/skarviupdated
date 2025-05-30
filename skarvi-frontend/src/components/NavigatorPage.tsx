import React from "react";
import { useNavigate } from "react-router-dom";

// Common button style for reuse
const commonButtonStyle: React.CSSProperties = {
  marginTop: "10px",
  background: "#1F325C",
  color: "white",
  border: "none",
  width: "20%",
  height: "50px",
  borderRadius: "8px",
  padding: "20px 40px",
  fontSize: "1.2rem",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  // boxShadow: "0 2px 8px rgba(108,99,255,0.15)",
};

const NavigatorPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        background: "white",
        padding: "40px"
      }}
    >
      <h1 style={{ fontWeight: 400, fontSize: "2rem", marginBottom: "40px" }}>
        <span style={{ fontWeight: 700, color:"#1F325C" }}></span> Welcome to Skarvi Systems!
      </h1>
      <button
        style={commonButtonStyle}
        onClick={() => navigate("/dashboard")}
      >
        Navigator
      </button>
      <button
        style={commonButtonStyle}
        onClick={() => navigate("/development")}
      >
        Trader Co-pilot
      </button>
      <button
        style={commonButtonStyle}
        onClick={() => navigate("/development")}
      >
        
        Demurrage Manager
      </button>
      <button
        style={commonButtonStyle}
        onClick={() => navigate("/development")}
      >
      
        Fleet Compass
      </button>
    </div>
  );
};

export default NavigatorPage;
import React from "react";
import { useNavigate } from "react-router-dom";
import CustomNavbar from "../components/Navbar"; // Adjust the path as needed

const commonButtonStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, #1F325C, #3C4B6B)",
  color: "#fff",
  border: "none",
  width: "300px",
  height: "60px",
  borderRadius: "12px",
  padding: "15px 30px",
  fontSize: "1.2rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0 8px 16px rgba(31, 50, 92, 0.3)",
  transition: "all 0.3s ease-in-out",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const NavigatorPage = () => {
  const navigate = useNavigate();

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
    e.currentTarget.style.boxShadow = "0 12px 20px rgba(31, 50, 92, 0.45)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    e.currentTarget.style.boxShadow = "0 8px 16px rgba(31, 50, 92, 0.3)";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to bottom right, #ffffff, #ffffff)",
        fontFamily: "'Inter', sans-serif",
        color: "#333",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CustomNavbar isWelcomePage={true} />

      {/* Decorative floating circles */}
      <div
        style={{
          position: "absolute",
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(108,99,255,0.1), transparent)",
          top: "-200px",
          right: "-200px",
          filter: "blur(100px)",
          animation: "float 10s ease-in-out infinite alternate",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(255, 108, 148, 0.08), transparent)",
          bottom: "-150px",
          left: "-150px",
          filter: "blur(100px)",
          animation: "float 12s ease-in-out infinite alternate-reverse",
          zIndex: 0,
        }}
      />

      {/* Page content */}
      <div
        style={{
          flexGrow: 1,
          padding: "80px 100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            fontSize: "2.0rem",
            marginTop:"-20px",
            marginBottom: "30px",
            color: "#1F325C",
            lineHeight: "1.3",
            textShadow: "1px 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          Welcome to Skarvi Systems !<br />
          <span style={{ fontSize: "1.5rem", color: "#243f70" }}></span>
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          {[
            { label: "Navigator", path: "/dashboard" },
            { label: "Trader Co-pilot", path: "/development" },
            { label: "Demurrage Manager", path: "/development" },
            { label: "Fleet Compass", path: "/development" },
          ].map((item, idx) => (
            <button
              key={idx}
              style={commonButtonStyle}
              onClick={() => navigate(item.path)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Animation Keyframes */}
      <style>
        {`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(20px);
          }
        }
      `}
      </style>
    </div>
  );
};

export default NavigatorPage;

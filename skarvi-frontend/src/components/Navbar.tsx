import React, { useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/Navbar.css";
import { API_URL } from "../utils/utils";

const CustomNavbar: React.FC = () => {
  const [ALink, setALink] = useState<string>("db");
  const [isTradesOpen, setIsTradesOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    const accessToken = localStorage.getItem("access_token");

    try {
      if (refreshToken && accessToken) {
        await axios.post(
          `${API_URL}/api/auth/logout/`, 
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      try {
        // some code that might throw an error
      } catch (error) {
        const e = error as Error; // Type assertion
        console.log(e.message); 
      }
          }

    // Clear local storage and redirect to login
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <Navbar expand="lg" bg="" variant="light" className="shadow-sm" style={{ backgroundColor: "#1F325C", fontFamily: 'Roboto, sans-serif' }}>
      <Container fluid style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Navbar.Brand as={Link} to="/" onClick={() => setALink("db")} style={{ marginRight: "auto", paddingLeft: "0px", backgroundColor: "transparent" }}>
          <div style={{ padding: "0px", borderRadius: "0px", display: "inline-block", color: "blue" }}>
            <img
              src="/navbarlogo.png"
              alt="Logo"
              style={{
                width: "220px",
                height: "70px",
                maxWidth: "100%",
                objectFit: "contain",
                display: "block",
                backgroundColor: "#ffffff",
                borderRadius: "0.6rem",
                marginLeft: "-20px",
                marginTop: "-5px",
                marginBottom: "-13px"
              }}
            />
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ borderColor: "white", backgroundColor: "transparent", outline: "none", boxShadow: "none" }}>
          <span className="navbar-toggler-icon" style={{ filter: "brightness(0) invert(1)" }}></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto" style={{ gap: "10px", width: "100%", justifyContent: "flex-end", paddingTop: "1px", paddingLeft: "20px", backgroundColor: "transparent" }}>
            <Nav.Link as={Link} to="/dashboard" onClick={() => setALink("db")} style={{ backgroundColor: ALink === "db" ? "white" : "transparent", color: ALink === "db" ? "black" : "white", borderRadius: ALink === "db" ? "5px" : "0px", height: "40px", marginTop:"0px"}}>Dashboard</Nav.Link>

            <NavDropdown
              title="Trades"
              id="navbar-dropdown-trades"
              className="trades-dropdown"
              show={isTradesOpen}
              onMouseEnter={() => setIsTradesOpen(true)}
              onMouseLeave={() => setIsTradesOpen(false)}
            >
              <NavDropdown.Item as={Link} to="/physical-trades"
                onClick={() => setALink("physical-trades")}
                className="trades-dropdown-item"
                style={{
                  backgroundColor: ALink === "physical-trades" ? "#bfdbf7" : "transparent",
                  color: ALink === "physical-trades" ? "black" : "white",
                }}
              >
                Physical Trades
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/paper-trades"
                onClick={() => setALink("paper-trades")}
                className="trades-dropdown-item"
                style={{
                  backgroundColor: ALink === "paper-trades" ? "#bfdbf7" : "transparent",
                  color: ALink === "paper-trades" ? "black" : "white",
                }}
              >
                Paper Trades
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/chartering" onClick={() => setALink("chartering")} style={{ backgroundColor: ALink === "chartering" ? "white" : "transparent", color: ALink === "chartering" ? "black" : "white", borderRadius: ALink === "chartering" ? "5px" : "0px" }}>Chartering</Nav.Link>
            <Nav.Link as={Link} to="/reports" onClick={() => setALink("reports")} style={{ backgroundColor: ALink === "reports" ? "white" : "transparent", color: ALink === "reports" ? "black" : "white", borderRadius: ALink === "reports" ? "5px" : "0px" }}>Reports</Nav.Link>
            <Nav.Link as={Link} to="/operationsandlogistics" onClick={() => setALink("operationsandlogistics")} style={{ backgroundColor: ALink === "operationsandlogistics" ? "white" : "transparent", color: ALink === "operationsandlogistics" ? "black" : "white", borderRadius: ALink === "operationsandlogistics" ? "5px" : "0px" }}>Operations & Logistics</Nav.Link>
            <Nav.Link as={Link} to="/inventorymanagement" onClick={() => setALink("inventorymanagement")} style={{ backgroundColor: ALink === "inventorymanagement" ? "white" : "transparent", color: ALink === "inventorymanagement" ? "black" : "white", borderRadius: ALink === "inventorymanagement" ? "5px" : "0px" }}>Inventory Management</Nav.Link>
            <Nav.Link as={Link} to="/endofday" onClick={() => setALink("endofday")} style={{ backgroundColor: ALink === "endofday" ? "white" : "transparent", color: ALink === "endofday" ? "black" : "white", borderRadius: ALink === "endofday" ? "5px" : "0px" }}>End of Day</Nav.Link>
            <Nav.Link as={Link} to="/admintools" onClick={() => setALink("admintools")} style={{ backgroundColor: ALink === "admintools" ? "white" : "transparent", color: ALink === "admintools" ? "black" : "white", borderRadius: ALink === "admintools" ? "5px" : "0px" }}>Admin Tools</Nav.Link>
            <Nav.Item className="user-nav-item">
              <img src="/usericon.jpeg" alt="User Icon" className="user-icon" style={{ width: "20px", height: "20px", borderRadius: "50%", marginTop: "10px", marginLeft: "3px" }} />
            </Nav.Item>
            <NavDropdown title={<span id="logout">User</span>} id="navbar-dropdown" className="logout-dropdown" style={{ paddingLeft: "20px" }}>
              <NavDropdown.Item
                as="button"
                onClick={handleLogout}
                className="logout-item"
                style={{ padding: "2px 6px", margin: "0", height: "26px" }}
              >
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;

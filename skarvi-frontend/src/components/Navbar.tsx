import React, { useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/Navbar.css"; // Ensure this path is correct
import { API_URL } from "../utils/utils"; // Ensure this path is correct

interface CustomNavbarProps {
  isWelcomePage?: boolean; // New prop to determine if it's the welcome page
}

const CustomNavbar: React.FC<CustomNavbarProps> = ({ isWelcomePage }) => {
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
      const e = error as Error; // Type assertion
      console.error("Logout failed:", e.message); // Use console.error for errors
    }

    // Clear local storage and redirect to login regardless of logout API success
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <Navbar
      expand="lg"
      bg=""
      variant="dark" // Changed to dark for better contrast with blue background
      className="shadow-sm"
      style={{
        backgroundColor: "#1F325C",
        fontFamily: "Roboto, sans-serif",
        height: "80px", // Fixed height for a robust look
      }}
    >
      <Container
        fluid
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          height: "100%", // Ensure container takes full height
        }}
      >
        <Navbar.Brand
          as={Link}
          to={isWelcomePage ? "#" : "/"} // Prevent navigation on click if it's welcome page
          onClick={() => !isWelcomePage && setALink("db")}
          style={{
            marginRight: "auto",
            paddingLeft: "0px",
            backgroundColor: "transparent",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "0px",
              borderRadius: "0px",
              display: "inline-block",
            }}
          >
            <img
              src="/navbarlogo.png" // Ensure this path is correct
              alt="Logo"
              style={{
                width: "200px", // Slightly reduced width for better fit
                height: "60px", // Adjusted height
                maxWidth: "100%",
                objectFit: "contain",
                display: "block",
                backgroundColor: "#ffffff",
                borderRadius: "0.6rem",
                marginLeft: "-20px",
                marginTop: "-5px",
                marginBottom: "-5px", // Adjusted margin
              }}
            />
          </div>
        </Navbar.Brand>

        {/* Only show toggle and nav links if not welcome page */}
        {!isWelcomePage && (
          <>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              style={{
                borderColor: "black",
                backgroundColor: "transparent",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <span
                className="navbar-toggler-icon"
                style={{ filter: "brightness(0) invert(1)" }}
              ></span>
            </Navbar.Toggle>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav
                className="ms-auto"
                style={{
                  gap: "10px",
                  width: "100%",
                  justifyContent: "flex-end",
                  paddingTop: "1px",
                  paddingLeft: "20px",
                  backgroundColor: "transparent",
                }}
              >
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  onClick={() => setALink("db")}
                  style={{
                    backgroundColor: ALink === "db" ? "white" : "transparent",
                    color: ALink === "db" ? "black" : "white",
                    borderRadius: ALink === "db" ? "5px" : "0px",
                    height: "40px",
                    marginTop: "0px",
                    display: "flex",
                    alignItems: "center", // Vertically center text
                  }}
                >
                  Dashboard
                </Nav.Link>

                <NavDropdown
                  title="Trades"
                  id="navbar-dropdown-trades"
                  className="trades-dropdown"
                  show={isTradesOpen}
                  onMouseEnter={() => setIsTradesOpen(true)}
                  onMouseLeave={() => setIsTradesOpen(false)}
                >
                  <NavDropdown.Item
                    as={Link}
                    to="/physical-trades"
                    onClick={() => setALink("physical-trades")}
                    className="trades-dropdown-item"
                    style={{
                      backgroundColor:
                        ALink === "physical-trades" ? "#bfdbf7" : "transparent",
                      color: ALink === "physical-trades" ? "black" : "white",
                    }}
                  >
                    Physical Trades
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/paper-trades"
                    onClick={() => setALink("paper-trades")}
                    className="trades-dropdown-item"
                    style={{
                      backgroundColor:
                        ALink === "paper-trades" ? "#bfdbf7" : "transparent",
                      color: ALink === "paper-trades" ? "black" : "white",
                    }}
                  >
                    Paper Trades
                  </NavDropdown.Item>
                </NavDropdown>

                <Nav.Link
                  as={Link}
                  to="/chartering"
                  onClick={() => setALink("chartering")}
                  style={{
                    backgroundColor:
                      ALink === "chartering" ? "white" : "transparent",
                    color: ALink === "chartering" ? "black" : "white",
                    borderRadius: ALink === "chartering" ? "5px" : "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Chartering
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/reports"
                  onClick={() => setALink("reports")}
                  style={{
                    backgroundColor:
                      ALink === "reports" ? "white" : "transparent",
                    color: ALink === "reports" ? "black" : "white",
                    borderRadius: ALink === "reports" ? "5px" : "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Reports
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/operationsandlogistics"
                  onClick={() => setALink("operationsandlogistics")}
                  style={{
                    backgroundColor:
                      ALink === "operationsandlogistics"
                        ? "white"
                        : "transparent",
                    color:
                      ALink === "operationsandlogistics" ? "black" : "white",
                    borderRadius:
                      ALink === "operationsandlogistics" ? "5px" : "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Operations & Logistics
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/inventorymanagement"
                  onClick={() => setALink("inventorymanagement")}
                  style={{
                    backgroundColor:
                      ALink === "inventorymanagement" ? "white" : "transparent",
                    color:
                      ALink === "inventorymanagement" ? "black" : "white",
                    borderRadius:
                      ALink === "inventorymanagement" ? "5px" : "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Inventory Management
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/endofday"
                  onClick={() => setALink("endofday")}
                  style={{
                    backgroundColor:
                      ALink === "endofday" ? "white" : "transparent",
                    color: ALink === "endofday" ? "black" : "white",
                    borderRadius: ALink === "endofday" ? "5px" : "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  End of Day
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/admintools"
                  onClick={() => setALink("admintools")}
                  style={{
                    backgroundColor:
                      ALink === "admintools" ? "white" : "transparent",
                    color: ALink === "admintools" ? "black" : "white",
                    borderRadius: ALink === "admintools" ? "5px" : "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Admin Tools
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </>
        )}

        <Nav className="ms-auto" style={{ alignItems: "center" }}>
          <NavDropdown
            title={<span id="logout">User</span>}
            id="navbar-dropdown"
            className="logout-dropdown"
          >
            <NavDropdown.Item
              as="button"
              onClick={handleLogout}
              className="logout-item"
              style={{
                padding: "2px 6px",
                height: "26px",
                color: "black",
              }}
            >
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>

      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
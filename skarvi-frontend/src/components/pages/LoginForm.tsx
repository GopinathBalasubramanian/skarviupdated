import React, { useState } from "react";
import { loginUser } from "./login";
import { useNavigate } from "react-router-dom";

const companies = [
  "ELIN OIL HELLENIC PETROLEUM S",
  "SKARVI SYSTEMS",
  "OTHER COMPANY"
];

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState(companies[0]);
  const [error, setError] = useState("");
  const [token, setTokens] = useState<any>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser(username, password);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setTokens(response.data);
      setError("");
      navigate('/navigator');
    } catch (err: any) {
      setError("Invalid username or password");
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#fafbfc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "80vw",
          maxWidth: 1100,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Left Illustration */}
        <div
          style={{
            flex: 1.2,
            background: "#fafbfc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
          }}
        >
          <img
            src="/illustration.svg" // <-- replace with your illustration path
            alt="illustration"
            style={{ width: "80%", maxWidth: 400, minWidth: 250 }}
          />
        </div>
        {/* Right Login Form */}
        <div
          style={{
            flex: 1,
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontWeight: 600, fontSize: 32, marginBottom: 32, color: "#222" }}>Sign In</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ fontWeight: 500, color: "#444" }}>Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: "12px",
                  fontSize: 16,
                  marginTop: 6,
                  outline: "none",
                }}
                required
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, color: "#444" }}>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: "12px",
                  fontSize: 16,
                  marginTop: 6,
                  outline: "none",
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                background: "#5b4baf",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "14px",
                fontWeight: "bold",
                fontSize: 18,
                marginTop: 8,
                cursor: "pointer",
                letterSpacing: 1,
                width: "100%",
              }}
            >
              Log In
            </button>
          </form>
          {error && <p style={{ color: "#d32f2f", marginTop: 16 }}>{error}</p>}
          <div style={{ marginTop: 40, color: "#888", fontSize: 15 }}>
            — Find out more about us on —
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 16 }}>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg" alt="LinkedIn" style={{ width: 32, height: 32, background: "#fff", borderRadius: "50%" }} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg" alt="Twitter" style={{ width: 32, height: 32, background: "#fff", borderRadius: "50%" }} />
            </a>
            <a href="https://google.com" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg" alt="Google" style={{ width: 32, height: 32, background: "#fff", borderRadius: "50%" }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginForm;
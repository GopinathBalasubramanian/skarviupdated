import React, { useEffect, useState } from "react";
import LoginForm from "./components/pages/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomNavbar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import Homeboard from "./components/Homeboard";
import Physicaltrades from "./components/Physicaltrades";
import Papertrades from "./components/Papertrades";
import Chartering from "./components/Chartering";
import Reports from "./components/Reports";
import OperationsAndLogistics from "./components/OperationsAndLogistics";
import InventoryManagement from "./components/InventoryManagement";
import EndOfDay from "./components/EndOfDay";
import AdminTools from "./components/AdminTools";
import Development from "./components/Development";
import AddNewTrade from "./components/Papertrades_AddNewTrade";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/pages/Home";
import EditTrade from "./components/EditTrade"; 
import NavigatorPage from "./components/NavigatorPage";
import AddPhysicaltrade from "./components/Physicaltrade_Addbought";


function App() {
  const location = useLocation();
  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    // You can add token validation logic here if needed
    setIsTokenReady(true);
  }, []);

  if (!isTokenReady) {
    return <div>Loading...</div>;
  }

  // Hide navbar on login and navigator pages
  const hideNavbar = location.pathname === "/" || location.pathname === "/navigator";

  return (
    <>
      {!hideNavbar && <CustomNavbar />}

      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<ProtectedRoute><Homeboard /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/physical-trades" element={<ProtectedRoute><Physicaltrades /></ProtectedRoute>} />
        <Route path="/paper-trades" element={<ProtectedRoute><Papertrades /></ProtectedRoute>} />
        <Route path="/chartering" element={<ProtectedRoute><Chartering /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/operationsandlogistics" element={<ProtectedRoute><OperationsAndLogistics /></ProtectedRoute>} />
        <Route path="/inventorymanagement" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
        <Route path="/endofday" element={<ProtectedRoute><EndOfDay /></ProtectedRoute>} />
        <Route path="/admintools" element={<ProtectedRoute><AdminTools /></ProtectedRoute>} />
        <Route path="/development" element={<ProtectedRoute><Development /></ProtectedRoute>} />
        <Route path="/add-new-trade" element={<AddNewTrade />} />
        <Route path="/edit-trade" element={<EditTrade />} />
        <Route path="/navigator" element={<NavigatorPage />} />
        <Route path="/add-physical-trade" element={<ProtectedRoute><AddPhysicaltrade /></ProtectedRoute>}/>

      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
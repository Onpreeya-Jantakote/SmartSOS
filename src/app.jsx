import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/users/Login";
import Register from "./pages/users/Register";
import Dashboard from "./pages/users/Dashboard";
import EmergencyPage from "./pages/users/EmergencyPage";
import HistoryPage from "./pages/users/HistoryPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import AdminLogin from "./pages/admin/AdminLogin";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import RegisterAdmin from "./pages/admin/RegisterAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>กำลังตรวจสอบสถานะผู้ใช้...</p>;
  }

  return (
    <Router>
      <Routes>
        {/* ถ้าเข้า / จะ redirect ตามสถานะล็อกอิน */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        {/* หน้า register admin */}
        <Route path="/register/admin" element={user ? <Navigate to="/admindashboard" /> : <RegisterAdmin />} />

        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />

        <Route
          path="/adminLogin"
          element={user ? <Navigate to="/admindashboard" /> : <AdminLogin />}
        />

        <Route
          path="/admindashboard"
          element={
            user ? (
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            ) : (
              <Navigate to="/adminLogin" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
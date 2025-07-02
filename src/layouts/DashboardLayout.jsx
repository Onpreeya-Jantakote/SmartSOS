import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { FaUserCircle } from "react-icons/fa";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserName(user.displayName || user.email);
        }
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div>
            <nav style={{
                background: "#1e293b",
                color: "#f1f5f9",
                padding: "10px 30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}>
                <div style={{ fontWeight: "700", fontSize: "1.5rem" }}>
                    Smart SOS
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                    <Link to="/dashboard" style={linkStyle}>หน้าหลัก</Link>
                    <Link to="/dashboard/emergency" style={linkStyle}>แจ้งเหตุ</Link>
                    <Link to="/dashboard/history" style={linkStyle}>ติดตามเหตุ</Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f1f5f9" }}>
                        <FaUserCircle size={28} />
                        <span style={{ fontWeight: "600" }}>{userName}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "background-color 0.3s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
                        onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </nav>
            <main style={{ padding: 20 }}>
                <Outlet />
            </main>
        </div>
    );
};

const linkStyle = {
    color: "#cbd5e1",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "color 0.3s",
};

export default DashboardLayout;

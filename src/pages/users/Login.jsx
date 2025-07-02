import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      alert("เข้าสู่ระบบสำเร็จ!");
      navigate("/dashboard");
    } catch (err) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setShowModal(true); // เปิด modal
    }
  };

  return (
    <div style={styles.container}>
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: 10, fontSize: 20 }}>เข้าสู่ระบบไม่สำเร็จ</h3>
            <p style={{ color: "#ef4444", fontWeight: "600" }}>{error}</p>
            <button onClick={() => setShowModal(false)} style={styles.modalButton}>ปิด</button>
          </div>
        </div>
      )}

      <h2 style={styles.title}>เข้าสู่ระบบ</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          name="email"
          type="email"
          placeholder="อีเมล"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="password"
          type="password"
          placeholder="รหัสผ่าน"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          เข้าสู่ระบบ
        </button>
      </form>
      <p style={styles.text}>
        ยังไม่มีบัญชี?{" "}
        <Link to="/register" style={styles.link}>
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "80px auto",
    padding: 30,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Sarabun', sans-serif",
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 30,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  input: {
    padding: "12px 15px",
    fontSize: 16,
    borderRadius: 8,
    border: "1.8px solid #cbd5e1",
    outline: "none",
    transition: "border-color 0.3s",
  },
  button: {
    padding: "14px",
    fontSize: 18,
    fontWeight: "700",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 6px 12px rgba(59,130,246,0.5)",
    transition: "background-color 0.3s",
  },
  error: {
    color: "#ef4444",
    fontWeight: "600",
    marginTop: -10,
  },
  text: {
    marginTop: 20,
    fontSize: 14,
    color: "#475569",
  },
  link: {
    color: "#3b82f6",
    fontWeight: "600",
    textDecoration: "none",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
    maxWidth: 300,
  },
  modalButton: {
    marginTop: 20,
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    backgroundColor: "#ef4444",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

};

export default Login;

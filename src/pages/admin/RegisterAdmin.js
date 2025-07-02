import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email: form.email,
        role: "admin",
        createdAt: new Date(),
      });

      alert("สมัครสมาชิกเจ้าหน้าที่สำเร็จ!");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>สมัครสมาชิกเจ้าหน้าที่</h2>
      <form onSubmit={handleRegister} style={styles.form}>
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
        <input
          name="confirmPassword"
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          สมัครสมาชิก
        </button>
      </form>
      <p style={styles.text}>
        มีบัญชีแล้ว?{" "}
        <Link to="/adminLogin" style={styles.link}>
          เข้าสู่ระบบ
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
};

export default RegisterAdmin;

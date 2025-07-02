import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // ตรวจสอบ role จาก Firestore ว่าเป็น admin หรือไม่
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("ไม่พบข้อมูลผู้ใช้");
        return;
      }

      const userData = docSnap.data();

      if (userData.role !== "admin") {
        setError("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานแอดมิน");
        await auth.signOut(); // ออกจากระบบถ้าไม่ใช่ admin
        return;
      }

      alert("เข้าสู่ระบบแอดมินสำเร็จ!");
      navigate("/admindashboard");
    } catch (err) {
      console.error(err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>เข้าสู่ระบบแอดมิน</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="อีเมล"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
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
};

export default AdminLogin;
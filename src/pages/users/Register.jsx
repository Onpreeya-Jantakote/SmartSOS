import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase.js";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    studentId: "",
    dorm: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // สมัคร user กับ Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user; // ได้ uid ตรงนี้เลย

      // สร้าง document ใหม่ใน Firestore โดยใช้ uid เป็น ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: form.name,
        phone: form.phone,
        studentId: form.studentId,
        dorm: form.dorm,
        email: form.email,
        role: "user",
        createdAt: new Date(),
      });

      alert("✅ สมัครสมาชิกเรียบร้อยแล้ว!");

      // ล้างฟอร์ม
      setForm({
        name: "",
        phone: "",
        studentId: "",
        dorm: "",
        email: "",
        password: "",
      });

      // 👉 อาจ redirect ไปหน้า Login ก็ได้ เช่น:
      // navigate("/login");

    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      setError("❌ " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>สมัครสมาชิก</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <input
          name="name"
          placeholder="ชื่อ"
          value={form.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="phone"
          placeholder="เบอร์โทรศัพท์"
          value={form.phone}
          onChange={handleChange}
          required
          pattern="\d{10}"
          title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
          maxLength={10}
          inputMode="numeric"
          style={styles.input}
        />
        <input
          name="studentId"
          placeholder="รหัสนักศึกษา"
          value={form.studentId}
          onChange={handleChange}
          pattern="[\d-]{11}"
          title="กรุณากรอกเลขรหัสนักศึกษา 11 หลัก รวมเครื่องหมาย -"
          maxLength={11}
          required
          style={styles.input}
        />
        <input
          name="dorm"
          placeholder="สถานที่พัก"
          value={form.dorm}
          onChange={handleChange}
          required
          style={styles.input}
        />
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
          minLength={6}
          title="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          สมัครสมาชิก
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

export default Register;

import React from "react";

const Dashboard = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚨 ยินดีต้อนรับสู่ระบบแจ้งเหตุฉุกเฉิน</h1>
        <p style={styles.description}>
          ระบบนี้ช่วยให้คุณสามารถแจ้งเหตุฉุกเฉินได้อย่างรวดเร็ว พร้อมติดตามสถานะและดูประวัติการแจ้งเหตุย้อนหลังได้อย่างสะดวก
        </p>

        <ul style={styles.featureList}>
          <li>แจ้งเหตุฉุกเฉินพร้อมแนบตำแหน่งและรูปภาพ</li>
          <li>ตรวจสอบตำแหน่งและสถานะของเหตุการณ์</li>
          <li>ติดตามการตอบสนองของเจ้าหน้าที่</li>
          <li>ตรวจสอบประวัติการแจ้งเหตุของคุณ</li>
        </ul>

        <p style={styles.tip}>
          <strong>เริ่มต้นใช้งาน:</strong> คลิกที่ปุ่มด้านล่างเพื่อแจ้งเหตุฉุกเฉินครั้งแรกของคุณ
        </p>

        <button
          style={styles.button}
          onClick={() => window.location.href = "dashboard/emergency"}
        >
          แจ้งเหตุฉุกเฉินตอนนี้
        </button>

        <p style={styles.tip}>
          🔒 ข้อมูลของคุณจะถูกเก็บเป็นความลับ และเจ้าหน้าที่จะตอบสนองทันทีที่ได้รับแจ้ง
        </p>

        <img
          src="https://cdn-icons-png.flaticon.com/512/2387/2387635.png"
          alt="Emergency Icon"
          style={styles.image}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f4f8",
    fontFamily: "'Sarabun', sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "600px",
    width: "100%",
  },
  title: {
    fontSize: "28px",
    color: "#1e3a8a",
    marginBottom: "16px",
    fontWeight: "700",
  },
  description: {
    fontSize: "18px",
    color: "#334155",
    marginBottom: "20px",
  },
  featureList: {
    textAlign: "left",
    color: "#475569",
    marginBottom: "24px",
    fontSize: "16px",
    lineHeight: "1.8",
    paddingLeft: "0",
    listStylePosition: "inside",
  },
  tip: {
    fontSize: "15px",
    color: "#475569",
    marginTop: "10px",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "16px",
  },
  image: {
    width: "100px",
    opacity: 0.9,
    marginTop: "20px",
  },
};

export default Dashboard;
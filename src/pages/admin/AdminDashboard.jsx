import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  limit,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { getAuth, signOut } from "firebase/auth";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(null);
  const [emergencyCount, setEmergencyCount] = useState(null);
  const [inProgressCases, setInProgressCases] = useState([]);
  const [completedCases, setCompletedCases] = useState([]);
  const [typeStats, setTypeStats] = useState({});
  const [statusStats, setStatusStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [note, setNote] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const authInstance = getAuth();
  const [reporter, setReporter] = useState(null);

  const mapModalContainerStyle = {
    width: "100%",
    height: "250px",
    borderRadius: 10,
    marginTop: 10,
  };
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      setUserCount(usersSnapshot.size);

      const emergenciesSnapshot = await getDocs(collection(db, "emergencies"));
      setEmergencyCount(emergenciesSnapshot.size);

      const emergencies = emergenciesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // สรุปตามประเภทและสถานะ
      const typeSummary = {};
      const statusSummary = {};
      emergencies.forEach((e) => {
        typeSummary[e.type] = (typeSummary[e.type] || 0) + 1;
        statusSummary[e.status] = (statusSummary[e.status] || 0) + 1;
      });

      setTypeStats(typeSummary);
      setStatusStats(statusSummary);

      const q = query(
        collection(db, "emergencies"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const latestSnap = await getDocs(q);
      const latestList = latestSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const inProgress = latestList.filter(
        (e) => e.status === "รอการตอบสนอง" || e.status === "กำลังดำเนินการ"
      );
      const completed = latestList.filter((e) => e.status === "เสร็จสิ้น");

      setInProgressCases(inProgress);
      setCompletedCases(completed);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(authInstance);
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAcceptCase = async (item) => {
    try {
      const emergencyRef = doc(db, "emergencies", item.id);
      await updateDoc(emergencyRef, {
        status: "กำลังดำเนินการ",
      });

      await addDoc(collection(db, "history"), {
        ...item,
        status: "กำลังดำเนินการ",
        updatedAt: new Date(),
      });

      setModalMessage(`รับเคส "${item.type}" เรียบร้อยแล้ว`);
      setShowModal(true);
      fetchData();
    } catch (error) {
      console.error("รับเคสล้มเหลว:", error);
    }
  };

  const handleCompleteCase = (item) => {
    setSelectedCase(item);
    setShowCompleteModal(true);
  };

  const handleSubmitCompletion = async () => {
    if (!selectedCase) return;

    try {
      // ปิด modal ทั้งสองก่อน เพื่อป้องกัน modal รายละเอียดเด้งขึ้นซ้อน
      setSelectedCase(null);
      setShowCompleteModal(false);

      const emergencyRef = doc(db, "emergencies", selectedCase.id);

      await updateDoc(emergencyRef, {
        status: "เสร็จสิ้น",
        note: note || "",
        completedAt: new Date(),
      });

      await addDoc(collection(db, "history"), {
        ...selectedCase,
        status: "เสร็จสิ้น",
        note: note || "",
        completedAt: new Date(),
      });

      setModalMessage(`ดำเนินการ "${selectedCase.type}" เสร็จสิ้นแล้ว`);
      setShowModal(true);
      setNote("");

      fetchData();
    } catch (error) {
      console.error("อัปเดตเคสล้มเหลว:", error);
    }
  };

  const closeDetailModal = () => {
    setSelectedCase(null);
  };

  if (loading) return <p style={styles.message}>กำลังโหลดข้อมูล...</p>;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <h1 style={styles.logo}>Smart SOS Admin</h1>
        <button style={styles.logoutButton} onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </header>

      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, backgroundColor: "#3b82f6" }}>
          <h2 style={styles.statNumber}>{userCount}</h2>
          <p style={styles.statLabel}>จำนวนผู้ใช้งานทั้งหมด</p>
        </div>
        <div style={{ ...styles.statCard, backgroundColor: "#10b981" }}>
          <h2 style={styles.statNumber}>{emergencyCount}</h2>
          <p style={styles.statLabel}>จำนวนเหตุฉุกเฉินทั้งหมด</p>
        </div>
      </div>

      <section style={styles.summarySection}>
        <h2 style={styles.subtitle}>สรุปเหตุฉุกเฉินตามประเภท</h2>
        <ul>
          {Object.entries(typeStats).map(([type, count]) => (
            <li key={type}>
              {type}: {count} เคส
            </li>
          ))}
        </ul>
      </section>

      <section style={styles.summarySection}>
        <h2 style={styles.subtitle}>สถิติการตอบสนอง</h2>
        <ul>
          {Object.entries(statusStats).map(([status, count]) => (
            <li key={status}>
              {status}: {count} เคส
            </li>
          ))}
        </ul>
      </section>

      {/* เคสยังไม่เสร็จ */}
      <section style={styles.latestSection}>
        <h2 style={styles.subtitle}>เคสยังไม่สําเร็จ</h2>
        {inProgressCases.length === 0 ? (
          <p>ไม่มีเคสที่กำลังดำเนินการ</p>
        ) : (
          <ul style={styles.list}>
            {inProgressCases.map((item) => (
              <li key={item.id} style={styles.listItem}>
                <strong>{item.type}</strong> — {item.location} <br />
                <small style={{ color: "#64748b" }}>
                  {item.createdAt?.toDate().toLocaleString() || "-"}
                </small>
                <p>{item.description}</p>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...statusColor(item.status),
                  }}
                >
                  {item.status}
                </span>
                {item.status === "รอการตอบสนอง" && (
                  <button
                    style={styles.acceptButton}
                    onClick={() => handleAcceptCase(item)}
                  >
                    รับเคส
                  </button>
                )}
                {item.status === "กำลังดำเนินการ" && (
                  <button
                    style={{ ...styles.acceptButton, backgroundColor: "#16a34a" }}
                    onClick={() => handleCompleteCase(item)}
                  >
                    ดำเนินการเสร็จสิ้น
                  </button>
                )}
                <button
                  style={{
                    ...styles.acceptButton,
                    backgroundColor: "#64748b",
                    marginLeft: 10,
                  }}
                  onClick={() => setSelectedCase(item)}
                >
                  ดูรายละเอียด
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* เคสเสร็จสิ้น */}
      <section style={styles.latestSection}>
        <h2 style={styles.subtitle}>เคสที่ช่วยเสร็จสิ้น</h2>
        {completedCases.length === 0 ? (
          <p>ยังไม่มีเคสที่เสร็จสิ้น</p>
        ) : (
          <ul style={styles.list}>
            {completedCases.map((item) => (
              <li key={item.id} style={styles.listItem}>
                <strong>{item.type}</strong> — {item.location} <br />
                <small style={{ color: "#64748b" }}>
                  {item.createdAt?.toDate().toLocaleString() || "-"}
                </small>
                <p>{item.description}</p>
                <p>
                  <strong>หมายเหตุ:</strong> {item.note || "-"}
                </p>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...statusColor(item.status),
                  }}
                >
                  {item.status}
                </span>
                <button
                  style={{
                    ...styles.acceptButton,
                    backgroundColor: "#64748b",
                    marginLeft: 10,
                  }}
                  onClick={() => setSelectedCase(item)}
                >
                  ดูรายละเอียด
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal แจ้งเตือน */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>ปิด</button>
          </div>
        </div>
      )}

      {/* Modal บันทึกหมายเหตุ */}
      {showCompleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>บันทึกหมายเหตุ (ไม่บังคับ)</h3>
            <textarea
              rows={4}
              style={{ width: "100%", marginBottom: 15 }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม..."
            />
            <button
              onClick={handleSubmitCompletion}
              style={{
                ...styles.acceptButton,
                backgroundColor: "#16a34a",
                marginRight: 10,
              }}
            >
              ยืนยันการเสร็จสิ้น
            </button>
            <button onClick={() => setShowCompleteModal(false)}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Modal รายละเอียดเหตุการณ์ */}
      {selectedCase && !showCompleteModal && (
        <div style={styles.modalOverlay} onClick={closeDetailModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>รายละเอียดเหตุการณ์</h3>
            <p>
              <strong>ประเภท:</strong> {selectedCase.type}
            </p>
            <p>
              <strong>รายละเอียด:</strong>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{selectedCase.description}</p>
            <p>
              <strong>สถานะ:</strong> {selectedCase.status}
            </p>
            <p>
              <strong>วันที่แจ้ง:</strong>{" "}
              {selectedCase.createdAt?.toDate().toLocaleString() || "-"}
            </p>

            {/* แสดง Google Map ถ้าพิกัดพร้อมและโหลดแผนที่เสร็จ */}
            {isMapLoaded && selectedCase.lat && selectedCase.lng ? (
              <GoogleMap
                mapContainerStyle={mapModalContainerStyle}
                center={{ lat: selectedCase.lat, lng: selectedCase.lng }}
                zoom={17}
                options={{ disableDefaultUI: true }}
              >
                <Marker position={{ lat: selectedCase.lat, lng: selectedCase.lng }} />
              </GoogleMap>
            ) : (
              <p style={{ fontStyle: "italic", color: "#888", marginTop: 10 }}>
                ไม่พบข้อมูลตำแหน่งพิกัด
              </p>
            )}

            {selectedCase.imageBase64 ? (
              <img
                src={
                  selectedCase.imageBase64.startsWith("data:")
                    ? selectedCase.imageBase64
                    : `data:image/jpeg;base64,${selectedCase.imageBase64}`
                }
                alt="รูปเหตุการณ์"
                style={{ maxWidth: "100%", borderRadius: 10, marginTop: 10 }}
              />
            ) : (
              <p style={{ fontStyle: "italic", color: "#888", marginTop: 10 }}>
                No image
              </p>
            )}

            <button
              onClick={closeDetailModal}
              style={{
                marginTop: 20,
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const statusColor = (status) => {
  switch (status) {
    case "รอการตอบสนอง":
      return { backgroundColor: "#fbbf24", color: "#92400e" };
    case "กำลังดำเนินการ":
      return { backgroundColor: "#3b82f6", color: "#dbeafe" };
    case "เสร็จสิ้น":
      return { backgroundColor: "#22c55e", color: "#166534" };
    case "ปฏิเสธ":
      return { backgroundColor: "#ef4444", color: "#b91c1c" };
    default:
      return { backgroundColor: "#6b7280", color: "#f9fafb" };
  }
};

const styles = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Sarabun', sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 10,
    flexWrap: "wrap",
  },
  navLinks: {
    display: "flex",
    gap: "16px",
  },
  navLink: {
    color: "#1e293b",
    textDecoration: "none",
    fontWeight: "600",
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: "#1e293b",
    textAlign: "center",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    marginBottom: 40,
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 250px",
    padding: 20,
    borderRadius: 12,
    color: "#fff",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statNumber: {
    fontSize: 48,
    fontWeight: "700",
    margin: 0,
  },
  statLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  latestSection: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
  },
  summarySection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#334155",
  },
  list: {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    marginBottom: 15,
    position: "relative",
  },
  acceptButton: {
    marginTop: 10,
    padding: "6px 12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  statusBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: "4px 10px",
    borderRadius: 20,
    fontWeight: "700",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: 400,
  },
  message: {
    textAlign: "center",
    fontSize: 18,
    color: "#64748b",
    marginTop: 50,
  },
};

export default AdminDashboard;

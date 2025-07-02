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
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const HistoryPage = () => {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({ description: "", location: "" });

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setEmergencies([]);
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, "emergencies"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribeFirestore = onSnapshot(
                q,
                (querySnapshot) => {
                    const items = [];
                    querySnapshot.forEach((doc) => {
                        items.push({ id: doc.id, ...doc.data() });
                    });
                    setEmergencies(items);
                    setLoading(false);
                },
                (error) => {
                    console.error(error);
                    setLoading(false);
                }
            );

            return () => unsubscribeFirestore();
        });

        return () => unsubscribeAuth();
    }, []);

    const deleteEmergency = async (id) => {
        if (window.confirm("คุณต้องการยกเลิกรายการนี้ใช่หรือไม่?")) {
            try {
                await deleteDoc(doc(db, "emergencies", id));
            } catch (err) {
                console.error(err);
                alert("ไม่สามารถยกเลิกข้อมูลได้");
            }
        }
    };

    const openEditForm = (item) => {
        setEditForm({ description: item.description, location: item.location });
        setEditingItem(item);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "emergencies", editingItem.id), {
                description: editForm.description,
                location: editForm.location,
            });
            setEditingItem(null);
        } catch (err) {
            console.error(err);
            alert("ไม่สามารถแก้ไขข้อมูลได้");
        }
    };

    if (loading) return <p style={styles.message}>กำลังโหลดข้อมูล...</p>;
    if (emergencies.length === 0) return <p style={styles.message}>ยังไม่มีเหตุการณ์แจ้งไว้</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>ประวัติแจ้งเหตุของฉัน</h2>
            <div style={styles.cardList}>
                {emergencies.map((item) => (
                    <div key={item.id} style={styles.card}>
                        <div style={styles.header}>
                            <span style={styles.date}>
                                {item.createdAt?.toDate().toLocaleString() || "-"}
                            </span>
                            <span style={{ ...styles.status, ...statusColor(item.status) }}>
                                {item.status}
                            </span>
                        </div>
                        <h3 style={styles.type}>{item.type}</h3>
                        <p style={styles.location}>สถานที่: {item.location}</p>
                        <p style={styles.description}>รายละเอียด: {item.description}</p>

                        {item.imageBase64 ? (
                            <img
                                src={
                                    item.imageBase64.startsWith("data:")
                                        ? item.imageBase64
                                        : `data:image/jpeg;base64,${item.imageBase64}`
                                }
                                alt="รูปเหตุการณ์"
                                style={{ maxWidth: "100%", borderRadius: 10, marginTop: 10 }}
                            />
                        ) : (
                            <p style={{ color: "#888", fontStyle: "italic", marginTop: 10 }}>No image</p>
                        )}

                        <div style={styles.buttonRow}>
                            <button style={styles.editBtn} onClick={() => openEditForm(item)}>
                                แก้ไข
                            </button>
                            <button style={styles.deleteBtn} onClick={() => deleteEmergency(item.id)}>
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editingItem && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>แก้ไขเหตุการณ์</h3>
                        <form onSubmit={handleEditSubmit}>
                            <label>รายละเอียด:</label>
                            <textarea
                                name="description"
                                value={editForm.description}
                                onChange={handleEditChange}
                                rows={4}
                                required
                                style={{ width: "100%", marginBottom: 12 }}
                            />
                            <label>สถานที่:</label>
                            <input
                                name="location"
                                value={editForm.location}
                                onChange={handleEditChange}
                                required
                                style={{ width: "100%", marginBottom: 12 }}
                            />

                            {/* {(editingItem.imageUrl && editingItem.imageUrl.startsWith("http")) ? (
                                <img
                                    src={editingItem.imageUrl}
                                    alt="รูปเหตุการณ์"
                                    style={styles.image}
                                />
                            ) : (
                                editingItem.imageBase64 && (
                                    <img
                                        src={`data:image/jpeg;base64,${editingItem.imageBase64}`}
                                        alt="รูปเหตุการณ์"
                                        style={styles.image}
                                    />
                                )
                            )} */}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <button type="button" onClick={() => setEditingItem(null)}>
                                    ยกเลิก
                                </button>
                                <button type="submit">บันทึก</button>
                            </div>
                        </form>
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
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "'Sarabun', sans-serif",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 30,
        color: "#1e293b",
        textAlign: "center",
    },
    cardList: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
        gap: 20,
    },
    card: {
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "transform 0.2s",
        cursor: "default",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
    },
    date: {
        fontStyle: "italic",
    },
    status: {
        padding: "4px 10px",
        borderRadius: 20,
        fontWeight: "700",
        fontSize: 12,
        whiteSpace: "nowrap",
    },
    type: {
        fontSize: 20,
        color: "#334155",
        fontWeight: "700",
        margin: "10px 0 5px",
    },
    location: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
    },
    description: {
        fontSize: 16,
        color: "#334155",
        fontWeight: "600",
        whiteSpace: "pre-wrap",
        flexGrow: 1,
    },
    image: {
        marginTop: 15,
        maxWidth: "100%",
        borderRadius: 10,
        objectFit: "cover",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
    message: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 18,
        color: "#64748b",
        fontWeight: "600",
    },
    buttonRow: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
    },
    editBtn: {
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: "600",
    },
    deleteBtn: {
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: "600",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: 400,
        boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
    },
};

export default HistoryPage;

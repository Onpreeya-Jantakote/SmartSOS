import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

// สไตล์ & ขนาด Map
const containerStyle = {
  width: "100%",
  height: "300px",
};

const centerDefault = {
  lat: 17.8783,
  lng: 102.7413,
};

const EmergencyForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "",
    description: "",
    location: "",
    image: null,
    lat: null,
    lng: null,
  });

  const [isSubmitting, setSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchUserDorm = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setForm((prev) => ({
            ...prev,
            location: userData.dorm || "",
          }));
        }
      }
    };
    fetchUserDorm();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleMapClick = useCallback(async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        // หา component ที่เป็นชื่อสถานที่ เช่น premise, point_of_interest, establishment
        let placeName = "";
        for (const component of results[0].address_components) {
          if (component.types.includes("premise") || component.types.includes("point_of_interest") || component.types.includes("establishment")) {
            placeName = component.long_name;
            break;
          }
        }
        // ถ้าไม่เจอชื่อสถานที่ ให้ fallback เป็นชื่อเมือง หรือถนน
        if (!placeName) {
          for (const component of results[0].address_components) {
            if (component.types.includes("locality") || component.types.includes("sublocality") || component.types.includes("route")) {
              placeName = component.long_name;
              break;
            }
          }
        }
        // ถ้ายังไม่เจอ ให้ใช้ formatted_address แบบเต็ม
        if (!placeName) {
          placeName = results[0].formatted_address;
        }

        setForm((prev) => ({
          ...prev,
          lat,
          lng,
          location: placeName,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          lat,
          lng,
          location: `Lat: ${lat}, Lng: ${lng}`,
        }));
      }
    });

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("กรุณาเข้าสู่ระบบก่อนแจ้งเหตุ");
        setSubmitting(false);
        return;
      }

      let imageBase64 = "";
      if (form.image) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(form.image);
        });
      }

      await addDoc(collection(db, "emergencies"), {
        userId: user.uid,
        type: form.type,
        description: form.description,
        location: form.location,
        lat: form.lat,
        lng: form.lng,
        imageBase64,
        status: "รอการตอบสนอง",
        createdAt: serverTimestamp(),
      });

      alert("แจ้งเหตุสำเร็จ!");
      setForm({ type: "", description: "", location: "", image: null, lat: null, lng: null });
      navigate("/dashboard/history");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการแจ้งเหตุ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>แจ้งเหตุฉุกเฉิน</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>ประเภทเหตุ:</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="">-- เลือกประเภท --</option>
          <option value="อุบัติเหตุ">อุบัติเหตุ</option>
          <option value="เจ็บป่วย">เจ็บป่วย</option>
          <option value="ทะเลาะวิวาท">ทะเลาะวิวาท</option>
          <option value="ไฟไหม้">ไฟไหม้</option>
          <option value="อื่น ๆ">อื่น ๆ</option>
        </select>

        <label style={styles.label}>รายละเอียด:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="ระบุรายละเอียดเหตุการณ์"
          style={styles.textarea}
        />

        <label style={styles.label}>สถานที่เกิดเหตุ:</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          placeholder="ระบุสถานที่เกิดเหตุ"
          style={styles.input}
        />

        {isLoaded && (
          <>
            <label style={styles.label}>เลือกพิกัดจากแผนที่:</label>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={centerDefault}
              zoom={15}
              onClick={handleMapClick}
            >
              {form.lat && form.lng && <Marker position={{ lat: form.lat, lng: form.lng }} />}
            </GoogleMap>
          </>
        )}

        <label style={styles.label}>แนบรูป (ถ้ามี):</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          style={styles.fileInput}
        />

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? "กำลังส่ง..." : "แจ้งเหตุ"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 520,
    margin: "40px auto",
    padding: 30,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Sarabun', sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#1e293b",
    fontWeight: "700",
    fontSize: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: 8,
    color: "#334155",
    fontWeight: "600",
    fontSize: 16,
  },
  select: {
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1.8px solid #cbd5e1",
    marginBottom: 20,
    outline: "none",
    transition: "border-color 0.3s",
  },
  textarea: {
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "1.8px solid #cbd5e1",
    resize: "vertical",
    marginBottom: 20,
    outline: "none",
    transition: "border-color 0.3s",
  },
  input: {
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1.8px solid #cbd5e1",
    marginBottom: 20,
    outline: "none",
    transition: "border-color 0.3s",
  },
  fileInput: {
    marginBottom: 30,
    cursor: "pointer",
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
    transition: "background-color 0.3s",
    boxShadow: "0 6px 12px rgba(59,130,246,0.5)",
  },
};

export default EmergencyForm;

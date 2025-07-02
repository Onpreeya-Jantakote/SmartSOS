import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const EmergencyList = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "emergencies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setEmergencies(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>กำลังโหลดข้อมูลเหตุการณ์...</p>;
  if (emergencies.length === 0) return <p>ไม่มีเหตุการณ์แจ้ง</p>;

  return (
    <div>
      <h2>รายการเหตุฉุกเฉิน</h2>
      <ul>
        {emergencies.map((item) => (
          <li key={item.id}>
            [{item.status}] {item.type} - {item.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmergencyList;

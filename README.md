# 🚨 ระบบแจ้งเหตุฉุกเฉินในมหาวิทยาลัย (SmartSOS)

ระบบนี้ช่วยให้นักศึกษาหรือบุคลากรแจ้งเหตุฉุกเฉิน เช่น อุบัติเหตุ, เหตุทะเลาะวิวาท หรือปัญหาสุขภาพ ได้อย่างรวดเร็วผ่านแอป โดยมีแอดมินคอยรับเรื่องและจัดการอย่างเป็นระบบ

---

## 🗃️ ER Diagram

![ER Diagram](https://raw.githubusercontent.com/Onpreeya-Jantakote/SmartSOS/main/er%20smartsos.png
)

> แสดงความสัมพันธ์ของตาราง เช่น `users`, `emergencies`, `history`

---

## 📘 Use Case Diagram

![Use Case Diagram](https://raw.githubusercontent.com/Onpreeya-Jantakote/SmartSOS/blob/main/usecase%20smartsos.png
)

## ✨ คุณสมบัติหลัก

- แจ้งเหตุฉุกเฉินพร้อมระบุประเภท, รายละเอียด, ตำแหน่ง และแนบรูปภาพ
- แอดมินสามารถรับเคสและจัดการเคสได้แบบเรียลไทม์
- สรุปจำนวนเคสตามประเภท และดูประวัติเคสทั้งหมด
- ระบบแยกเคสที่ยังไม่ได้ช่วย กับเคสที่เสร็จสิ้นแล้ว
- รองรับการใช้งานแบบ Responsive

---

## 🛠 เทคโนโลยีที่ใช้

- **React.js** (Frontend)
- **Firebase** (Authentication + Firestore + Storage)
- **React Router**
- **CSS-in-JS** หรือ Tailwind (ถ้ามี)
- **Google Maps API** (ระบุตำแหน่งเหตุ)

---

> แสดงบทบาทของผู้ใช้งาน เช่น นักศึกษา และ เจ้าหน้าที่ กับฟีเจอร์ต่าง ๆ ที่ใช้งานได้

---

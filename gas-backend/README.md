# Khafai Project - คู่มือการติดตั้ง Google Apps Script (GAS) Backend

คู่มือการตั้งค่า Google Sheets + Google Apps Script เพื่อใช้เป็นฐานข้อมูลหลักสำหรับระบบ **Khafai**

---

## 📋 ขั้นตอนการติดตั้งและสร้าง Web App URL (5 นาที)

### 1. สร้าง Google Sheets ใหม่
1. ไปที่ [Google Sheets](https://sheets.new) แล้วสร้างสเปรดชีตใหม่
2. ตั้งชื่อสเปรดชีตว่า `Khafai-Database`

---

### 2. นำโค้ดไปวางใน Google Apps Script
1. ในหน้า Google Sheets ให้ไปที่เมนู **ส่วนขยาย (Extensions)** > **Apps Script**
2. คัดลอกโค้ดทั้งหมดจากไฟล์ [`gas-backend/Code.gs`](file:///D:/02_Work_Space/Projects/khafi_project/gas-backend/Code.gs) ไปวางทับในเอดิเตอร์ `Code.gs`
3. กดปุ่ม **บันทึก 💾 (Save)**

---

### 3. ปล่อยการปรับใช้เป็น Web App (Deploy)
1. กดปุ่ม **การปรับใช้ (Deploy)** สีฟ้ามุมขวาบน > เลือก **การปรับใช้ใหม่ (New deployment)**
2. คลิกรูปเฟือง ⚙️ ด้านซ้าย > เลือกประเภท **เว็บแอป (Web app)**
3. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description)**: `Khafai API Production v1.0`
   - **การดำเนินการเป็น (Execute as)**: `ฉัน (Me / บัญชี Google ของคุณ)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access)**: `ทุกคน (Anyone)` *(สำคัญมาก! เพื่อให้ Next.js API Proxy เชื่อมต่อได้)*
4. กดปุ่ม **การปรับใช้ (Deploy)**
5. กด **ให้สิทธิ์การเข้าถึง (Authorize access)** > เลือกรุ่นบัญชี Google ของคุณ > กด **Advanced** > กด **Go to Khafai-Database (unsafe)** > กด **Allow**
6. คัดลอก **URL เว็บแอป (Web App URL)** ที่ได้ (รูปแบบ `https://script.google.com/macros/s/.../exec`)

---

## 📊 โครงสร้างตารางอัตโนมัติ (Database Schema)

เมื่อสคริปต์ทำงานครั้งแรก จะทำการสร้างแท็บให้อัตโนมัติ 2 แท็บ ดังนี้:

### Tab 1: `Users`
| คอลัมน์ | ชื่อฟิลด์ | ชนิดข้อมูล | คำอธิบาย |
|:---:|:---|:---:|:---|
| A | `User_ID` | String | Unique Key (Google Sub ID) |
| B | `Email` | String | อีเมลผู้ใช้งาน |
| C | `Current_Rate_Per_Unit` | Number | อัตราค่าไฟต่อหน่วยปัจจุบัน (Default: 8.00 บาท) |
| D | `Created_At` | Timestamp | วันเวลาลงทะเบียน |

### Tab 2: `Meter_Logs`
| คอลัมน์ | ชื่อฟิลด์ | ชนิดข้อมูล | คำอธิบาย |
|:---:|:---|:---:|:---|
| A | `Log_ID` | String | UUID ของรายการบันทึก |
| B | `User_ID` | String | Key เจ้าของรายการ |
| C | `Record_Date` | Date | วันที่บันทึก (YYYY-MM-DD) |
| D | `Meter_Reading` | Number | เลขมิเตอร์ที่อ่านได้ |
| E | `Units_Used` | Number | จำนวนหน่วยที่ใช้จริง (คำนวณอัตโนมัติ) |
| F | `Total_Cost` | Number | ยอดค่าไฟรวม (คำนวณอัตโนมัติ) |
| G | `Is_New_Meter` | Boolean | เป็นจุดเริ่มต้นรอบมิเตอร์ใหม่หรือไม่ |
| H | `Created_At` | Timestamp | วันเวลาสร้างรายการ |

---

## 🔒 ฟีเจอร์ความปลอดภัยที่มีในสคริปต์ GAS นี้
1. **Multi-Device Concurrency Control**: ใช้ `LockService.getScriptLock()` จัดคิวป้องกันข้อมูลทับซ้อนเมื่อใช้งานหลายอุปกรณ์พร้อมกัน
2. **Auto Recalculation Engine**: เรียงลำดับวันที่และคำนวณหน่วยที่ใช้ + ค่าไฟย้อนหลังใหม่อัตโนมัติทุกครั้งที่มี Create, Update, Delete หรือเปลี่ยนค่าไฟ
3. **Delete Protection Rule**: ป้องกันการลบจุดเริ่มต้นของรอบมิเตอร์ใหม่จนกว่าจะลบรายการลูกในรอบนั้นออกก่อน

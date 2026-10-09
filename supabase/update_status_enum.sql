-- SQL สำหรับอัปเดตระบบฐานข้อมูลให้รองรับสถานะ 'matched'
-- ใช้ในกรณีที่ status ของตาราง job_applications และ job_broadcasts ถูกกำหนดเป็น ENUM type

-- เปลี่ยนชื่อ 'application_status' และ 'broadcast_status' ตามชื่อ ENUM จริงในฐานข้อมูลของคุณ
-- หาก status เป็นแค่ TEXT หรือ VARCHAR ปกติ **ไม่จำเป็น**ต้องรันไฟล์นี้

BEGIN;

-- ตัวอย่างการเพิ่มค่า 'matched' เข้าไปใน ENUM (ลบ Comment ออกเพื่อใช้งาน)
-- ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'matched';
-- ALTER TYPE broadcast_status ADD VALUE IF NOT EXISTS 'matched';

COMMIT;

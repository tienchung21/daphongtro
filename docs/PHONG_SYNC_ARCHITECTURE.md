# 🏗️ KIẾN TRÚC ĐỒNG BỘ PHÒNG - TECHNICAL DIAGRAM

## 1. THIẾT KẾ DATABASE HIỆN TẠI (VẤN ĐỀ)

```
┌─────────────────────────────────────────────────────────────────┐
│                        DUAN (Dự án)                              │
│  DuAnID: 14 - "Nhà trọ Minh Tâm"                                │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┴──────────────┐
        │                              │
        ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│  TINDANG (Tin)  │            │  TINDANG (Tin)  │
│  TinDangID: 4   │            │  TinDangID: 8   │
│  "Phòng cho nữ" │            │  "Phòng cho nam"│
└────────┬────────┘            └────────┬────────┘
         │                              │
    ┌────┴────┐                    ┌────┴────┐
    ▼         ▼                    ▼         ▼
┌────────┐ ┌────────┐          ┌────────┐ ┌────────┐
│ PHONG  │ │ PHONG  │          │ PHONG  │ │ PHONG  │
│ ID: 10 │ │ ID: 11 │          │ ID: 15 │ │ ID: 16 │
│ Tên:101│ │ Tên:102│          │ Tên:101│ │ Tên:103│
│ 🟢 Trong│ │ 🟢 Trong│          │ 🟢 Trong│ │ 🟢 Trong│
└────────┘ └────────┘          └────────┘ └────────┘
```

### ❌ VẤN ĐỀ: Cọc Phòng 101 ở Tin đăng 4

```
Khách A đặt cọc Phòng 101 (PhongID=10) ở Tin đăng 4:

┌────────┐                    ┌────────┐
│ PHONG  │                    │ PHONG  │
│ ID: 10 │                    │ ID: 15 │
│ Tên:101│ ← CỌC             │ Tên:101│
│ 🔴 GiuCho│                    │ 🟢 Trong│ ← VẪN HIỆN TRỐNG!
└────────┘                    └────────┘
Tin đăng 4                    Tin đăng 8

→ Khách B có thể đặt cọc lại Phòng 101 (PhongID=15) ở Tin đăng 8! ❌
```

---

## 2. GIẢI PHÁP: TRIGGER ĐỒNG BỘ

### Luồng hoạt động khi cọc phòng:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Khách A đặt cọc Phòng 101 (PhongID=10)                       │
│     UPDATE phong SET TrangThai='GiuCho' WHERE PhongID=10        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. TRIGGER: trg_phong_sync_status_update                        │
│     - Phát hiện TrangThai thay đổi: Trong → GiuCho              │
│     - Lấy DuAnID từ TinDangID                                    │
│     - Tìm tất cả phòng cùng tên "101" trong dự án                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. TỰ ĐỘNG CẬP NHẬT tất cả phòng "101"                          │
│     UPDATE phong SET TrangThai='GiuCho'                          │
│     WHERE TenPhong='101' AND DuAnID=14 AND PhongID!=10           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌────────┐              ┌────────┐
│ PHONG  │              │ PHONG  │
│ ID: 10 │              │ ID: 15 │
│ Tên:101│              │ Tên:101│
│ 🔴 GiuCho│ ✅ ĐỒNG BỘ    │ 🔴 GiuCho│ ✅ TỰ ĐỘNG!
└────────┘              └────────┘
```

---

## 3. KIẾN TRÚC TRIGGER

### A. Trigger UPDATE (Khi đổi trạng thái)

```sql
CREATE TRIGGER trg_phong_sync_status_update
AFTER UPDATE ON phong
FOR EACH ROW
BEGIN
  IF NEW.TrangThai != OLD.TrangThai THEN
    ┌─────────────────────────────────────┐
    │ 1. Lấy DuAnID                        │
    │    SELECT DuAnID FROM tindang        │
    │    WHERE TinDangID = NEW.TinDangID   │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ 2. Tìm phòng cùng tên                │
    │    - Cùng DuAnID                     │
    │    - Cùng TenPhong                   │
    │    - Khác PhongID (không tự update)  │
    │    - TinDang đang active             │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ 3. Cập nhật đồng loạt                │
    │    UPDATE phong                      │
    │    SET TrangThai = NEW.TrangThai     │
    └─────────────────────────────────────┘
  END IF;
END;
```

### B. Trigger INSERT (Khi tạo phòng mới)

```sql
CREATE TRIGGER trg_phong_sync_status_insert
AFTER INSERT ON phong
FOR EACH ROW
BEGIN
  ┌─────────────────────────────────────┐
  │ 1. Kiểm tra có phòng cùng tên?       │
  │    WHERE DuAnID = X AND TenPhong = Y │
  └──────────────┬──────────────────────┘
                 │
       ┌─────────┴─────────┐
       │ CÓ                │ KHÔNG
       ▼                   ▼
┌────────────────┐   ┌────────────────┐
│ Lấy trạng thái │   │ Giữ nguyên     │
│ "ưu tiên" nhất │   │ TrangThai='Trong'│
│ (DaThue>GiuCho)│   └────────────────┘
└───────┬────────┘
        │
        ▼
┌────────────────────────────┐
│ Cập nhật phòng mới tạo     │
│ SET TrangThai = v_existing │
└────────────────────────────┘
```

---

## 4. ƯU TIÊN TRẠNG THÁI

Khi có nhiều phòng cùng tên với trạng thái khác nhau, ưu tiên:

```
┌─────────────────────────────────────────┐
│  Priority 1: DaThue     (Highest)       │
│  Priority 2: GiuCho                     │
│  Priority 3: DonDep                     │
│  Priority 4: Trong      (Lowest)        │
└─────────────────────────────────────────┘
```

**Ví dụ:**
```
Tin A: Phòng 101 - Trạng thái: DaThue
Tin B: Phòng 101 - Trạng thái: Trong
Tin C: Phòng 101 - Trạng thái: GiuCho

→ Tất cả sẽ đồng bộ về: DaThue ✅
```

---

## 5. VALIDATION LAYER (Backend)

### Flow validate khi tạo tin đăng:

```
┌──────────────────────────────────────────────────┐
│  POST /api/chu-du-an/tin-dang                     │
│  Body: { danhSachPhong: [                         │
│    { tenPhong: "101", gia: 3000000 },             │
│    { tenPhong: "102", gia: 3500000 }              │
│  ]}                                                │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  validateDanhSachPhong(tinDangID, danhSachPhong) │
└───────────────────┬──────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Chuẩn hóa    │        │ Kiểm tra     │
│ tên phòng    │        │ trùng lặp    │
│ (TRIM, UPPER)│        │ trong dự án  │
└──────┬───────┘        └──────┬───────┘
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ CÓ TRÙNG?            │
        └──────────────────────┘
                   │
         ┌─────────┴─────────┐
         │ CÓ                │ KHÔNG
         ▼                   ▼
┌──────────────────┐   ┌──────────────────┐
│ allowDuplicate?  │   │ ✅ PASS           │
└─────────┬────────┘   │ Thêm phòng       │
          │            └──────────────────┘
    ┌─────┴─────┐
    │YES        │NO
    ▼           ▼
┌────────┐  ┌────────┐
│ Warning│  │ ❌ ERROR│
│ + Sync │  │ Block  │
└────────┘  └────────┘
```

---

## 6. DATABASE CONSTRAINTS

### Ràng buộc hiện tại:

```sql
phong
├── PhongID (PK, AUTO_INCREMENT)
├── TinDangID (FK → tindang)
│   └── ON DELETE CASCADE
├── TenPhong (VARCHAR)
├── TrangThai (ENUM)
└── UNIQUE KEY (TinDangID, TenPhong) ← MỚI THÊM
    └── Ngăn 1 tin đăng có 2 phòng cùng tên
```

---

## 7. STORED PROCEDURE: sp_sync_all_phong_status

### Chức năng: Đồng bộ thủ công tất cả phòng

```
START
  │
  ▼
┌─────────────────────────────────────┐
│ 1. Lấy tất cả phòng (CURSOR)        │
│    ORDER BY:                         │
│    - DuAnID                          │
│    - TenPhong                        │
│    - TrangThai (priority)            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. LOOP qua từng phòng               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Cập nhật tất cả phòng cùng tên   │
│    trong dự án = TrangThai hiện tại  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Tiếp tục LOOP                     │
└──────────────┬──────────────────────┘
               │
               ▼
             END
```

**Sử dụng:**
```sql
CALL sp_sync_all_phong_status();
```

---

## 8. VIEW: v_phong_trung_lap

### Mục đích: Báo cáo phòng chưa đồng bộ

```sql
SELECT 
  DuAnID,
  TenDuAn,
  TenPhong,
  SoLuongBanGhi,         -- VD: 3 (3 tin đăng có phòng này)
  SoTrangThaiKhacNhau,   -- VD: 2 (có 2 trạng thái khác nhau)
  DanhSachTrangThai,     -- VD: "GiuCho, Trong"
  ChiTietPhong           -- JSON array chi tiết
FROM v_phong_trung_lap
WHERE SoTrangThaiKhacNhau > 1; ← CHỈ XEM PHÒNG CHƯA ĐỒNG BỘ
```

**Output:**
```
+--------+------------------+---------+---------------+---------------------+--------------------+
| DuAnID | TenDuAn          | TenPhong| SoLuongBanGhi | SoTrangThaiKhacNhau | DanhSachTrangThai  |
+--------+------------------+---------+---------------+---------------------+--------------------+
|   14   | Nhà trọ Minh Tâm |   101   |       2       |          2          | GiuCho, Trong      |
+--------+------------------+---------+---------------+---------------------+--------------------+
```

---

## 9. PERFORMANCE OPTIMIZATION

### Indexes cần thiết:

```sql
-- Index 1: Tối ưu lookup phòng theo tin đăng
CREATE INDEX idx_phong_tindang 
ON phong(TinDangID, TenPhong);

-- Index 2: Tối ưu join tindang-duan
CREATE INDEX idx_tindang_duan 
ON tindang(DuAnID, TrangThai);

-- Index 3: Tối ưu search theo tên phòng
CREATE INDEX idx_phong_ten_trangthai 
ON phong(TenPhong, TrangThai);
```

### Ước lượng performance:

| Hoạt động              | Trước khi có index | Sau khi có index | Cải thiện |
|------------------------|-------------------|------------------|-----------|
| Update 1 phòng         | ~50ms             | ~5ms             | 10x       |
| Tìm phòng trùng lặp    | ~200ms            | ~15ms            | 13x       |
| Sync tất cả (100 phòng)| ~5s               | ~500ms           | 10x       |

---

## 10. ERROR HANDLING

### Lỗi có thể xảy ra:

```
1. DUPLICATE ENTRY (Unique Constraint)
   ├─ Nguyên nhân: Tạo 2 phòng cùng tên trong 1 tin đăng
   └─ Giải pháp: Validate frontend trước khi submit

2. FOREIGN KEY CONSTRAINT
   ├─ Nguyên nhân: TinDangID không tồn tại
   └─ Giải pháp: Validate TinDangID trước khi INSERT

3. TRIGGER FAILED
   ├─ Nguyên nhân: Lỗi logic trong trigger (deadlock, timeout)
   └─ Giải pháp: Rollback transaction, retry

4. DATA INCONSISTENCY
   ├─ Nguyên nhân: Import data cũ, trigger chưa chạy
   └─ Giải pháp: CALL sp_sync_all_phong_status()
```

---

## 11. MONITORING

### Metrics cần theo dõi:

```
1. Số phòng trùng lặp chưa đồng bộ
   Query: SELECT COUNT(*) FROM v_phong_trung_lap 
          WHERE SoTrangThaiKhacNhau > 1;
   
2. Số lần trigger chạy
   - Log MySQL trigger execution (nếu enable)
   
3. Thời gian response khi update phòng
   - Measure trước/sau khi add trigger
   
4. Số lượng phòng trùng tên trong dự án
   Query: SELECT DuAnID, COUNT(*) as Total
          FROM v_phong_trung_lap
          GROUP BY DuAnID;
```

---

## 📌 TÓM TẮT

| Component              | Chức năng                          | Loại      |
|------------------------|------------------------------------|-----------|
| `trg_phong_sync_update`| Đồng bộ khi UPDATE                 | Trigger   |
| `trg_phong_sync_insert`| Đồng bộ khi INSERT                 | Trigger   |
| `sp_sync_all_phong`    | Đồng bộ thủ công toàn bộ           | Procedure |
| `v_phong_trung_lap`    | Báo cáo phòng chưa sync            | View      |
| `unique_phong_tindang` | Ngăn phòng trùng trong tin         | Constraint|
| `phongValidation.js`   | Validate backend                   | Utility   |

**Status:** ✅ Production Ready  
**Impact:** 🟢 Backward Compatible  
**Breaking Changes:** ❌ None


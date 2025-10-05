# 🧪 TEST CASES - HIỂN THỊ THÔNG TIN PHÒNG

## Dữ liệu mẫu từ Database

### Test Case 1: TIN ĐĂNG PHÒNG ĐƠN (Không có bảng phong)
```javascript
const tinDang1 = {
  TinDangID: 1,
  TieuDe: "Khuyến mãi cực sốc, Hợp đồng 6 tháng tặng ngay 500k",
  Gia: 3000000,        // 3 triệu VNĐ
  DienTich: 50,        // 50 m²
  TongSoPhong: 0,      // ⚠️ Không có phòng riêng lẻ
  SoPhongTrong: 0,
  TenDuAn: "Dream House 1"
};

// Kết quả từ getThongTinPhong():
{
  loai: 'single',
  moTa: 'Phòng đơn',
  gia: 3000000,
  dienTich: 50,
  trangThai: 'Chưa có phòng'
}

// UI hiển thị:
┌────────────────────────────────┐
│ 📍 Phòng đơn                   │
│ ⚠️ Chưa có phòng               │
└────────────────────────────────┘
```

---

### Test Case 2: TIN ĐĂNG PHÒNG ĐƠN (Có 1 phòng, trống)
```javascript
const tinDang2 = {
  TinDangID: 2,
  TieuDe: "Phòng trọ giá rẻ gần chợ",
  Gia: 2500000,
  DienTich: 25,
  TongSoPhong: 1,      // ✅ 1 phòng duy nhất
  SoPhongTrong: 1,     // ✅ Còn trống
  TenDuAn: "Nhà trọ ABC"
};

// Kết quả từ getThongTinPhong():
{
  loai: 'single',
  moTa: 'Phòng đơn',
  soPhong: 1,
  trangThai: 'Còn trống',
  gia: 2500000,
  dienTich: 25
}

// UI hiển thị:
┌────────────────────────────────┐
│ 🏢 Nhà trọ ABC                 │
│ 💰 2.500.000 ₫                 │
│ 📐 25 m²                       │
├────────────────────────────────┤
│ 📍 Phòng đơn    [Còn trống ✅] │
└────────────────────────────────┘
```

---

### Test Case 3: TIN ĐĂNG PHÒNG ĐƠN (Có 1 phòng, đã thuê)
```javascript
const tinDang3 = {
  TinDangID: 3,
  TieuDe: "Phòng studio cao cấp",
  Gia: 5000000,
  DienTich: 35,
  TongSoPhong: 1,
  SoPhongTrong: 0,     // ❌ Đã thuê hết
  TenDuAn: "Green Tower"
};

// Kết quả từ getThongTinPhong():
{
  loai: 'single',
  moTa: 'Phòng đơn',
  soPhong: 1,
  trangThai: 'Đã thuê',
  gia: 5000000,
  dienTich: 35
}

// UI hiển thị:
┌────────────────────────────────┐
│ 📍 Phòng đơn    [Đã thuê 🔒]  │
└────────────────────────────────┘
```

---

### Test Case 4: TIN ĐĂNG NHIỀU PHÒNG (50% trống)
```javascript
const tinDang4 = {
  TinDangID: 4,
  TieuDe: "Phòng trọ giá rẻ cho nữ thuê",
  Gia: null,           // ⚠️ NULL vì mỗi phòng có giá khác nhau
  DienTich: null,      // ⚠️ NULL vì mỗi phòng có diện tích khác nhau
  TongSoPhong: 2,      // ✅ 2 phòng
  SoPhongTrong: 1,     // ✅ 1 trống, 1 đã thuê
  TenDuAn: "Nhà trọ Minh Tâm",
  
  // Dữ liệu chi tiết từ bảng `phong`:
  Phongs: [
    { PhongID: 1, TenPhong: "006", Gia: 3500000, DienTich: 25, TrangThai: "Trong" },
    { PhongID: 2, TenPhong: "1006", Gia: 4000000, DienTich: 25, TrangThai: "DaThue" }
  ]
};

// Kết quả từ getThongTinPhong():
{
  loai: 'multiple',
  moTa: '2 phòng',
  tongSo: 2,
  soTrong: 1,
  soDaThue: 1,
  tyLeTrong: '50'  // 50%
}

// UI hiển thị:
┌───────────────────────────────────────┐
│ 📍 2 phòng                            │
├───────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐        │
│ │  ✅  │  │  🔒  │  │  📊  │        │
│ │  1   │  │  1   │  │ 50%  │        │
│ │Trống │  │Đã thuê│  │Tỷ lệ│        │
│ └──────┘  └──────┘  └──────┘        │
├───────────────────────────────────────┤
│ [████████████████░░░░░░░░░░░░░] 50% │
└───────────────────────────────────────┘
```

---

### Test Case 5: TIN ĐĂNG NHIỀU PHÒNG (100% trống)
```javascript
const tinDang5 = {
  TinDangID: 5,
  TieuDe: "Căn hộ mini mới xây",
  Gia: null,
  DienTich: null,
  TongSoPhong: 8,
  SoPhongTrong: 8,     // 🎉 Tất cả còn trống
  TenDuAn: "Apartment X"
};

// Kết quả:
{
  loai: 'multiple',
  moTa: '8 phòng',
  tongSo: 8,
  soTrong: 8,
  soDaThue: 0,
  tyLeTrong: '100'
}

// UI hiển thị:
┌───────────────────────────────────────┐
│ 📍 8 phòng                            │
├───────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐        │
│ │  ✅  │  │  🔒  │  │  📊  │        │
│ │  8   │  │  0   │  │ 100% │        │
│ │Trống │  │Đã thuê│  │Tỷ lệ│        │
│ └──────┘  └──────┘  └──────┘        │
├───────────────────────────────────────┤
│ [████████████████████████████████] 100%│
└───────────────────────────────────────┘
```

---

### Test Case 6: TIN ĐĂNG NHIỀU PHÒNG (100% đã thuê)
```javascript
const tinDang6 = {
  TinDangID: 6,
  TieuDe: "Nhà trọ full phòng",
  TongSoPhong: 10,
  SoPhongTrong: 0,     // ❌ Đã hết phòng
  TenDuAn: "Happy House"
};

// Kết quả:
{
  loai: 'multiple',
  moTa: '10 phòng',
  tongSo: 10,
  soTrong: 0,
  soDaThue: 10,
  tyLeTrong: '0'       // 0%
}

// UI hiển thị:
┌───────────────────────────────────────┐
│ 📍 10 phòng                           │
├───────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐        │
│ │  ✅  │  │  🔒  │  │  📊  │        │
│ │  0   │  │  10  │  │  0%  │        │
│ │Trống │  │Đã thuê│  │Tỷ lệ│        │
│ └──────┘  └──────┘  └──────┘        │
├───────────────────────────────────────┤
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0% │
└───────────────────────────────────────┘
```

---

## ✅ CHECKLIST KIỂM TRA

- [ ] Phòng đơn có hiển thị giá và diện tích?
- [ ] Phòng đơn có badge trạng thái "Còn trống" / "Đã thuê"?
- [ ] Nhiều phòng có hiển thị 3 stats cards?
- [ ] Progress bar có animation shimmer?
- [ ] Progress bar width = tyLeTrong %?
- [ ] Màu sắc đúng: Green (trống), Gray/Red (đã thuê), Blue (tỷ lệ)?
- [ ] Responsive trên mobile (stack vertically)?
- [ ] Console không có error về parse JSON?

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot read property 'TongSoPhong' of undefined"
**Nguyên nhân:** Backend chưa trả về field `TongSoPhong`
**Giải pháp:**
```sql
-- Kiểm tra query trong server/models/ChuDuAnModel.js
SELECT 
  (SELECT COUNT(*) FROM phong p WHERE p.TinDangID = td.TinDangID) as TongSoPhong
```

### Lỗi: Progress bar không hiển thị
**Nguyên nhân:** `tyLeTrong` là string "50" thay vì number
**Giải pháp:**
```javascript
// Đã xử lý: parseFloat() trong style
style={{ width: `${parseFloat(thongTinPhong.tyLeTrong)}%` }}
```

### Lỗi: Stats cards bị vỡ layout
**Nguyên nhân:** Text quá dài hoặc font size quá lớn
**Giải pháp:**
```css
.qtd-room-stat-label {
  font-size: 0.7rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
```

---

**Last Updated:** 03/10/2025

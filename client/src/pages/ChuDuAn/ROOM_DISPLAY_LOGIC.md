# 📊 LOGIC HIỂN THỊ THÔNG TIN PHÒNG THÔNG MINH

## Ngày cập nhật: 03/10/2025

---

## 🎯 MỤC TIÊU
Cải thiện cách hiển thị thông tin phòng trong trang **Quản lý tin đăng** để:
- Phân biệt rõ ràng giữa **tin đăng 1 phòng** và **tin đăng nhiều phòng**
- Hiển thị thông tin phù hợp với từng loại
- Áp dụng nguyên tắc Figma Design System (visual hierarchy, progressive disclosure)

---

## 📐 CÁCH PHÂN LOẠI TIN ĐĂNG

### 1️⃣ **Tin đăng PHÒNG ĐỠN (Single Room)**

**Điều kiện:**
```javascript
TongSoPhong === 0 || TongSoPhong === 1
```

**Đặc điểm:**
- Chỉ có **1 phòng** hoặc không có bảng `phong` riêng lẻ
- Thông tin giá và diện tích lưu ở **tindang.Gia** và **tindang.DienTich**
- Hiển thị trạng thái: "Còn trống" hoặc "Đã thuê"

**Dữ liệu từ Database:**
```sql
SELECT 
  td.TinDangID,
  td.Gia,           -- Giá của phòng đơn
  td.DienTich,      -- Diện tích của phòng đơn
  (SELECT COUNT(*) FROM phong WHERE TinDangID = td.TinDangID) as TongSoPhong
FROM tindang td
WHERE TongSoPhong <= 1
```

**UI Component:**
```jsx
<div className="qtd-card-rooms-single">
  <span className="qtd-rooms-label">📍 Phòng đơn</span>
  <span className="qtd-rooms-status available">Còn trống</span>
</div>
```

---

### 2️⃣ **Tin đăng NHIỀU PHÒNG (Multiple Rooms)**

**Điều kiện:**
```javascript
TongSoPhong > 1
```

**Đặc điểm:**
- Có **2 phòng trở lên** trong bảng `phong`
- Mỗi phòng có giá và diện tích riêng
- Hiển thị: Tổng số phòng, số phòng trống, số đã thuê, tỷ lệ % trống
- `tindang.Gia` và `tindang.DienTich` có thể NULL

**Dữ liệu từ Database:**
```sql
SELECT 
  td.TinDangID,
  (SELECT COUNT(*) FROM phong WHERE TinDangID = td.TinDangID) as TongSoPhong,
  (SELECT COUNT(*) FROM phong WHERE TinDangID = td.TinDangID AND TrangThai = 'Trong') as SoPhongTrong,
  -- Các phòng chi tiết
  (SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
      'PhongID', PhongID,
      'TenPhong', TenPhong,
      'Gia', Gia,
      'DienTich', DienTich,
      'TrangThai', TrangThai,
      'URL', URL
    )
  ) FROM phong WHERE TinDangID = td.TinDangID) as DanhSachPhong
FROM tindang td
WHERE TongSoPhong > 1
```

**UI Component:**
```jsx
<div className="qtd-card-rooms-multiple">
  <div className="qtd-rooms-header">
    <span className="qtd-rooms-label">📍 4 phòng</span>
  </div>
  
  <div className="qtd-rooms-stats">
    {/* Phòng trống */}
    <div className="qtd-room-stat qtd-room-stat-available">
      <span className="qtd-room-stat-icon">✅</span>
      <span className="qtd-room-stat-value">2</span>
      <span className="qtd-room-stat-label">Còn trống</span>
    </div>
    
    {/* Phòng đã thuê */}
    <div className="qtd-room-stat qtd-room-stat-rented">
      <span className="qtd-room-stat-icon">🔒</span>
      <span className="qtd-room-stat-value">2</span>
      <span className="qtd-room-stat-label">Đã thuê</span>
    </div>
    
    {/* Tỷ lệ trống */}
    <div className="qtd-room-stat qtd-room-stat-percent">
      <span className="qtd-room-stat-icon">📊</span>
      <span className="qtd-room-stat-value">50%</span>
      <span className="qtd-room-stat-label">Tỷ lệ trống</span>
    </div>
  </div>
  
  {/* Progress bar */}
  <div className="qtd-rooms-progress">
    <div className="qtd-rooms-progress-bar" style="width: 50%"></div>
  </div>
</div>
```

---

## 🧮 HÀM XỬ LÝ LOGIC

### Function: `getThongTinPhong(tinDang)`

```javascript
/**
 * Lấy thông tin phòng thông minh
 * @param {Object} tinDang - Tin đăng object từ backend
 * @returns {Object} - Thông tin phòng để hiển thị
 */
const getThongTinPhong = (tinDang) => {
  const tongSo = tinDang.TongSoPhong || 0;
  const soTrong = tinDang.SoPhongTrong || 0;
  const soDaThue = tongSo - soTrong;
  
  // Case 1: Không có phòng riêng lẻ
  if (tongSo === 0) {
    return {
      loai: 'single',
      moTa: 'Phòng đơn',
      gia: tinDang.Gia,
      dienTich: tinDang.DienTich,
      trangThai: 'Chưa có phòng'
    };
  } 
  
  // Case 2: Chỉ có 1 phòng
  else if (tongSo === 1) {
    return {
      loai: 'single',
      moTa: 'Phòng đơn',
      soPhong: 1,
      trangThai: soTrong > 0 ? 'Còn trống' : 'Đã thuê',
      gia: tinDang.Gia,
      dienTich: tinDang.DienTich
    };
  } 
  
  // Case 3: Nhiều phòng
  else {
    return {
      loai: 'multiple',
      moTa: `${tongSo} phòng`,
      tongSo,
      soTrong,
      soDaThue,
      tyLeTrong: ((soTrong / tongSo) * 100).toFixed(0)
    };
  }
};
```

---

## 🎨 FIGMA DESIGN PRINCIPLES ÁP DỤNG

### 1. **Visual Hierarchy** (Thứ bậc thị giác)
- **Phòng đơn**: Hiển thị đơn giản, compact với badge trạng thái
- **Nhiều phòng**: Hiển thị chi tiết với 3 stats card + progress bar

### 2. **Progressive Disclosure** (Tiết lộ dần thông tin)
- Trang danh sách: Chỉ hiển thị tổng quan (số phòng, tỷ lệ trống)
- Trang chi tiết: Hiển thị đầy đủ danh sách từng phòng với giá riêng

### 3. **Consistent Spacing** (Khoảng cách đồng nhất)
```css
.qtd-card-rooms-multiple {
  padding: 14px;           /* Container padding */
  gap: 8px;                /* Gap giữa các elements */
}

.qtd-rooms-stats {
  grid-template-columns: repeat(3, 1fr);  /* 3 cột đều nhau */
  gap: 8px;                                /* Gap giữa stats */
}
```

### 4. **Meaningful Animation** (Animation có ý nghĩa)
```css
/* Progress bar grow animation */
.qtd-rooms-progress-bar {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Shimmer effect */
@keyframes qtd-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 5. **Color System** (Hệ thống màu)
```css
/* Phòng trống - Green */
.qtd-room-stat-available {
  border: 1.5px solid rgba(16, 185, 129, 0.3);
  color: #059669;
}

/* Phòng đã thuê - Gray/Red */
.qtd-room-stat-rented {
  border: 1.5px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

/* Tỷ lệ - Blue */
.qtd-room-stat-percent {
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  color: #2563eb;
}
```

---

## ✅ SO SÁNH VỚI DATABASE SCHEMA

### ✔️ **Đúng với `thue_tro.sql`:**

1. **Bảng `tindang`:**
   ```sql
   Gia DECIMAL(15,2) DEFAULT NULL,    -- NULL OK cho nhiều phòng
   DienTich DECIMAL(10,2) DEFAULT NULL  -- NULL OK cho nhiều phòng
   ```

2. **Bảng `phong`:**
   ```sql
   PhongID INT PRIMARY KEY,
   TinDangID INT NOT NULL,              -- FK đến tindang
   TenPhong VARCHAR(100),               -- '006', '1006', ...
   TrangThai ENUM('Trong','GiuCho','DaThue','DonDep'),
   Gia DECIMAL(15,2),                   -- Giá riêng từng phòng
   DienTich DECIMAL(5,2),               -- Diện tích riêng từng phòng
   URL VARCHAR(500)                     -- Ảnh đại diện phòng
   ```

3. **Backend Query:**
   ```sql
   -- File: server/models/ChuDuAnModel.js, lines 49-50
   (SELECT COUNT(*) FROM phong WHERE TinDangID = td.TinDangID) as TongSoPhong,
   (SELECT COUNT(*) FROM phong WHERE TinDangID = td.TinDangID AND TrangThai = 'Trong') as SoPhongTrong
   ```

### ❌ **Không sai lệch dữ liệu:**
- Backend đã tính đúng `TongSoPhong` và `SoPhongTrong`
- Frontend đang dùng chính xác các field này
- Không có hardcode hoặc giả định sai

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (>1200px):
- Stats cards: 3 cột ngang
- Progress bar: Full width
- Font size: 1.3rem cho value

### Tablet (768px - 1200px):
- Stats cards: 3 cột ngang (nhỏ hơn)
- Progress bar: Full width
- Font size: 1.2rem cho value

### Mobile (<768px):
```css
@media (max-width: 768px) {
  .qtd-rooms-stats {
    grid-template-columns: 1fr;  /* Stack vertically */
    gap: 6px;
  }
  
  .qtd-room-stat {
    flex-direction: row;  /* Icon + Value + Label ngang */
    justify-content: space-between;
  }
}
```

---

## 🔮 CẢI TIẾN TƯƠNG LAI (Future Enhancements)

### 1. **Hiển thị Range Giá** cho nhiều phòng:
```jsx
// Nếu các phòng có giá khác nhau
<div className="qtd-price-range">
  💰 {formatCurrency(minGia)} - {formatCurrency(maxGia)}
</div>
```

### 2. **Tooltip chi tiết** khi hover vào stats:
```jsx
<Tooltip content="2 phòng trống: 006, 1006">
  <div className="qtd-room-stat-available">...</div>
</Tooltip>
```

### 3. **Expand/Collapse** danh sách phòng ngay trong card:
```jsx
{expanded && (
  <div className="qtd-rooms-list">
    {danhSachPhong.map(phong => (
      <div key={phong.PhongID} className="qtd-room-item">
        <span>{phong.TenPhong}</span>
        <span>{formatCurrency(phong.Gia)}</span>
        <span className="status">{phong.TrangThai}</span>
      </div>
    ))}
  </div>
)}
```

### 4. **Real-time update** với WebSocket:
```javascript
socket.on('phong:updated', (data) => {
  // Cập nhật lại TongSoPhong, SoPhongTrong tự động
  updateTinDang(data.TinDangID, data.stats);
});
```

---

## 🛠️ FILES ĐÃ CHỈNH SỬA

1. **QuanLyTinDang_new.jsx**
   - Thêm function: `getThongTinPhong(tinDang)`
   - Cải thiện render logic trong map()
   - Lines modified: ~103-144, ~230-310

2. **QuanLyTinDang_new.css**
   - Thêm: `.qtd-card-rooms-single` (phòng đơn)
   - Thêm: `.qtd-card-rooms-multiple` (nhiều phòng)
   - Thêm: `.qtd-rooms-stats`, `.qtd-room-stat-*`
   - Thêm: `.qtd-rooms-progress` với shimmer animation
   - Lines added: ~370-545

---

## 📚 TÀI LIỆU THAM KHẢO

1. **Figma Design Principles**: https://www.figma.com/best-practices/
2. **Material Design - Cards**: https://m3.material.io/components/cards
3. **Use Cases v1.2**: `docs/use-cases-v1.2.md`
4. **Database Schema**: `thue_tro.sql` (lines 3251-3265, 3338-3378)

---

**Tác giả:** GitHub Copilot  
**Ngày:** 03/10/2025  
**Version:** 1.0

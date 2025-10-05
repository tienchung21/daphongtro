# 📄 CHI TIẾT TIN ĐĂNG - DOCUMENTATION

**Component:** `ChiTietTinDang.jsx` + `.css`  
**Route:** `/chu-du-an/tin-dang/:id`  
**Inspired by:** Nhà Tốt (nhatot.com)  
**Design System:** Dark Luxury Theme (ChuDuAn Module)  
**Ngày tạo:** 2024-01-XX

---

## 📋 Tổng quan

Trang chi tiết tin đăng cho phép Chủ dự án xem thông tin chi tiết, ảnh, vị trí, và các thông số kỹ thuật của tin đăng.

### **Use Case:** UC-PROJ-01 (Đăng tin cho thuê)
- **Actor:** Chủ dự án
- **Mục đích:** Xem chi tiết tin đăng để quản lý, chỉnh sửa, hoặc chia sẻ

---

## 🎨 Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                               │
│ [◄ Quay lại] [Breadcrumb...] [❤️ Lưu] [🔗 Chia sẻ] │
├───────────────────────────────┬─────────────────────┤
│                               │                     │
│  IMAGE GALLERY (Slider)       │  STICKY INFO CARD   │
│  [← Prev] [1/8] [Next →]      │  - Tiêu đề          │
│  [Thumbnails grid...]         │  - Giá: 4.25tr/th   │
│                               │  - 25m², 1 phòng    │
│  ┌─────────────────────────┐  │  - [Liên hệ ngay]   │
│  │ THÔNG SỐ CHI TIẾT       │  │  - [Gửi tin nhắn]   │
│  │ 📊 Giá, Diện tích, ...  │  │  - Chủ dự án        │
│  └─────────────────────────┘  │  - Mã tin, Status   │
│                               │                     │
│  ┌─────────────────────────┐  │                     │
│  │ MÔ TẢ CHI TIẾT          │  │                     │
│  │ [Long text...]          │  │                     │
│  └─────────────────────────┘  │                     │
│                               │                     │
│  ┌─────────────────────────┐  │                     │
│  │ TIỆN ÍCH                │  │                     │
│  │ ✓ WiFi ✓ Điều hòa...    │  │                     │
│  └─────────────────────────┘  │                     │
│                               │                     │
│  ┌─────────────────────────┐  │                     │
│  │ VỊ TRÍ & BẢN ĐỒ         │  │                     │
│  │ [Google Maps embed]     │  │                     │
│  └─────────────────────────┘  │                     │
│                               │                     │
└───────────────────────────────┴─────────────────────┘
│  ┌─────────────────────────────────────────────┐   │
│  │ TIN ĐĂNG TƯƠNG TỰ (Future)                  │   │
│  └─────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
```

---

## 🧩 Component Features

### **1. Header & Navigation**
- **Nút Quay lại** - Navigate back với history
- **Breadcrumb** - Dashboard > Quản lý tin đăng > Chi tiết
- **Actions:**
  - ❤️ **Lưu tin** - Toggle saved state (future: sync với backend)
  - 🔗 **Chia sẻ** - Copy URL to clipboard

### **2. Image Gallery Slider**
- **Main Display:** 500px height, responsive
- **Navigation:** Prev/Next arrows với hover effects
- **Counter:** "1/8" badge (bottom-right)
- **Thumbnails Grid:** Auto-fill minmax(100px)
- **Active State:** Border purple + shadow
- **Hover:** Scale 1.1 transform

### **3. Sticky Info Card** (Right Column)
- **Position:** `sticky` top 24px (desktop only)
- **Content:**
  - Tiêu đề (22px, font-weight 700)
  - Giá (32px, gradient gold #f59e0b)
  - Highlights (diện tích, số phòng)
  - CTA buttons (Liên hệ, Gửi tin nhắn)
  - Thông tin chủ dự án
  - Trạng thái & Mã tin

### **4. Thông số Chi tiết**
- **Grid Layout:** Auto-fill minmax(250px)
- **Each Item:**
  - Icon (40x40px, gradient purple background)
  - Label (13px, gray)
  - Value (16px, bold white)
- **Hover:** Lift + purple border
- **Data Points:**
  - Giá thuê, Diện tích, Loại phòng
  - Trạng thái, Tổng số phòng, Phòng trống
  - Đăng lúc, Lượt xem

### **5. Mô tả Chi tiết**
- **Font:** 15px, line-height 1.8
- **Color:** #d1d5db (light gray)
- **Format:** `white-space: pre-wrap` (preserve line breaks)
- **Empty State:** Italic gray text centered

### **6. Tiện ích Grid**
- **Layout:** Auto-fill minmax(200px)
- **Style:** Green accent (#10b981)
- **Icon:** CheckCircle (20px)

### **7. Vị trí & Bản đồ**
- **Address Card:** Blue accent, icon MapPin
- **Map Placeholder:** 300px height, dashed border
- **Future:** Google Maps embed với marker

---

## 🎨 Design Tokens

### **Colors:**
```css
/* Background */
--ctd-bg-card: rgba(255, 255, 255, 0.03);
--ctd-bg-card-hover: rgba(139, 92, 246, 0.05);

/* Primary (Purple) */
--ctd-primary: #8b5cf6;
--ctd-primary-hover: #a78bfa;

/* Accent (Gold) */
--ctd-price: #f59e0b;
--ctd-price-gradient: linear-gradient(135deg, #f59e0b, #fbbf24);

/* Success (Green) */
--ctd-success: #10b981;

/* Info (Blue) */
--ctd-info: #3b82f6;

/* Text */
--ctd-text-primary: #f9fafb;
--ctd-text-secondary: #d1d5db;
--ctd-text-muted: #9ca3af;
```

### **Spacing:**
```css
--ctd-spacing-xs: 8px;
--ctd-spacing-sm: 12px;
--ctd-spacing-md: 16px;
--ctd-spacing-lg: 24px;
--ctd-spacing-xl: 32px;
--ctd-spacing-2xl: 48px;
```

### **Border Radius:**
```css
--ctd-radius-sm: 8px;
--ctd-radius-md: 12px;
--ctd-radius-lg: 16px;
--ctd-radius-full: 50%;
```

---

## 📡 API Integration

### **Endpoint:** `GET /api/chu-du-an/tin-dang/:id`

**Response Example:**
```json
{
  "success": true,
  "data": {
    "TinDangID": 123,
    "TieuDe": "Phòng trọ cao cấp Cầu Giấy",
    "MoTa": "Phòng đẹp, đầy đủ nội thất...",
    "Gia": 4250000,
    "DienTich": 25,
    "DiaChi": "Đường Phú Diễn, Phường Phú Diễn, Quận Bắc Từ Liêm",
    "URL": "[\"path1.jpg\", \"path2.jpg\"]",
    "TienIch": "[\"WiFi\", \"Điều hòa\", \"Nóng lạnh\"]",
    "TrangThai": "HoatDong",
    "TongSoPhong": 5,
    "SoPhongTrong": 2,
    "LuotXem": 150,
    "TaoLuc": "2024-01-15T10:30:00Z",
    "TenDuAn": "Dự án Phú Diễn Plaza"
  }
}
```

### **Service Method:**
```javascript
// client/src/services/ChuDuAnService.js
TinDangService.layChiTiet(tinDangId)
  .then(response => {
    if (response.success) {
      setTinDang(response.data);
    }
  });
```

---

## 🔧 Component API

### **Props:**
Không có props (sử dụng `useParams` để lấy `id` từ URL)

### **State:**
```javascript
const [tinDang, setTinDang] = useState(null);           // Data tin đăng
const [loading, setLoading] = useState(true);            // Loading state
const [currentImageIndex, setCurrentImageIndex] = useState(0);  // Gallery index
const [danhSachAnh, setDanhSachAnh] = useState([]);     // Parsed images
const [tinTuongTu, setTinTuongTu] = useState([]);       // Related listings
const [daLuu, setDaLuu] = useState(false);              // Saved state
```

### **Key Functions:**

#### **parseImages(urlJson)**
Parse URL JSON từ database thành array URLs
```javascript
// Input: '["path1.jpg", "path2.jpg"]' hoặc '/uploads/image.jpg'
// Output: ['http://localhost:5000/uploads/path1.jpg', ...]
```

#### **parseTienIch(tienIchJson)**
Parse tiện ích JSON thành array
```javascript
// Input: '["WiFi", "Điều hòa"]'
// Output: ['WiFi', 'Điều hòa']
```

#### **formatCurrency(value)**
Format giá VND
```javascript
// Input: 4250000
// Output: "4.250.000 ₫"
```

#### **formatDate(dateString)**
Format ngày giờ
```javascript
// Input: "2024-01-15T10:30:00Z"
// Output: "15/01/2024"
```

#### **nextImage() / prevImage()**
Điều hướng gallery slider

#### **handleLuuTin()**
Toggle saved state (future: sync API)

#### **handleChiaSeHu()**
Copy URL to clipboard

---

## 📱 Responsive Breakpoints

### **Desktop (≥1024px):**
- Grid: 2 columns (left: 1fr, right: 400px sticky)
- Gallery: 500px height
- Specs grid: 2 columns

### **Tablet (768px - 1023px):**
- Grid: 1 column (info card below content)
- Gallery: 400px height
- Specs grid: 2 columns

### **Mobile (≤767px):**
- Grid: 1 column
- Gallery: 300px height
- Specs grid: 1 column
- Thumbnails: 3 columns
- Header actions: full width

---

## 🎯 User Interactions

### **Primary Actions:**
1. **Liên hệ ngay** → Call phone (future: show phone modal)
2. **Gửi tin nhắn** → Navigate to messaging (future)
3. **Lưu tin** → Toggle saved state
4. **Chia sẻ** → Copy URL to clipboard

### **Secondary Actions:**
1. **Quay lại** → Navigate back
2. **Gallery navigation** → Prev/Next arrows, thumbnails click
3. **View map** → Google Maps (future)

---

## ✅ Implementation Status

### **Completed:**
- ✅ Layout structure (2-column grid)
- ✅ Image gallery slider với thumbnails
- ✅ Sticky info card
- ✅ Thông số chi tiết grid
- ✅ Mô tả & Tiện ích display
- ✅ Breadcrumb & Header actions
- ✅ Dark luxury theme CSS
- ✅ Responsive mobile-first
- ✅ Loading & Error states
- ✅ API integration (layChiTiet)

### **TODO:**
- [ ] Google Maps embed (integrate Google Maps API)
- [ ] Tin đăng tương tự (implement API layTinTuongTu)
- [ ] Comment section (bình luận)
- [ ] Phone modal (hiển thị số điện thoại)
- [ ] Messaging integration (gửi tin nhắn)
- [ ] Saved listings sync (lưu tin với backend)
- [ ] Social share (Facebook, Zalo)
- [ ] Print PDF (xuất PDF tin đăng)

---

## 🐛 Known Issues

**None at this time** ✅

---

## 🧪 Testing Checklist

### **Functional:**
- [ ] Load chi tiết tin đăng từ API
- [ ] Gallery slider navigation (prev/next)
- [ ] Thumbnails click to change main image
- [ ] Sticky info card scroll (desktop)
- [ ] Lưu tin toggle state
- [ ] Chia sẻ copy URL to clipboard
- [ ] Breadcrumb navigation
- [ ] Format currency, date correctly
- [ ] Parse images, tiện ích JSON

### **UI/UX:**
- [ ] Dark luxury theme consistent
- [ ] Hover effects smooth
- [ ] Icons display correctly
- [ ] Loading state shows spinner
- [ ] Error state shows message
- [ ] Responsive on mobile, tablet, desktop

### **Cross-browser:**
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari

---

## 📚 Related Files

- **Component:** `client/src/pages/ChuDuAn/ChiTietTinDang.jsx`
- **Styles:** `client/src/pages/ChuDuAn/ChiTietTinDang.css`
- **Service:** `client/src/services/ChuDuAnService.js` (method: `layChiTiet`)
- **Backend API:** `server/api/ChuDuAn/tinDangRoutes.js` (GET `/tin-dang/:id`)
- **Design System:** `client/src/styles/ChuDuAnDesignSystem.css`

---

## 🎓 Best Practices Used

1. **Component Structure:** Functional component với React Hooks
2. **State Management:** Local state với useState
3. **API Calls:** Async/await với try-catch
4. **Error Handling:** Loading & Error states
5. **Responsive:** Mobile-first CSS với breakpoints
6. **Accessibility:** Semantic HTML, aria-labels (future)
7. **Performance:** Image lazy loading (future), memoization (future)
8. **Code Style:** JSDoc comments, consistent naming (tiếng Việt không dấu)

---

**Tạo bởi:** GitHub Copilot  
**Ngày:** 2024-01-XX  
**Status:** ✅ **IMPLEMENTED** (Core features complete, TODOs for enhancements)

# HƯỚNG DẪN CHO GITHUB COPILOT - TOÀN BỘ REPOSITORY

## Ngôn ngữ trả lời mặc định
- **Bắt buộc:** Luôn trả lời, đề xuất, và sinh code comment bằng **tiếng Việt**.

---

## 1. Bối cảnh Dự án và Nguồn tri thức
Dự án này là một nền tảng **cho thuê phòng trọ theo mô hình managed marketplace**.

**NGUỒN TRI THỨC CHÍNH:** Toàn bộ đặc tả nghiệp vụ chi tiết, các tác nhân và luồng sự kiện được ghi lại trong file **`docs/use-cases-v1.2.md`**. Hãy luôn ưu tiên tham chiếu file này khi được hỏi về logic nghiệp vụ.

### Tóm tắt các Tác nhân chính:
* **Khách hàng (Customer):** Người dùng cuối có nhu cầu tìm kiếm và thuê một nơi ở phù hợp.
* **Chủ dự án (Project Owner):** Cá nhân hoặc tổ chức sở hữu bất động sản cho thuê.
* **Nhân viên Bán hàng (Sales Staff):** Đại diện tuyến đầu của công ty, chịu trách nhiệm trực tiếp trong việc hỗ trợ và dẫn dắt khách hàng.
* **Nhân viên Điều hành (Operator):** Quản trị viên nội bộ, chịu trách nhiệm duy trì tính toàn vẹn và chất lượng của nền tảng.
* **Quản trị viên Hệ thống (System Administrator):** Người dùng kỹ thuật cấp cao nhất, chịu trách nhiệm về sức khỏe, an ninh và cấu hình tổng thể của nền tảng.

---

## 2. Stack Công nghệ
-   **Backend:** Node.js (Express.js, JavaScript) - `server/`
-   **Frontend:** React (Vite, JavaScript/JSX) - `client/`
-   **Database:** MySQL/MariaDB
-   **Icons:** React Icons (Heroicons v2) - `react-icons@5.4.0`

### Ghi chú cho giai đoạn Development
- Backend dev lắng nghe cổng `5000` (xem `server/index.js`). Nếu dùng reverse proxy (Nginx), cấu hình `proxy_pass http://backend:5000/`.
- Kết nối DB dùng `mysql2` (không ORM). Đọc cấu hình từ biến môi trường: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
- Redis/Workers/MinIO là tùy chọn trong dev; bắt buộc khi lên staging/production.

### Cấu trúc Frontend (chuẩn hóa)
```
client/src/
├── pages/
│   ├── ChuDuAn/              # Module Chủ dự án (DARK LUXURY THEME)
│   │   ├── Dashboard.jsx/.css         # Tổng quan với metrics cards
│   │   ├── QuanLyTinDang.jsx/.css     # Danh sách tin đăng (table view)
│   │   ├── QuanLyTinDang_new.jsx/.css # Room display logic thông minh
│   │   ├── TaoTinDang.jsx/.css        # Form tạo tin (validation + upload)
│   │   ├── BaoCaoHieuSuat.jsx/.css    # Báo cáo với time filters
│   │   └── index.js                   # Export tất cả components
│   ├── login/                # Trang đăng nhập
│   ├── dangky/               # Trang đăng ký
│   └── trangchu/             # Trang chủ công khai
├── components/
│   ├── ChuDuAn/
│   │   ├── NavigationChuDuAn.jsx/.css # Sidebar navigation collapsible
│   │   ├── ModalTaoNhanhDuAn.jsx      # Modal tạo dự án nhanh
│   │   ├── ModalCapNhatDuAn.jsx/.css  # Modal chỉnh sửa dự án (V2 - với geocoding)
│   │   ├── ModalQuanLyChinhSachCoc.jsx/.css # Modal quản lý chính sách cọc
│   │   ├── ModalYeuCauMoLaiDuAn.jsx/.css # Modal yêu cầu mở lại dự án banned
│   │   ├── ModalChinhSuaToaDo.jsx     # Modal điều chỉnh tọa độ GPS
│   │   ├── AddressAutocompleteInput.jsx/.css # Input tự động suggest địa chỉ
│   │   └── README.md                  # Documentation cấu trúc components
│   ├── Layout/               # Layout components tái sử dụng
│   ├── header.jsx/.css       # Header chung
│   └── footer.jsx/.css       # Footer chung
├── layouts/
│   └── ChuDuAnLayout.jsx/.css # Layout wrapper cho module Chủ dự án
├── services/
│   └── ChuDuAnService.js     # API calls tập trung cho Chủ dự án
├── styles/
│   └── ChuDuAnDesignSystem.css # Design tokens cho Chủ dự án
├── context/                  # React Context (Auth, Role, Theme)
├── hooks/                    # Custom hooks
└── utils/                    # Utility functions
```

### Quy ước Component Naming (Frontend)
- **Page:** `TenTrang.jsx` + `TenTrang.css` trong cùng thư mục `pages/TenTrang/`
- **Component:** `TenComponent.jsx` + `TenComponent.css` trong `components/TenComponent/`
- **Layout:** `TenLayout.jsx` + `TenLayout.css` trong `layouts/`
- **Service:** `tenService.js` trong `services/`

### Cấu trúc Backend (chuẩn hóa)
```
server/
├── api/
│   ├── ChuDuAn/              # Routes cho module Chủ dự án
│   │   ├── tinDangRoutes.js         # Routes quản lý tin đăng
│   │   ├── quanLyTinDang.js         # Routes CRUD tin đăng
│   │   ├── uploadRoutes.js          # Routes upload ảnh
│   │   └── khuVucRoutes.js          # Routes quản lý khu vực
│   └── ...                   # Các module khác
├── controllers/
│   ├── ChuDuAnController.js  # Controller cho Chủ dự án (validate + call service)
│   └── userController.js     # Controller user chung
├── models/
│   ├── ChuDuAnModel.js       # Model xử lý DB logic (mysql2 queries)
│   └── userModel.js          # Model user chung
├── services/
│   └── NhatKyHeThongService.js # Audit log service (tracking actions)
├── middleware/
│   ├── auth.js               # JWT authentication
│   ├── authSimple.js         # Auth đơn giản cho dev
│   ├── role.js               # RBAC + ownership verification
│   └── roleSimple.js         # Role checking đơn giản
├── routes/
│   ├── chuDuAnRoutes.js      # Mount tất cả routes /api/chu-du-an
│   ├── tinDangRoutes.js      # Routes tin đăng
│   └── userRoutes.js         # Routes user
├── config/
│   └── db.js                 # MySQL connection pool (mysql2)
├── jobs/                     # Cron jobs (TTL cọc, notifications)
├── utils/                    # Utility functions (format, validation)
├── constants/                # Enums (trangThai.js, loaiCoc.js)
└── index.js                  # Entry point (Express app)
```

### Quy ước Backend Naming
- **Controller:** `TenController.js` - HTTP layer (validate input, call service)
- **Model:** `TenModel.js` - Database layer (mysql2 queries, transactions)
- **Service:** `TenService.js` - Business logic (reusable, framework-agnostic)
- **Route:** `tenRoutes.js` - Route definitions (express router)
- **Middleware:** `ten.js` - Express middleware (auth, role, logging)

---

## 3. Quy tắc Lập trình

### 3.1. Quy tắc chung
* **Format:** Dùng ESLint và Prettier. Thụt lề 2 dấu cách.
* **Types trong JavaScript:** Dùng **JSDoc** để định nghĩa kiểu dữ liệu.
* **Commit Message:** `type(scope): short description` (ví dụ: `feat(api): add login endpoint`).
* **Bảo mật:** Luôn validate input, dùng parameterized queries (qua ORM) và không commit secrets.
* **Testing:** Code mới phải có unit test đi kèm, mục tiêu coverage > 80%.

### 3.2. Quy tắc Kỹ thuật Đặc thù của Dự án

| Mục | Quy định |
|-----|----------|
| **Idempotency** | Mọi API thay đổi dữ liệu quan trọng (đặt cọc, đặt hẹn) phải đi qua Middleware `idempotency.js` (dùng Redis cache TTL 24h). |
| **TTL Cọc** | Luôn tuân thủ nghiệp vụ `CọcGiữChỗ` có TTL. Sử dụng Cron worker `jobs/releaseExpiredDeposits.js` để tự động giải tỏa cọc hết hạn. |
| **Thanh toán** | Các giao dịch cọc ưu tiên luồng **Authorize/Capture (payment hold)** qua cổng thanh toán, không trừ tiền ngay lập tức. |
| **Audit Log** | Mọi hành động thay đổi trạng thái dữ liệu quan trọng (duyệt tin, đổi trạng thái hẹn, khóa tài khoản) phải gọi service ghi log (`NhatKyHeThongService.ghiNhan(...)`). |

### 3.3. 📝 QUY TẮC ĐẶT TÊN BẮT BUỘC
**Sử dụng tiếng Việt không dấu cho tên file và class:**

#### Tên file:
- **Component/Page:** `TrangChu.jsx`, `DangKy.jsx`, `QuanLyTinDang.jsx`
- **Service/Utility:** `nguoiDungService.js`, `tinDangUtils.js`, `authHelper.js`
- **Model:** `NguoiDungModel.js`, `TinDangModel.js`, `CuocHenModel.js`

#### Tên class/function:
- **Class:** `NguoiDungController`, `TinDangService`, `CuocHenManager`
- **Function:** `taoNguoiDung()`, `layDanhSachTinDang()`, `capNhatTrangThai()`
- **Component:** `const TrangChu = () => {}`, `const FormDangKy = () => {}`

#### Ngoại lệ (KHÔNG áp dụng tiếng Việt):
- **Thuật ngữ kỹ thuật:** `api`, `socket`, `token`, `middleware`, `config`
- **Thư viện/Framework:** `express`, `react`, `mysql`, `jwt`
- **Tiêu chuẩn web:** `http`, `cors`, `csrf`, `oauth`
- **File cấu hình:** `package.json`, `eslint.config.js`, `vite.config.js`

### 3.4. 🗄️ QUY TẮC DATABASE BẮT BUỘC
**TUYỆT ĐỐI tuân thủ schema trong file `thue_tro.sql` và sử dụng migration cho mọi thay đổi:**

#### Tên bảng và cột (BẮT BUỘC sử dụng chính xác):
- **Tên bảng:** Viết thường, không dấu (ví dụ: `nguoidung`, `tindang`)
- **Tên cột:** PascalCase tiếng Việt không dấu (ví dụ: `NguoiDungID`, `TenDayDu`)

---

## 4. Quy tắc Bảo vệ File và Cấu trúc

### 🚨 CẤM TUYỆT ĐỐI chỉnh sửa các file sau:
**CHỈ ĐƯỢC ĐỌC, KHÔNG ĐƯỢỢC SỬA:**
```

daphongtro/
├── .gitignore
├── README.md  
├── thue_tro.sql
├── server/
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
├── client/
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── index.css
│   │   ├── main.jsx

```

### ✅ ĐƯỢC PHÉP tạo mới/chỉnh sửa:
- File trong thư mục `server/utils/`, `server/socket/`, `server/services/`, `server/models/`, `server/api/`
- File trong thư mục `client/src/services/`, `client/src/pages/`, `client/src/components/`, `client/src/styles`

---

## 5. Checklist Bắt buộc cho Pull Request

- [ ] Lint + test pass CI?  
- [ ] Coverage ≥ 80 % (backend & frontend).  
- [ ] Migration `down` chạy thành công (nếu có thay đổi DB)?  
- [ ] Đặt tên file/class tiếng Việt đúng quy ước?
- [ ] Endpoint mới đã được bảo vệ bởi middleware phân quyền (RBAC) phù hợp?
- [ ] Nếu thêm endpoint thay đổi dữ liệu → viết test idempotency.  
- [ ] Nếu liên quan nghiệp vụ cọc → cập nhật TTL job (nếu cần).  
- [ ] UI PR: đính kèm screenshot desktop/mobile & Lighthouse ≥ 90.

---

## 6. Hướng dẫn chuyên biệt theo từng lớp
**QUAN TRỌNG:** Khi làm việc với các file cụ thể, hãy tham chiếu các hướng dẫn chuyên sâu:

- **`.github/copilot/backend.md`** - Hướng dẫn chi tiết cho `server/**/*.js`
  - Idempotency & TTL Cọc logic
  - RBAC & "Act-as" flows  
  - Ledger accounting patterns
  - Transaction patterns với mysql2
  
- **`.github/copilot/frontend.md`** - Hướng dẫn chi tiết cho `client/src/**/*.{js,jsx}`
  - Component architecture & RBAC UI
  - State management (React Query + Context)
  - Role-based theming patterns
  
- **`.github/copilot/infrastructure.md`** - Hướng dẫn cho DB/Docker/CI
  - Docker Compose multi-service setup
  - Migration patterns với Sequelize
  - Nginx reverse proxy config

## 7. Module Chủ Dự Án - Thiết kế & Triển khai

### 7.1. 🎨 Design System - Light Glass Morphism Theme
**Tham chiếu:** `client/src/styles/ChuDuAnDesignSystem.css`, `client/src/pages/ChuDuAn/Dashboard.css`

#### Color Palette:
```css
/* Background - Light Theme */
--color-white: #ffffff;
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;

/* Brand Colors */
--color-primary: #8b5cf6;          /* Vibrant Purple */
--color-primary-dark: #6006fc;     /* Deep Purple */
--color-primary-light: #a78bfa;    /* Light Purple */
--color-primary-bg: rgba(139, 92, 246, 0.08);  /* Purple background tint */

/* Secondary Colors */
--color-secondary: #f59e0b;        /* Warm Gold */
--color-success: #10b981;          /* Green */
--color-danger: #ef4444;           /* Red */
--color-info: #3b82f6;             /* Blue */

/* Glass Morphism - Light Theme */
--color-glass-white: rgba(255, 255, 255, 0.8);
--color-glass-light: rgba(255, 255, 255, 0.6);
--color-glass-border: rgba(255, 255, 255, 0.4);
--color-glass-shadow: rgba(139, 92, 246, 0.1);

/* Text Colors - Light Theme */
--color-text-primary: #111827;     /* Dark text on light background */
--color-text-secondary: #6b7280;   /* Gray text */
```

#### Design Principles:
1. **Light Glass Morphism:** Cards với `backdrop-filter: blur(10px)`, white/transparent backgrounds
2. **Gradient Accents:** Purple gradient hero (`linear-gradient(135deg, #8b5cf6 0%, #6006fc 100%)`)
3. **Border Top Colors:** Metric cards có border-top 4px màu semantic
4. **Subtle Shadows:** `box-shadow: 0 8px 24px rgba(139, 92, 246, 0.08)`
5. **Hover Effects:** Transform + shadow tăng + border-color change

#### Component Architecture:
- **Layout:** `ChuDuAnLayout.jsx` - Sidebar + Main content, responsive
- **Navigation:** `NavigationChuDuAn.jsx` - Collapsible sidebar (280px ↔ 72px)
- **Design Tokens:** `ChuDuAnDesignSystem.css` - Centralized design tokens (`:root` level)
- **Glass Morphism:** `backdrop-filter: blur(10px)`, white transparent backgrounds, subtle borders

#### Dashboard-Specific Components:
- **Hero Section:** Gradient purple background với floating animation
- **Quick Actions:** 4 buttons ở đầu trang (Green primary, White secondary/tertiary/quaternary)
- **Metric Cards:** White cards với colored border-top (violet/blue/green/orange)
- **Charts:** CSS-based bar charts với tooltips, SVG circular progress
- **Status Bars:** Horizontal progress bars với gradient fills + shimmer animation

#### Key Principles:
1. **Mobile-first:** Code cho màn hình nhỏ trước, mở rộng bằng `@media (min-width)`
2. **Global design tokens:** Colors/spacing định nghĩa trong `:root` (ChuDuAnDesignSystem.css)
3. **CSS per page:** Mỗi page có file `.css` riêng cho component-specific styles
4. **Responsive breakpoints:** 480px (mobile), 768px (tablet), 1024px (desktop), 1280px (large)
5. **Animation timing:** `cubic-bezier(0.4, 0, 0.2, 1)` cho smooth transitions

#### CSS Architecture Rules:
```css
/* ✅ CORRECT - Global tokens */
:root {
  --color-primary: #8b5cf6;
  --color-success: #10b981;
}

/* ✅ CORRECT - Component-specific class */
.dashboard-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, #6006fc 100%);
}

/* ❌ WRONG - Inline styles trong JSX (chỉ dùng khi cần dynamic values) */
<div style={{ color: '#8b5cf6' }}>...</div>
```

#### Animation Guidelines:
```css
/* Hover transitions - 0.3s */
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Keyframe animations - 2s+ infinite */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Pulse for icons */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 7.2. 🏗️ Backend Architecture - Chủ Dự Án
**Tham chiếu:** `docs/chu-du-an-routes-implementation.md`

#### API Endpoints theo Use Cases:

**UC-PROJ-01: Đăng tin cho thuê**
```
GET    /api/chu-du-an/tin-dang           # Danh sách tin đăng
POST   /api/chu-du-an/tin-dang           # Tạo tin đăng mới (validate ảnh bắt buộc)
GET    /api/chu-du-an/tin-dang/:id       # Chi tiết tin đăng
PUT    /api/chu-du-an/tin-dang/:id       # Cập nhật tin đăng
POST   /api/chu-du-an/tin-dang/:id/gui-duyet  # Gửi duyệt (audit log)
```

**UC-PROJ-02: Quản lý cuộc hẹn**
```
GET    /api/chu-du-an/cuoc-hen           # Danh sách cuộc hẹn
POST   /api/chu-du-an/cuoc-hen/:id/xac-nhan  # Xác nhận cuộc hẹn
```

**UC-PROJ-03: Báo cáo hiệu suất**
```
GET    /api/chu-du-an/bao-cao            # Báo cáo theo time range
GET    /api/chu-du-an/dashboard          # Dashboard tổng quan
```

#### Validation Rules:
- **DuAnID:** Bắt buộc, phải thuộc sở hữu, trạng thái "HoatDong"
- **TieuDe:** Bắt buộc, 10-200 ký tự
- **Gia:** Bắt buộc nếu phòng đơn, > 0
- **DienTich:** Bắt buộc nếu phòng đơn, > 0
- **URL (ảnh):** Bắt buộc ít nhất 1 ảnh, max 5MB/ảnh, type: image/*

#### Security:
- JWT authentication (`auth.js` middleware)
- Role-based access control (`role.js` middleware)
- Ownership verification (chỉ sửa tin đăng của mình)
- Audit log cho mọi hành động quan trọng

### 7.3. 📊 Logic Hiển Thị Phòng Thông Minh
**Tham chiếu:** `client/src/pages/ChuDuAn/ROOM_DISPLAY_LOGIC.md`

#### Phân loại Tin Đăng:

**1. Phòng Đơn (Single Room):**
```javascript
TongSoPhong === 0 || TongSoPhong === 1
```
- Thông tin lưu ở `tindang.Gia`, `tindang.DienTich`
- Hiển thị: "Phòng đơn" + Trạng thái (Còn trống / Đã thuê)
- UI: Compact layout, dễ quét nhanh

**2. Nhiều Phòng (Multiple Rooms):**
```javascript
TongSoPhong > 1
```
- Mỗi phòng có giá/diện tích riêng trong bảng `phong`
- Hiển thị: Tổng số phòng, phòng trống, đã thuê, tỷ lệ %
- UI: Stats cards với progress bar động
- `tindang.Gia`, `tindang.DienTich` có thể NULL

#### Progressive Disclosure:
- **Danh sách:** Chỉ tổng quan (tổng phòng, tỷ lệ trống)
- **Hover:** Có thể mở rộng (future enhancement)
- **Chi tiết:** Navigate đến trang riêng để xem từng phòng

#### Visual Hierarchy:
- **Green (#10b981):** Phòng trống, tích cực
- **Gray/Red (#6b7280, #ef4444):** Phòng đã thuê
- **Blue (#3b82f6):** Tỷ lệ %, thông tin
- **Shimmer animation:** Progress bar động

### 7.4. 🎯 Icon System - React Icons
**Tham chiếu:** `client/src/components/ICON_USAGE_GUIDE.md`, `ICON_FINAL_SUMMARY.md`

#### Implementation Status:
- ✅ Package: `react-icons@5.4.0` (với --legacy-peer-deps)
- ✅ Icon set: Heroicons v2 (`react-icons/hi2`)
- ✅ Bundle impact: +12KB gzipped
- ✅ Performance: +15-20% faster render vs emoji

#### Usage Pattern:
```jsx
import { HiOutlineHome, HiOutlineCurrencyDollar } from 'react-icons/hi2';

// Inline với className
<HiOutlineHome className="icon" />

// Inline với style
<HiOutlineCurrencyDollar style={{ width: 20, height: 20, color: '#10b981' }} />
```

#### Icon Mapping (Common):
- `HiOutlineHome` → 🏢 Nhà/Dự án
- `HiOutlineCurrencyDollar` → 💰 Tiền
- `HiOutlineMapPin` → 📍 Vị trí
- `HiOutlineCheckCircle` → ✅ Thành công
- `HiOutlineChartBar` → 📊 Báo cáo
- `HiOutlineCalendar` → 📅 Lịch hẹn
- `HiOutlineDocumentText` → 📝 Tài liệu
- `HiOutlineArrowTrendingUp` → 📈 Xu hướng (NOT HiOutlineTrendingUp)

#### Best Practices:
1. **Always verify icon names** trước khi import (check react-icons.github.io)
2. **Tree-shaking:** Chỉ import icons thực sự dùng
3. **Consistent sizing:** Inline styles cho size, CSS classes cho colors
4. **Accessibility:** Thêm aria-label nếu icon standalone

### 7.5. 🐛 Known Issues & Fixes
**Tham chiếu:** `client/src/pages/ChuDuAn/FIXED_ISSUES.md`

#### Issue 1: Layout không giãn toàn màn hình
**Fix:** 
```css
.cda-table-container { width: 100%; }
.cda-table { width: 100%; min-width: 100%; table-layout: fixed; }
```

#### Issue 2: Thiếu ảnh preview
**Fix:** Parse JSON từ `URL` field, hiển thị thumbnail 60x60px với fallback icon

#### Issue 3: Icon import error (Dashboard)
**Fix:** `HiOutlineTrendingUp` → `HiOutlineArrowTrendingUp` (4 locations)

### 7.6. 📋 Dashboard Implementation Status
**Tham chiếu:** `client/src/pages/ChuDuAn/Dashboard.jsx`, `Dashboard.css`

#### Dashboard Features - Completed ✅:
1. **Hero Section với Quick Actions**
   - Gradient purple background với floating animation
   - 4 quick action buttons (Tạo tin đăng, Quản lý tin, Báo cáo, Cuộc hẹn)
   - Responsive grid layout

2. **Enhanced Metric Cards (4 cards)**
   - Tổng tin đăng (Violet border)
   - Đang hoạt động (Blue border)
   - Cuộc hẹn sắp tới (Green border)
   - Doanh thu tháng này (Orange border)
   - Hover effects với transform + shadow

3. **Dashboard Analytics**
   - Biểu đồ doanh thu 6 tháng (CSS bars với tooltips)
   - Tỷ lệ lấp đầy (SVG circular progress)
   - Phân bố trạng thái (Horizontal bars với shimmer)
   - Thống kê tương tác (Views + Favorites cards)

4. **Data Display Sections**
   - Tin đăng gần đây (List với badges)
   - Cuộc hẹn sắp tới (Calendar-style cards)
   - Empty states với friendly messages

#### Files Modified:
- ✅ `Dashboard.jsx` + `Dashboard.css` - Complete redesign với Light Glass Morphism
- ✅ `QuanLyTinDang_new.jsx` + `.css` - Room display logic
- ✅ `TaoTinDang.jsx` - Image upload validation
- ✅ `BaoCaoHieuSuat.jsx` - Report với time filters
- ✅ `NavigationChuDuAn.jsx` - Sidebar navigation
- ✅ `ChuDuAnDesignSystem.css` - Global design tokens

#### Quality Assurance:
- ✅ CSS imported correctly (`import './Dashboard.css'`)
- ✅ All React Icons imported (`HiOutlineEye`, `HiOutlineArrowTrendingUp`, etc.)
- ✅ Responsive design (mobile → tablet → desktop)
- ✅ Glass morphism effects applied
- ✅ Animations smooth (`cubic-bezier(0.4, 0, 0.2, 1)`)
- ✅ Color semantic coding (violet/blue/green/orange)
- [ ] Backend API integration pending
- [ ] Real data testing pending

---

## 8. Tài liệu tham khảo
- **`docs/use-cases-v1.2.md`** – Nguồn nghiệp vụ duy nhất và tối cao
- **`docs/chu-du-an-routes-implementation.md`** – API routes & architecture cho Chủ dự án
- **`client/src/pages/ChuDuAn/README_REDESIGN.md`** – Design system & UI principles
- **`client/src/pages/ChuDuAn/ROOM_DISPLAY_LOGIC.md`** – Logic hiển thị phòng thông minh
- **`client/src/pages/ChuDuAn/FIXED_ISSUES.md`** – Các bug đã fix
- **`client/src/components/ICON_USAGE_GUIDE.md`** – Hướng dẫn sử dụng React Icons
- **`ICON_FINAL_SUMMARY.md`** – Tổng kết icon system upgrade
- **`README.md`** – Hướng dẫn khởi chạy, scripts
- **`.env.example`** – Thông số môi trường chuẩn
---
applyTo: ["client/src/**/*.{js,jsx,css}"]
---

# HƯỚNG DẪN COPILOT CHO FRONTEND (REACT + VITE) — v1.4 (Liquid Glass, Mobile-first, CSS theo trang)

> Ngôn ngữ mặc định: luôn dùng tiếng Việt.
> Mục tiêu: Giao diện đẹp trên đa thiết bị (mobile-first), không style `:root`, CSS tách riêng cho từng trang theo đúng quy ước đặt tên & vị trí lưu trữ của dự án. Bổ sung phong cách “liquid glass” giống iOS (nền mờ, kính mỏng, highlight tinh tế) ở cấp TRANG/COMPONENT, không toàn cục.

---

## 0) Nguyên tắc UI bắt buộc

- Mobile-first: code cho màn hình nhỏ trước, mở rộng bằng `@media (min-width)`; tránh hard-code kích thước cố định.
- Không style `:root`: Tuyệt đối không khai báo biến hay style ở `:root`. Mọi biến màu/spacing đặt trong container của trang (CSS).
- CSS theo trang: mỗi Page và Component có file `.css` riêng cùng thư mục. Không tạo `theme.css` hay stylesheet global mới.
- Không sửa `client/src/index.css` (được bảo vệ trong repo).
- Tên file & thư mục: tiếng Việt không dấu theo quy ước của repo (ví dụ: `QuanLyTinDang.jsx`, `QuanLyTinDang.css`).
- Liquid glass (iOS-style): sử dụng nền mờ trong suốt (`backdrop-filter`), viền nhẹ, gradient tinh tế, highlight bóng mờ; áp dụng tại CSS của từng trang/component, đảm bảo tương phản và fallback khi không hỗ trợ blur.

---

## 1) Cấu trúc thư mục (chuẩn hóa)

| Thư mục | Nội dung |
|---|---|
| `client/src/pages/<TenTrang>/` | Một trang đầy đủ. VD: `QuanLyTinDang/QuanLyTinDang.jsx` + `QuanLyTinDang.css` |
| `client/src/components/<TenComponent>/` | Component tái sử dụng. VD: `HopThoaiCoc/HopThoaiCoc.jsx` + `.css` |
| `client/src/services/` | Gọi API (`axios`) + React Query |
| `client/src/context/` | `AuthContext`, `RoleThemeContext` |
| `client/src/hooks/` | `useAuth`, `usePermissions`, `useDebounce`, … |

Ví dụ cây thư mục chuẩn:

```
client/src/
  pages/
    QuanLyTinDang/
      QuanLyTinDang.jsx
      QuanLyTinDang.css
    BanGiao/
      LapBienBanBanGiao.jsx
      LapBienBanBanGiao.css
  components/
    HopThoaiCoc/
      HopThoaiCoc.jsx
      HopThoaiCoc.css
    TaiPhongHangLoat/
      TaiPhongHangLoat.jsx
      TaiPhongHangLoat.css
    ChiTietBienBanBanGiao/
      ChiTietBienBanBanGiao.jsx
      ChiTietBienBanBanGiao.css
```

---

## 2) Danh mục Component mới (đổi tên theo quy ước)

| Tên cũ | Tên chuẩn (VN không dấu) | Mục đích | Vị trí |
|---|---|---|---|
| `DepositModal.jsx` | `HopThoaiCoc.jsx` | Chọn loại cọc & số tiền, hiển thị TTL | `components/HopThoaiCoc/` |
| `HandoverForm.jsx` | `LapBienBanBanGiao.jsx` | Lập biên bản bàn giao (ảnh công tơ, chữ ký…) | `pages/BanGiao/` |
| `BulkRoomUploader.jsx` | `TaiPhongHangLoat.jsx` | Bảng dán/parse Excel tạo nhiều phòng | `components/TaiPhongHangLoat/` |
| `DepositPolicyManager.jsx` | `QuanLyChinhSachCoc.jsx` (NhanVienDieuHanh) | CRUD chính sách cọc | `pages/QuanLyChinhSachCoc/` |
| `HandoverReportDetails.jsx` | `ChiTietBienBanBanGiao.jsx` | Xem chi tiết biên bản bàn giao | `components/ChiTietBienBanBanGiao/` |

JSDoc mẫu:

```js
/**
 * @typedef {object} GiaTriFormCoc
 * @property {number} soTien
 * @property {'CocGiuCho'|'CocAnNinh'} loaiCoc
 */
```

---

## 3) Quy ước CSS theo trang (kèm Liquid Glass)

- Mỗi trang có 1 “container lớp gốc” trong CSS (ví dụ: `.trang`) để:
  - Khai báo biến cục bộ (màu, spacing, radius…).
  - Gắn modifier theo vai trò bằng class (không dùng `:root`, không dùng theme global).
- Pattern tên class:
  - Lớp gốc: `.trang`
  - Khu vực: `.header`, `.noiDung`, `.footer`
  - Biến thể theo vai trò: `.roleNhanVienDieuHanh`, `.roleNhanVienBanHang`, `.roleChuDuAn`
  - Trạng thái: `.dangTai`, `.loi`, `.voHieuHoa`
- Responsive chuẩn (mobile-first):
  - `@media (min-width: 480px)` → sm
  - `@media (min-width: 768px)` → md
  - `@media (min-width: 1024px)` → lg
  - `@media (min-width: 1280px)` → xl

Liquid Glass – Token cục bộ (đặt trong `.trang`):

```css
.trang {
  /* Token nền & kính (KHÔNG dùng :root) */
  --mau-chu-dao: #1e40af; /* Có thể bị ghi đè theo vai trò */
  --mau-nen: #0b1220; /* Nền tối sang trọng */
  --bo-tron: 12px;
  --gap: 16px;

  /* Liquid glass */
  --glass-blur: 16px; /* Mức mờ */
  --glass-shadow: 0 10px 30px rgba(0,0,0,0.35);
  --glass-border: 1px solid rgba(255,255,255,0.10);
  /* Layer nền kính: base + tint theo màu chủ đạo */
  --glass-bg-base: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
  --glass-bg-tint: linear-gradient(180deg, rgba(30,64,175,.14), rgba(30,64,175,.05));
}
```

Ví dụ `QuanLyTinDang.css` (đã áp dụng liquid glass):

```css
.trang {
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--gap);
  padding: 16px;
  background: radial-gradient(120% 120% at 0% 0%, #0f172a, #0b1220 60%) fixed;
  color: #f3f4f6;
}

.roleNhanVienDieuHanh { --mau-chu-dao: #334155; --glass-bg-tint: linear-gradient(180deg, rgba(51,65,85,.16), rgba(51,65,85,.06)); }
.roleNhanVienBanHang { --mau-chu-dao: #059669; --glass-bg-tint: linear-gradient(180deg, rgba(5,150,105,.16), rgba(5,150,105,.06)); }
.roleChuDuAn        { --mau-chu-dao: #6d28d9; --glass-bg-tint: linear-gradient(180deg, rgba(109,40,217,.16), rgba(109,40,217,.06)); }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
}

.tieuDe {
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 600;
  letter-spacing: 0.1px;
}

.thanhTacVu { display: flex; gap: 12px; flex-wrap: wrap; }

/* Nút kiểu liquid glass */
.nut {
  position: relative;
  padding: 10px 16px;
  border-radius: 10px;
  border: var(--glass-border);
  background: var(--glass-bg-base), var(--glass-bg-tint);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  color: #e5e7eb;
  cursor: pointer;
  transition: transform .15s ease, border-color .15s ease, box-shadow .2s ease;
  box-shadow: var(--glass-shadow), inset 0 1px rgba(255,255,255,0.10);
}
.nut::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: radial-gradient(120% 60% at 10% 0%, rgba(255,255,255,.18), transparent 50%);
  pointer-events: none; /* highlight bóng */
}
.nut:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.2); }
.nut:active { transform: translateY(0); box-shadow: 0 6px 20px rgba(0,0,0,0.35), inset 0 1px rgba(255,255,255,0.06); }
.nut:focus-visible { outline: 2px solid var(--mau-chu-dao); outline-offset: 2px; }
.nutChinh { background: var(--glass-bg-base), linear-gradient(180deg, color-mix(in srgb, var(--mau-chu-dao) 24%, transparent), transparent 55%); }

.noiDung {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}

/* Card liquid glass */
.card {
  position: relative;
  border-radius: var(--bo-tron);
  border: var(--glass-border);
  background: var(--glass-bg-base), var(--glass-bg-tint);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  padding: 16px;
  box-shadow: var(--glass-shadow), inset 0 1px rgba(255,255,255,0.10);
}
.card::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: radial-gradient(140% 80% at 0% 0%, rgba(255,255,255,.16), transparent 60%);
  pointer-events: none;
}

/* Fallback khi không hỗ trợ blur */
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .nut, .card { background: rgba(31,41,55,0.85); }
}

/* Breakpoints */
@media (min-width: 768px) { .noiDung { grid-template-columns: 1fr 1fr; } .card { padding: 20px; } }
@media (min-width: 1024px) { .noiDung { grid-template-columns: 1.5fr 1fr; } }
```

Ví dụ dùng trong trang:

```jsx
// pages/QuanLyTinDang/QuanLyTinDang.jsx
import './QuanLyTinDang.css';
import { useRoleTheme } from '../../context/RoleThemeContext';

const QuanLyTinDang = () => {
  const { role } = useRoleTheme(); // 'NhanVienDieuHanh' | 'NhanVienBanHang' | 'ChuDuAn'
  return (
    <main className={`trang ${role ? `role${role}` : ''}`}>
      <header className="header">
        <h1 className="tieuDe">Quản lý Tin đăng</h1>
        <div className="thanhTacVu">
          <button className="nut nutChinh">Tạo tin</button>
          <button className="nut">Nhập hàng loạt</button>
        </div>
      </header>

      <section className="noiDung">
        <article className="card">Bộ lọc</article>
        <article className="card">Bảng tin</article>
      </section>
    </main>
  );
};
export default QuanLyTinDang;
```

Gợi ý A11y & motion:

```css
@media (prefers-reduced-motion: reduce) {
  .nut { transition: none; }
}
```

---

## 4) Quy tắc màu theo vai trò (không global)

- Không đặt biến màu ở `:root`.
- Mỗi trang có modifier vai trò (`.roleNhanVienDieuHanh`, `.roleNhanVienBanHang`, `.roleChuDuAn`) ghi đè biến cục bộ của chính trang đó (xem ví dụ CSS trên).

---

## 5) Phân quyền (RBAC) trên UI

```js
// hooks/usePermissions.js
import { useAuth } from '../context/AuthContext';

/** @returns {{can: (k: string) => boolean, permissions: string[]}} */
export const usePermissions = () => {
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const can = (k) => permissions.includes(k);
  return { can, permissions };
};
```

Sử dụng:

```jsx
import { usePermissions } from '../../hooks/usePermissions';
const { can } = usePermissions();
{can('tin_dang:duyet') && <button>Duyệt tin</button>}
```

---

## 6) Nhập liệu hàng loạt & bảng

- Dùng `@tanstack/react-table` cho bảng, `papaparse` cho CSV.
- Validate client: số tiền, diện tích > 0; highlight ô lỗi; nút submit disabled khi còn lỗi.
- Tối ưu UX mobile: bảng cuộn ngang, cell dùng `min-width` để tránh vỡ layout.

---

## 7) Mẫu CSS cho component (Liquid Glass)

```css
/* components/HopThoaiCoc/HopThoaiCoc.css */
.hopThoai {
  --radius: 12px;
  --mau-chu-dao: #1e40af;
  --glass-blur: 16px;

  width: min(720px, 92vw);
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,0.10);
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04)),
              linear-gradient(180deg, rgba(30,64,175,.14), rgba(30,64,175,.06));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 1px rgba(255,255,255,.10);
  color: #f3f4f6;
  position: relative;
}
.hopThoai::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: radial-gradient(140% 80% at 0% 0%, rgba(255,255,255,.16), transparent 60%);
  pointer-events: none;
}
.tieuDe { font-size: clamp(18px, 2.1vw, 24px); font-weight: 600; }
.hang { display: grid; gap: 12px; margin-top: 12px; }
.nhap { padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); color: #f3f4f6; }

.nutLuu {
  margin-top: 16px;
  border-radius: 10px; padding: 10px 16px; cursor: pointer;
  border: 1px solid var(--mau-chu-dao);
  background: linear-gradient(180deg, rgba(30,64,175,.20), rgba(30,64,175,.08));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
}
.nutLuu:disabled { opacity: .6; cursor: not-allowed; }
```

---

## 8) State management

- Local: `useState`
- Server state: React Query (`useQuery`, `useMutation`) để cache & refetch.
- Global: Context API + `useReducer` cho Auth, RoleTheme.

---

## 9) Checklist PR (UI)

- [ ] CSS chỉ trong `.css` của từng trang/component; không sửa `index.css`; không sử dụng `:root`.
- [ ] Áp dụng token liquid glass trong trang/component (blur, border, gradient, shadow, highlight).
- [ ] Có fallback khi không hỗ trợ `backdrop-filter` (ví dụ nền `rgba(31,41,55,.85)`).
- [ ] Layout mobile-first, test ≥ 3 breakpoint (sm, md, lg).
- [ ] Tương phản đạt chuẩn (WCAG AA) ở từng trang.
- [ ] Lighthouse: Performance/Accessibility ≥ 90 cho trang chính.
- [ ] Ảnh responsive (kích thước đúng, tránh layout shift).
- [ ] Snapshot test cho component quan trọng.
- [ ] RBAC hiển thị/ẩn đúng theo `usePermissions`.
- [ ] Nếu có cọc: hiển thị TTL rõ ràng & tự disable nút khi hết hạn.

---

## 10) Ghi chú bảo vệ file

- Cấm chỉnh sửa: `client/src/index.css` (giữ nguyên global resets của dự án).
- Mọi style bổ sung phải sống trong CSS của từng trang/component như hướng dẫn trên.

---

## 11) Quick checklist đặt tên (dùng khi tạo mới)

- Trang: `client/src/pages/<TenTrang>/<TenTrang>.jsx` + `<TenTrang>.css` (PascalCase, tiếng Việt không dấu).
- Component: `client/src/components/<TenComponent>/<TenComponent>.jsx` + `.css` (PascalCase, tiếng Việt không dấu).
- Không đặt file React là `index.jsx` trừ khi có lý do thư viện/hệ sinh thái; ưu tiên trùng tên thư mục.
- Tránh tiếng Anh nếu đã có thuật ngữ Việt tương ứng trong dự án (VD: dùng `DangNhap` thay cho `Login`).


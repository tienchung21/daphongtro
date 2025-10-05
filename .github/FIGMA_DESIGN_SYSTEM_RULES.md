# 🎨 FIGMA DESIGN SYSTEM RULES - DapPhongTro

**Project:** Nền tảng cho thuê phòng trọ (Managed Marketplace)  
**Design System:** Dark Luxury Theme  
**Framework:** React + Vite  
**Created:** 2024-01-XX

---

## 1. Design System Structure

### **1.1 Token Definitions**

**Location:** `client/src/styles/ChuDuAnDesignSystem.css`

**Format:** CSS Custom Properties (CSS Variables)

```css
/* client/src/styles/ChuDuAnDesignSystem.css */
:root {
  /* Colors */
  --cda-primary: #8b5cf6;           /* Purple - Brand color */
  --cda-secondary: #f59e0b;         /* Gold - Accent color */
  --cda-success: #10b981;           /* Green */
  --cda-danger: #ef4444;            /* Red */
  --cda-info: #3b82f6;              /* Blue */
  
  /* Backgrounds */
  --cda-bg-gradient: linear-gradient(135deg, #1a1d29 0%, #2d3142 100%);
  --cda-card-bg: #252834;
  --cda-card-bg-hover: rgba(139, 92, 246, 0.05);
  
  /* Text */
  --cda-text-primary: #f9fafb;      /* Bright white */
  --cda-text-secondary: #9ca3af;    /* Gray */
  
  /* Spacing Scale */
  --cda-spacing-xs: 4px;
  --cda-spacing-sm: 8px;
  --cda-spacing-md: 16px;
  --cda-spacing-lg: 24px;
  --cda-spacing-xl: 32px;
  --cda-spacing-2xl: 48px;
  
  /* Typography Scale */
  --cda-font-size-xs: 12px;
  --cda-font-size-sm: 14px;
  --cda-font-size-md: 16px;
  --cda-font-size-lg: 18px;
  --cda-font-size-xl: 22px;
  --cda-font-size-2xl: 28px;
  
  /* Border Radius */
  --cda-radius-sm: 8px;
  --cda-radius-md: 12px;
  --cda-radius-lg: 16px;
  
  /* Shadows */
  --cda-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --cda-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --cda-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

**No Token Transformation:** Direct CSS variables usage

---

## 2. Component Library

### **2.1 Component Locations**

```
client/src/
├── components/
│   ├── ChuDuAn/                    # Module-specific components
│   │   ├── NavigationChuDuAn.jsx   # Sidebar navigation
│   │   └── ModalPreviewPhong.jsx   # Room preview modal
│   └── Layout/                     # Shared layout components
├── pages/
│   └── ChuDuAn/                    # Page-level components
│       ├── Dashboard.jsx
│       ├── QuanLyTinDang.jsx
│       ├── ChiTietTinDang.jsx
│       └── BaoCaoHieuSuat.jsx
└── layouts/
    └── ChuDuAnLayout.jsx           # Main layout wrapper
```

### **2.2 Component Architecture**

**Pattern:** Functional Components với React Hooks

```jsx
// Example: Standard component structure
import React, { useState, useEffect } from 'react';
import { HiOutlineIcon } from 'react-icons/hi2';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Handlers
  const handleAction = () => {
    // Logic
  };
  
  // Render
  return (
    <div className="component-name">
      {/* Content */}
    </div>
  );
};

export default ComponentName;
```

**No Storybook:** Documentation in markdown files (e.g., README_REDESIGN.md)

---

## 3. Frameworks & Libraries

### **3.1 UI Framework**

- **React:** 18.x (functional components only)
- **React Router:** For navigation
- **React Icons:** Heroicons v2 (`react-icons/hi2`)

### **3.2 Styling**

- **CSS Modules:** Per-component CSS files
- **Naming Convention:** BEM-like (`.component-name__element--modifier`)
- **No CSS-in-JS:** Pure CSS files

### **3.3 Build System**

- **Vite:** Fast development server + HMR
- **Config:** `client/vite.config.js`
- **Dev Server:** Port 5173

```javascript
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
```

---

## 4. Asset Management

### **4.1 Asset Storage**

```
client/
├── public/
│   └── vite.svg                    # Public static assets
└── src/
    └── assets/
        └── images/
            ├── logo-hinh-mai-nha_.jpg
            └── hinhdauhuou.png
```

### **4.2 Asset References**

**Static Assets (public/):**
```jsx
<img src="/vite.svg" alt="Logo" />
```

**Imported Assets (src/assets/):**
```jsx
import logo from '@/assets/images/logo.png';
<img src={logo} alt="Logo" />
```

**Backend Uploaded Assets:**
```javascript
// Format: http://localhost:5000/uploads/[path]
const imageUrl = `http://localhost:5000${imagePath}`;

// With cache-busting
const imageUrl = `http://localhost:5000${imagePath}?t=${Date.now()}`;
```

### **4.3 Asset Optimization**

- **No CDN:** Local development setup
- **Cache-busting:** Timestamp query parameter (`?t=timestamp`)
- **Image formats:** JPG, PNG (no WebP yet)

---

## 5. Icon System

### **5.1 Icon Library**

**Package:** `react-icons@5.4.0`  
**Set:** Heroicons v2 (`react-icons/hi2`)

### **5.2 Icon Usage**

```jsx
import { 
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineMapPin 
} from 'react-icons/hi2';

// Inline with className
<HiOutlineHome className="icon" />

// Inline with style
<HiOutlineCurrencyDollar style={{ width: 20, height: 20, color: '#10b981' }} />
```

### **5.3 Icon Naming Convention**

**Pattern:** `HiOutline[Name]` (Outline style only)

**Common Icons:**
```javascript
HiOutlineHome          // 🏢 Nhà/Dự án
HiOutlineCurrencyDollar// 💰 Tiền
HiOutlineMapPin        // 📍 Vị trí
HiOutlineCheckCircle   // ✅ Thành công
HiOutlineChartBar      // 📊 Báo cáo
HiOutlineCalendar      // 📅 Lịch hẹn
HiOutlineArrowTrendingUp// 📈 Xu hướng
```

### **5.4 Icon Sizing**

```css
/* Small icons (16px) */
.icon-sm { width: 16px; height: 16px; }

/* Medium icons (20px) - Default */
.icon { width: 20px; height: 20px; }

/* Large icons (24px) */
.icon-lg { width: 24px; height: 24px; }

/* Extra large (48px) */
.icon-xl { width: 48px; height: 48px; }
```

---

## 6. Styling Approach

### **6.1 CSS Methodology**

**Pattern:** BEM-inspired + Component-scoped

```css
/* Block */
.component-name { }

/* Element */
.component-name-element { }
.component-name__element { }  /* Alternative */

/* Modifier */
.component-name--modifier { }
.component-name-element--modifier { }

/* State */
.component-name.is-active { }
.component-name:hover { }
```

**Example:**
```css
/* QuanLyTinDang.css */
.qtd-card { }                    /* Block */
.qtd-card-header { }             /* Element */
.qtd-card-header--large { }      /* Modifier */
.qtd-card.is-loading { }         /* State */
```

### **6.2 Global Styles**

**Location:** `client/src/index.css`

```css
/* index.css - Global resets & base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--cda-bg-gradient);
  color: var(--cda-text-primary);
}
```

### **6.3 Responsive Design**

**Breakpoints:**
```css
/* Mobile-first approach */

/* Small devices (≥480px) */
@media (min-width: 480px) { }

/* Medium devices (≥768px) */
@media (min-width: 768px) { }

/* Large devices (≥1024px) */
@media (min-width: 1024px) { }

/* Extra large (≥1280px) */
@media (min-width: 1280px) { }
```

**Pattern:** Mobile-first, progressive enhancement

---

## 7. Project Structure

### **7.1 Overall Organization**

```
daphongtro/
├── client/                      # Frontend (React + Vite)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/              # Images, fonts
│   │   ├── components/          # Reusable components
│   │   │   ├── ChuDuAn/         # Module components
│   │   │   └── Layout/          # Layout components
│   │   ├── context/             # React Context
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/             # Layout wrappers
│   │   ├── pages/               # Page components
│   │   │   ├── ChuDuAn/         # Module pages
│   │   │   ├── login/
│   │   │   ├── dangky/
│   │   │   └── trangchu/
│   │   ├── services/            # API services
│   │   ├── styles/              # Global styles, design system
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                      # Backend (Node.js + Express)
│   ├── api/                     # API routes
│   ├── config/                  # Configuration
│   ├── controllers/             # Business logic
│   ├── middleware/              # Express middleware
│   ├── models/                  # Database models
│   ├── services/                # Service layer
│   ├── utils/                   # Utility functions
│   ├── index.js                 # Entry point
│   └── package.json
├── docs/                        # Documentation
└── .github/                     # GitHub configs
```

### **7.2 Feature Organization Pattern**

**Module-based:** Each actor (ChuDuAn, KhachHang, Sales, Operator) có thư mục riêng

```
pages/ChuDuAn/
├── Dashboard.jsx/.css           # UC-PROJ-03: Dashboard
├── QuanLyTinDang.jsx/.css       # UC-PROJ-01: Quản lý tin đăng
├── ChiTietTinDang.jsx/.css      # UC-PROJ-01: Chi tiết tin đăng
├── TaoTinDang.jsx/.css          # UC-PROJ-01: Tạo tin đăng
├── BaoCaoHieuSuat.jsx/.css      # UC-PROJ-03: Báo cáo
├── README_REDESIGN.md           # Module documentation
└── index.js                     # Export all components
```

---

## 8. Key Patterns for Figma Integration

### **8.1 Component Naming**

**Rule:** Tiếng Việt không dấu (PascalCase)

```javascript
// ✅ GOOD
const QuanLyTinDang = () => {};
const ChiTietTinDang = () => {};
const DanhSachPhong = () => {};

// ❌ BAD
const ManagePost = () => {};
const PostDetail = () => {};
const RoomList = () => {};
```

### **8.2 CSS Class Naming**

**Rule:** Tiếng Việt không dấu (kebab-case hoặc BEM)

```css
/* ✅ GOOD */
.quan-ly-tin-dang { }
.qtd-card { }
.ctd-gallery { }

/* ❌ BAD */
.manage-post { }
.mp-card { }
.pd-gallery { }
```

### **8.3 Color Token Mapping**

| Figma Color | CSS Variable | Value | Usage |
|-------------|--------------|-------|-------|
| Primary/Purple | `--cda-primary` | #8b5cf6 | Brand, CTA buttons |
| Secondary/Gold | `--cda-secondary` | #f59e0b | Accent, price |
| Success/Green | `--cda-success` | #10b981 | Success states |
| Danger/Red | `--cda-danger` | #ef4444 | Error states |
| Info/Blue | `--cda-info` | #3b82f6 | Informational |
| Text/Primary | `--cda-text-primary` | #f9fafb | Main text |
| Text/Secondary | `--cda-text-secondary` | #9ca3af | Secondary text |

### **8.4 Spacing Token Mapping**

| Figma Spacing | CSS Variable | Value |
|---------------|--------------|-------|
| 4px | `--cda-spacing-xs` | 4px |
| 8px | `--cda-spacing-sm` | 8px |
| 16px | `--cda-spacing-md` | 16px |
| 24px | `--cda-spacing-lg` | 24px |
| 32px | `--cda-spacing-xl` | 32px |
| 48px | `--cda-spacing-2xl` | 48px |

### **8.5 Typography Token Mapping**

| Figma Text Style | CSS Variable | Value | Weight | Usage |
|------------------|--------------|-------|--------|-------|
| Heading/XL | `--cda-font-size-2xl` | 28px | 700 | Page titles |
| Heading/L | `--cda-font-size-xl` | 22px | 600 | Section titles |
| Body/L | `--cda-font-size-lg` | 18px | 400 | Large body |
| Body/M | `--cda-font-size-md` | 16px | 400 | Default body |
| Body/S | `--cda-font-size-sm` | 14px | 400 | Small text |
| Caption | `--cda-font-size-xs` | 12px | 400 | Labels, captions |

---

## 9. Figma Export Guidelines

### **9.1 Export Settings**

- **Format:** SVG for icons, PNG/JPG for images
- **Size:** 1x, 2x for retina displays
- **Naming:** `component-name-variant.svg`

### **9.2 Component Export**

```
Figma Component → React Component

1. Export design specs (spacing, colors, typography)
2. Create React component structure
3. Apply CSS with design tokens
4. Implement responsive breakpoints
5. Add interactions/animations
6. Test cross-browser
```

### **9.3 Design Handoff Checklist**

- [ ] All colors use design tokens
- [ ] Spacing uses spacing scale
- [ ] Typography uses font scale
- [ ] Icons from Heroicons v2
- [ ] Responsive breakpoints defined
- [ ] Hover/Active states specified
- [ ] Animation timing defined
- [ ] Accessibility considerations

---

## 10. Example: Figma to Code Flow

### **Figma Design:**
```
Card Component
├── Background: #252834 (--cda-card-bg)
├── Border: 1px solid rgba(255,255,255,0.1)
├── Border Radius: 16px (--cda-radius-lg)
├── Padding: 24px (--cda-spacing-lg)
├── Shadow: 0 4px 12px rgba(0,0,0,0.15) (--cda-shadow-md)
└── Content
    ├── Title: 22px, Bold, #f9fafb (--cda-font-size-xl, --cda-text-primary)
    └── Body: 16px, Normal, #9ca3af (--cda-font-size-md, --cda-text-secondary)
```

### **React Component:**
```jsx
// Card.jsx
import './Card.css';

const Card = ({ title, children }) => {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
```

### **CSS:**
```css
/* Card.css */
.card {
  background: var(--cda-card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cda-radius-lg);
  padding: var(--cda-spacing-lg);
  box-shadow: var(--cda-shadow-md);
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--cda-shadow-lg);
}

.card-title {
  font-size: var(--cda-font-size-xl);
  font-weight: 700;
  color: var(--cda-text-primary);
  margin-bottom: var(--cda-spacing-md);
}

.card-body {
  font-size: var(--cda-font-size-md);
  color: var(--cda-text-secondary);
  line-height: 1.6;
}
```

---

## 11. Best Practices

### **11.1 DO:**
✅ Use design tokens for all colors/spacing/typography  
✅ Follow mobile-first responsive design  
✅ Use Heroicons v2 for consistency  
✅ Name files/classes in Vietnamese (no diacritics)  
✅ Keep component files under 500 lines  
✅ Document complex components with markdown  
✅ Use CSS variables for theming  
✅ Test on Chrome, Firefox, Edge, Safari  

### **11.2 DON'T:**
❌ Hard-code colors/spacing values  
❌ Use English names for Vietnamese domain concepts  
❌ Mix icon libraries  
❌ Use inline styles (except dynamic values)  
❌ Create global CSS classes without prefix  
❌ Skip responsive breakpoints  
❌ Forget to handle loading/error states  
❌ Skip accessibility attributes  

---

## 12. Resources

- **Design System CSS:** `client/src/styles/ChuDuAnDesignSystem.css`
- **Icon Library:** https://react-icons.github.io/react-icons/icons/hi2/
- **Documentation Index:** `client/src/pages/ChuDuAn/DOCUMENTATION_INDEX.md`
- **Quick Reference:** `docs/QUICK_REFERENCE.md`

---

**Last Updated:** 2024-01-XX  
**Maintainer:** Development Team  
**Status:** 🟢 Active

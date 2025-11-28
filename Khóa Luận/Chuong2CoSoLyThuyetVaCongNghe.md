# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

## 2.1. Mô hình Managed Marketplace

### 2.1.1. Khái niệm Marketplace

Marketplace (sàn giao dịch trung gian) là mô hình kinh doanh kết nối người mua và người bán trên cùng một nền tảng. Marketplace không sở hữu hàng hóa/dịch vụ mà chỉ đóng vai trò là trung gian, thu phí hoa hồng từ giao dịch thành công.

**Phân loại Marketplace:**

**1\. Horizontal Marketplace (Thị trường ngang):**

*   Phục vụ nhiều ngành hàng/dịch vụ khác nhau
*   Ví dụ: Amazon, eBay, Alibaba
*   Ưu điểm: Quy mô lớn, network effect mạnh
*   Nhược điểm: Cạnh tranh cao, khó chuyên sâu

**2\. Vertical Marketplace (Thị trường dọc):**

*   Tập trung vào một ngành cụ thể
*   Ví dụ: Airbnb (du lịch), Upwork (freelance), Zillow (bất động sản)
*   Ưu điểm: Chuyên sâu, hiểu rõ niche market
*   Nhược điểm: Quy mô nhỏ hơn, khó scale

**Hệ thống của chúng tôi là một Vertical Marketplace chuyên về cho thuê phòng trọ.**

### 2.1.2. Mô hình 2-sided vs 3-sided Marketplace

**2-sided Marketplace:**

*   Kết nối 2 nhóm: Supply side (người bán) và Demand side (người mua)
*   Ví dụ: Craigslist, Classifieds
*   Vai trò platform: Passive (chỉ cung cấp nơi đăng tin)

**3-sided Marketplace (Managed Marketplace):**

*   Có thêm nhóm thứ 3: Platform operators/moderators
*   Platform chủ động kiểm soát chất lượng, xác minh, và bảo vệ giao dịch
*   Ví dụ: Airbnb, Grab, Shopee

**Hệ thống của chúng tôi là 3-sided Marketplace với:**

*   Side 1: Chủ dự án (Landlords) - Supply
*   Side 2: Khách thuê (Tenants) - Demand
*   Side 3: Operators + Sales Staff - Platform Team

### 2.1.3. Các thành phần của Managed Marketplace

**Trust & Safety:**

*   KYC (Know Your Customer): Xác minh danh tính qua CMND/CCCD, email, SĐT
*   Content Moderation: Kiểm duyệt tin đăng trước khi publish
*   Rating & Review: Đánh giá sau khi giao dịch (planned)
*   Fraud Detection: Phát hiện hành vi bất thường (planned)

**Transaction Management:**

*   Escrow System: Giữ tiền cọc tạm thời cho đến khi đủ điều kiện giải tỏa
*   Payment Gateway: Tích hợp cổng thanh toán bên thứ 3 (SePay)
*   Refund Policy: Chính sách hoàn tiền rõ ràng
*   Dispute Resolution: Xử lý tranh chấp giữa các bên

**Communication:**

*   In-app Messaging: Chat real-time giữa các bên
*   Notifications: Thông báo về trạng thái đơn hàng, cuộc hẹn
*   Email/SMS: Gửi thông báo quan trọng ra ngoài app

**Analytics & Reporting:**

*   Dashboard: Theo dõi metrics real-time
*   Reports: Báo cáo định kỳ (ngày/tuần/tháng)
*   Business Intelligence: Phân tích xu hướng, dự đoán

### 2.1.4. Network Effect và Value Proposition

**Network Effect (Hiệu ứng mạng):**

*   Direct Network Effect: Càng nhiều người dùng, giá trị của platform càng tăng
*   Cross-side Network Effect: Càng nhiều landlords → Càng nhiều listings → Càng thu hút tenants; Càng nhiều tenants → Càng nhiều demand → Càng thu hút landlords

**Value Proposition cho từng nhóm:**

_Cho Landlords:_

*   Tiếp cận hàng nghìn khách hàng tiềm năng
*   Công cụ quản lý chuyên nghiệp (dashboard, báo cáo)
*   Giảm rủi ro thanh toán nhờ escrow
*   Hỗ trợ marketing và SEO

_Cho Tenants:_

*   Tìm phòng nhanh, thông tin minh bạch
*   Bảo vệ quyền lợi qua escrow và hợp đồng điện tử
*   Liên lạc trực tiếp với landlord
*   So sánh nhiều lựa chọn dễ dàng

_Cho Platform:_

*   Thu phí hoa hồng từ giao dịch thành công (5-10%)
*   Dữ liệu giá trị về thị trường
*   Cơ hội mở rộng sang các dịch vụ giá trị gia tăng (bảo hiểm, vệ sinh, sửa chữa)

## 2.2. Kiến trúc 3 tầng (3-tier Architecture)

### 2.2.1. Tổng quan về 3-tier Architecture

Kiến trúc 3 tầng là mô hình thiết kế phổ biến cho ứng dụng web, chia hệ thống thành 3 lớp logic:

  
┌──────────────────────────────────────┐  
│ PRESENTATION TIER (Client) │  
│ - React Frontend (SPA) │  
│ - HTML/CSS/JavaScript │  
│ - User Interface & UX │  
└──────────────┬───────────────────────┘  
│ HTTP/HTTPS (REST API)  
│ WebSocket (Socket.IO)  
┌──────────────▼───────────────────────┐  
│ APPLICATION TIER (Server) │  
│ - Node.js + Express │  
│ - Business Logic │  
│ - Authentication & Authorization │  
│ - API Endpoints (150+) │  
└──────────────┬───────────────────────┘  
│ TCP/IP (MySQL Protocol)  
┌──────────────▼───────────────────────┐  
│ DATA TIER (Database) │  
│ - MySQL 8.0 │  
│ - 32 Tables │  
│ - Stored Procedures & Triggers │  
└──────────────────────────────────────┘  

### 2.2.2. Presentation Tier - Frontend

**Công nghệ sử dụng:**

*   React 19.1.1 \[1\]: UI library với component-based architecture
*   Vite 5.4.0: Build tool với HMR (Hot Module Replacement)
*   React Router DOM 7.9.1: Client-side routing
*   Axios 1.12.2: HTTP client
*   Socket.IO Client 4.8.1 \[4\]: Real-time communication
*   Recharts 3.3.0: Data visualization
*   Leaflet 1.9.4: Interactive maps

**Component Structure:**

  
client/src/  
├── pages/ # Page-level components  
│ ├── ChuDuAn/ # Landlord dashboard  
│ ├── NhanVienBanHang/ # Sales staff dashboard  
│ ├── Operator/ # Operator dashboard  
│ └── login/ # Authentication  
├── components/ # Reusable components  
│ ├── Chat/ # Chat widgets  
│ ├── ChuDuAn/ # Landlord components  
│ ├── NhanVienBanHang/ # Sales components  
│ └── Operator/ # Operator components  
├── services/ # API services  
├── hooks/ # Custom React hooks  
├── context/ # React Context (global state)  
└── utils/ # Helper functions  

2

**State Management:**

*   React Context API cho global state (user auth, chat)
*   Local state với useState cho component-level state
*   TanStack React Query (planned) cho server state caching

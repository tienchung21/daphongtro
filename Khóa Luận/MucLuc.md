
MỤC LỤC

[CHƯƠNG 1: GIỚI THIỆU 1](#_Toc213448154)

[1.1. Bối cảnh và Động lực 1](#_Toc213448155)

[1.1.1. Thực trạng thị trường cho thuê phòng trọ tại Việt Nam 1](#_Toc213448156)

[1.1.2. Cơ hội và Tiềm năng 2](#_Toc213448157)

[1.2. Mục tiêu đề tài 3](#_Toc213448158)

[1.2.1. Mục tiêu tổng quan 3](#_Toc213448159)

[1.2.2. Mục tiêu cụ thể 3](#_Toc213448160)

[1.2.3. Phạm vi và giới hạn 6](#_Toc213448161)

[1.3. Đóng góp của đề tài 7](#_Toc213448162)

[1.3.1. Về mặt học thuật 7](#_Toc213448163)

[1.3.2. Về mặt thực tiễn 7](#_Toc213448164)

[1.3.3. Về mặt công nghệ 8](#_Toc213448165)

[1.4. Cấu trúc báo cáo 9](#_Toc213448166)

[CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ 12](#_Toc213448167)

[2.1. Mô hình Managed Marketplace 13](#_Toc213448168)

[2.1.1. Khái niệm Marketplace 13](#_Toc213448169)

[2.1.2. Mô hình 2-sided vs 3-sided Marketplace 13](#_Toc213448170)

[2.1.3. Các thành phần của Managed Marketplace 14](#_Toc213448171)

[2.1.4. Network Effect và Value Proposition 15](#_Toc213448172)

[2.2. Kiến trúc 3 tầng (3-tier Architecture) 16](#_Toc213448173)

[2.2.1. Tổng quan về 3-tier Architecture 16](#_Toc213448174)

[2.2.2. Presentation Tier - Frontend 16](#_Toc213448175)

[BÁO CÁO KHÓA LUẬN TỐT NGHIỆP 17](#_Toc213448176)

[CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG 19](#_Toc213448177)

[3.1. Phân tích yêu cầu hệ thống 19](#_Toc213448178)

[3.1.1. Yêu cầu chức năng 19](#_Toc213448179)

[3.1.2. Yêu cầu phi chức năng 19](#_Toc213448180)

[3.2. Thiết kế Use Cases chi tiết 21](#_Toc213448181)

[3.2.1. UC-PROJ-01: Đăng tin Cho thuê 21](#_Toc213448182)

[3.2.2. UC-TEN-01: Đặt lịch xem phòng 22](#_Toc213448183)

[3.2.3. UC-DEPOSIT-01: Đặt cọc phòng 23](#_Toc213448184)

[3.2.4. UC-CONTRACT-01: Tạo hợp đồng 24](#_Toc213448185)

[3.3. Thiết kế cơ sở dữ liệu 26](#_Toc213448186)

[3.3.1. Tổng quan Database Schema 26](#_Toc213448187)

[3.3.2. Chi tiết Core Tables 27](#_Toc213448188)

[3.3.3. Database Relationships 31](#_Toc213448189)

[3.3.4. Chiến lược Indexing 32](#_Toc213448190)

[3.4. Thiết kế API 33](#_Toc213448191)

[3.4.1. Kiến trúc API 33](#_Toc213448192)

[3.4.2. Chi tiết Core API Endpoints 34](#_Toc213448193)

[3.4.3. API Security 36](#_Toc213448194)

[3.4.4. Chuẩn API Response Format 36](#_Toc213448195)

[3.5. Thiết kế State Machines 38](#_Toc213448196)

[3.5.1. TinDang State Machine 38](#_Toc213448197)

[3.5.2. CuocHen State Machine 39](#_Toc213448198)

[3.5.3. Coc State Machine 39](#_Toc213448199)

[3.5.4. HopDong State Machine 39](#_Toc213448200)

[3.6. Thiết kế giao diện người dùng (UI/UX) 41](#_Toc213448201)

[3.6.1. Nguyên tắc thiết kế 41](#_Toc213448202)

[3.6.2. Kiến trúc Component 41](#_Toc213448203)

[3.6.3. Màn hình chính 42](#_Toc213448204)

[3.6.4. Design System 43](#_Toc213448205)

[BÁO CÁO KHÓA LUẬN TỐT NGHIỆP 44](#_Toc213448206)

[CHƯƠNG 4: TRIỂN KHAI HỆ THỐNG 45](#_Toc213448207)

[4.1. Môi trường triển khai 45](#_Toc213448208)

[4.1.1. Technology Stack 45](#_Toc213448209)

[4.1.2. Cấu trúc dự án 45](#_Toc213448210)

[4.1.3. Cài đặt môi trường phát triển 46](#_Toc213448211)

[4.2. Triển khai Backend 48](#_Toc213448212)

[4.2.1. Database Connection 48](#_Toc213448213)

[4.2.2. Authentication & Authorization 48](#_Toc213448214)

[4.2.3. Triển khai Controllers 49](#_Toc213448215)

[4.2.4. Triển khai Models 52](#_Toc213448216)

[4.3. Triển khai Real-time với Socket.IO 57](#_Toc213448217)

[4.3.1. Socket.IO Server Setup 57](#_Toc213448218)

[4.3.2. Chat Implementation 58](#_Toc213448219)

[4.4. Tích hợp Thanh toán với SePay 62](#_Toc213448220)

[4.4.1. Tạo Payment Link 62](#_Toc213448221)

[4.4.2. Payment Webhook Handler 64](#_Toc213448222)

[4.5. Triển khai Frontend 67](#_Toc213448223)

[4.5.1. Kiến trúc Component 67](#_Toc213448224)

[4.5.2. Triển khai Pages chính 67](#_Toc213448225)

[4.5.3. State Management 70](#_Toc213448226)

[4.6. Triển khai Security 72](#_Toc213448227)

[BÁO CÁO KHÓA LUẬN TỐT NGHIỆP 73](#_Toc213448228)

[CHƯƠNG 5: KẾT QUẢ VÀ ĐÁNH GIÁ 74](#_Toc213448229)

[5.1. Kết quả triển khai 74](#_Toc213448230)

[5.1.1. Tổng quan hệ thống 74](#_Toc213448231)

[5.1.2. Triển khai Use Cases 74](#_Toc213448232)

[5.1.3. Metrics về Code 76](#_Toc213448233)

[5.2. Đánh giá hiệu năng (Performance) 77](#_Toc213448234)

[5.2.1. Hiệu năng API 77](#_Toc213448235)

[5.2.2. Hiệu năng Database 77](#_Toc213448236)

[5.2.3. Hiệu năng Frontend 78](#_Toc213448237)

[5.3. Testing và Kiểm thử 80](#_Toc213448238)

[5.3.1. Test Coverage 80](#_Toc213448239)

[5.3.2. Bug Tracking 80](#_Toc213448240)

[5.3.3. Known Issues (Đang xử lý) 80](#_Toc213448241)

[5.4. Đánh giá từ người dùng 82](#_Toc213448242)

[5.4.1. User Testing 82](#_Toc213448243)

[5.4.2. Feedback từ người dùng 82](#_Toc213448244)

[5.5. So sánh với yêu cầu ban đầu 84](#_Toc213448245)

[5.5.1. Yêu cầu chức năng 84](#_Toc213448246)

[5.5.2. Yêu cầu phi chức năng 84](#_Toc213448247)

[5.5.3. Đánh giá tổng thể 85](#_Toc213448248)

[BÁO CÁO KHÓA LUẬN TỐT NGHIỆP 85](#_Toc213448249)

[CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN 87](#_Toc213448250)

[6.1. Tổng kết 87](#_Toc213448251)

[6.2. Kết quả đạt được 88](#_Toc213448252)

[6.2.1. Về mặt kỹ thuật 88](#_Toc213448253)

[6.2.2. Về mặt chức năng 88](#_Toc213448254)

[6.2.3. Về trải nghiệm người dùng 88](#_Toc213448255)

[6.3. Hạn chế của hệ thống 90](#_Toc213448256)

[6.3.1. Hạn chế về chức năng 90](#_Toc213448257)

[6.3.2. Hạn chế về kỹ thuật 90](#_Toc213448258)

[6.3.3. Hạn chế về testing 90](#_Toc213448259)

[6.4. Hướng phát triển tương lai 91](#_Toc213448260)

[6.4.1. Ngắn hạn (3-6 tháng) 91](#_Toc213448261)

[6.4.2. Trung hạn (6-12 tháng) 91](#_Toc213448262)

[6.4.3. Dài hạn (1-2 năm) 92](#_Toc213448263)

[6.4.4. Technology Roadmap 92](#_Toc213448264)

[6.5. Kết luận 94](#_Toc213448265)

[TÀI LIỆU THAM KHẢO 96](#_Toc213448266)

[PHỤ LỤC 98](#_Toc213448267)

[Phụ lục A: Cấu trúc Database 98](#_Toc213448268)

[A.1. Nhóm Quản lý Người dùng và Xác thực 98](#_Toc213448269)

[A.2. Nhóm Quản lý Dự án và Tin đăng 98](#_Toc213448270)

[A.3. Nhóm Quản lý Giao dịch và Thanh toán 99](#_Toc213448271)

[A.4. Nhóm Quản lý Hợp đồng và Cuộc hẹn 99](#_Toc213448272)

[A.5. Nhóm Quản lý Nội dung và Hỗ trợ 99](#_Toc213448273)

[Phụ lục B: Danh sách API Endpoints 100](#_Toc213448274)

[B.1. Authentication & Authorization APIs 100](#_Toc213448275)

[B.2. KYC & User Management APIs 100](#_Toc213448276)

[B.3. Project & Listing APIs (Chủ dự án) 100](#_Toc213448277)

[B.4. Booking & Appointment APIs 101](#_Toc213448278)

[B.5. Payment & Wallet APIs 102](#_Toc213448279)

[B.6. Contract & Rating APIs 102](#_Toc213448280)

[B.7. Admin & Analytics APIs 102](#_Toc213448281)

[B.8. Real-time APIs (Socket.IO \[4\]) 103](#_Toc213448282)

[Phụ lục C: Đặc tả Use Cases 104](#_Toc213448283)

[C.1. Người dùng Chung (5 UCs) 104](#_Toc213448284)

[C.2. Khách hàng (7 UCs) 104](#_Toc213448285)

[C.3. Nhân viên Bán hàng (7 UCs) 104](#_Toc213448286)

[C.4. Chủ dự án (5 UCs) 105](#_Toc213448287)

[C.5. Nhân viên Điều hành (6 UCs) 105](#_Toc213448288)

[C.6. Quản trị viên Hệ thống (9 UCs) 105](#_Toc213448289)

[Phụ lục D: State Machine Diagrams 107](#_Toc213448290)

[D.1. Tin đăng State Machine 107](#_Toc213448291)

[D.2. Đơn đặt chỗ State Machine 107](#_Toc213448292)

[D.3. KYC State Machine 108](#_Toc213448293)

[D.4. Hợp đồng State Machine 108](#_Toc213448294)

[Phụ lục E: Bảo mật và Best Practices 109](#_Toc213448295)

[E.1. Security Implementation 109](#_Toc213448296)

[E.2. Payment Security (PCI DSS) 109](#_Toc213448297)

[E.3. Node.js Best Practices 110](#_Toc213448298)

[E.4. React Best Practices 110](#_Toc213448299)

# DANH MỤC CÁC THUẬT NGỮ VIẾT TẮT

| Từ viết tắt | Từ đầy đủ | Nghĩa |
| --- | --- | --- |
| API | Application Programming Interface | Giao diện lập trình ứng dụng |
| JWT | JSON Web Token | Mã thông báo web JSON |
| RBAC | Role-Based Access Control | Kiểm soát truy cập dựa trên vai trò |
| REST | Representational State Transfer | Chuyển giao trạng thái biểu diễn |
| HTTP | HyperText Transfer Protocol | Giao thức truyền tải siêu văn bản |
| HTTPS | HTTP Secure | HTTP bảo mật |
| SQL | Structured Query Language | Ngôn ngữ truy vấn có cấu trúc |
| UI | User Interface | Giao diện người dùng |
| UX | User Experience | Trải nghiệm người dùng |
| CRUD | Create, Read, Update, Delete | Tạo, Đọc, Cập nhật, Xóa |
| MVC | Model-View-Controller | Mô hình-Giao diện-Điều khiển |
| OTP | One-Time Password | Mật khẩu một lần |
| KYC | Know Your Customer | Xác thực danh tính khách hàng |
| PCI DSS | Payment Card Industry Data Security Standard | Tiêu chuẩn bảo mật dữ liệu |
| OWASP | Open Web Application Security Project | Dự án bảo mật ứng dụng web mở |
| TLS | Transport Layer Security | Bảo mật tầng truyền tải |
| CORS | Cross-Origin Resource Sharing | Chia sẻ tài nguyên cross-origin |
| CSRF | Cross-Site Request Forgery | Giả mạo yêu cầu cross-site |

# 
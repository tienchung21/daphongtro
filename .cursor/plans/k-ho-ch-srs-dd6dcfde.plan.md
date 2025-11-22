<!-- dd6dcfde-c1ee-4526-a8ba-efb7a1caa73a eb13c01c-488b-477c-9673-5d13d5a2f663 -->
# Kế hoạch Tổng hợp Tài liệu SRS Toàn Hệ thống

Kế hoạch này sẽ mở rộng phạm vi, không chỉ giới hạn ở module Chủ Dự Án mà sẽ bao quát toàn bộ hệ thống theo `docs/use-cases-v1.2.md`. Kế hoạch bao gồm hai phần chính:

1.  **Xây dựng Dàn ý chi tiết cho Tài liệu SRS Toàn Hệ Thống:** Dựa trên các tác nhân (Actors) và use cases đã được định nghĩa, tôi sẽ tạo ra một cấu trúc SRS hoàn chỉnh, đồng thời xác định trạng thái triển khai (Hoàn thành / Đang phát triển / Chưa bắt đầu) cho từng chức năng bằng cách đối chiếu với mã nguồn hiện có.
2.  **Cập nhật và Mở rộng tệp `docs/CHU_DU_AN_ACTUAL_STATUS_2025.md`:** Tôi sẽ đề xuất cập nhật tệp này để nó không chỉ phản ánh trạng thái của module Chủ Dự Án mà còn bao quát cả các module khác, giúp bạn có một tài liệu tổng quan duy nhất về hiện trạng dự án.

---

### Phần 1: Dàn ý Tài liệu SRS (Toàn Hệ Thống)

**1. Giới thiệu**

-   **1.1. Mục đích:** Đặc tả các yêu cầu chức năng và phi chức năng cho hệ thống "Managed Marketplace Cho Thuê Phòng Trọ".
-   **1.2. Phạm vi:** Hệ thống quản lý toàn diện quy trình cho thuê, bao gồm các vai trò: Khách Hàng, Chủ Dự Án, Nhân Viên Bán Hàng, Nhân Viên Điều Hành và Quản Trị Viên.
-   **1.3. Thuật ngữ & Từ viết tắt:** Dựa trên mục "Từ điển khái niệm" trong `use-cases-v1.2.md`.

**2. Mô tả tổng quan**

-   **2.1. Bối cảnh sản phẩm:** Một nền tảng trung gian có kiểm soát, mục tiêu hiện đại hóa quy trình cho thuê, tăng tính minh bạch và tối ưu hóa tỉ lệ chuyển đổi.
-   **2.2. Tác nhân và Đặc điểm người dùng:**
-   **KhachHang (Customer):** Tìm kiếm, hẹn lịch, đặt cọc, ký hợp đồng.
-   **ChuDuAn (Project Owner):** Đăng tin, quản lý dự án, theo dõi hiệu suất.
-   **NhanVienBanHang (Sales):** Quản lý lịch làm việc, chăm sóc khách hàng, quản lý cuộc hẹn.
-   **NhanVienDieuHanh (Operator):** Duyệt tin, điều phối, quản lý nhân sự.
-   **QuanTriVien (Admin):** Quản trị toàn bộ hệ thống, cấu hình, phân quyền.
-   **2.3. Ràng buộc chung:** KYC, chính sách cọc theo từng tin đăng, rate limiting, ghi log (Audit Log).

**3. Yêu cầu Chức năng Chi tiết (Theo Tác nhân)**

-   **3.1. Chức năng Chung (UC-GEN)**
-   **UC-GEN-01: Đăng Nhập:** (Hoàn thành)
-   **UC-GEN-02: Đăng Ký Tài Khoản:** (Hoàn thành)
-   **UC-GEN-03: Chuyển Đổi Vai Trò:** (Hoàn thành)
-   **UC-GEN-04: Xem Danh Sách Cuộc Hẹn:** (Hoàn thành)
-   **UC-GEN-05: Trung Tâm Thông Báo:** (Đang phát triển - Cần UI quản lý mẫu)

-   **3.2. Khách Hàng (UC-CUST)**
-   **UC-CUST-01: Tìm Kiếm Phòng Trọ:** (Hoàn thành)
-   **UC-CUST-02: Quản Lý Yêu Thích:** (Hoàn thành)
-   **UC-CUST-03: Hẹn Lịch Xem Phòng:** (Hoàn thành)
-   **UC-CUST-04: Thực Hiện Đặt Cọc:** (Hoàn thành)
-   **UC-CUST-07: Nhắn Tin:** (Hoàn thành)

-   **3.3. Nhân Viên Bán Hàng (UC-SALE)**
-   **UC-SALE-01: Đăng ký Lịch làm việc:** (Hoàn thành - `LichLamViec.jsx`)
-   **UC-SALE-02: Xem Chi tiết Cuộc hẹn:** (Hoàn thành - `ChiTietCuocHen.jsx`)
-   **UC-SALE-03: Quản lý Cuộc hẹn:** (Hoàn thành - `QuanLyCuocHen.jsx`)
-   **UC-SALE-05: Báo cáo Kết quả Cuộc hẹn:** (Đang phát triển)
-   **UC-SALE-06: Xem Báo cáo Thu nhập:** (Hoàn thành - `BaoCaoThuNhap.jsx`)
-   **UC-SALE-07: Nhắn tin:** (Hoàn thành - `TinNhan.jsx`)

-   **3.4. Chủ Dự Án (UC-PROJ)**
-   **UC-PROJ-01: Đăng tin Cho thuê:** (Hoàn thành - `TaoTinDang.jsx`)
-   **UC-PROJ-02: Xác nhận Cuộc hẹn:** (Hoàn thành - `QuanLyCuocHen.jsx`)
-   **UC-PROJ-03: Xem Báo cáo Kinh doanh:** (Hoàn thành - `BaoCaoHieuSuat.jsx`, cần tích hợp dữ liệu thật)
-   **UC-PROJ-04: Báo cáo Hợp đồng Cho thuê:** (Hoàn thành - `QuanLyHopDong.jsx`)
-   **UC-PROJ-05: Nhắn tin:** (Hoàn thành - `TinNhan.jsx`)

-   **3.5. Nhân Viên Điều Hành (UC-OPER)**
-   **UC-OPER-01: Duyệt Tin đăng:** (Hoàn thành - `DuyetTinDang.jsx`)
-   **UC-OPER-02: Quản lý Danh sách Dự án:** (Hoàn thành - `QuanLyDuAnOperator.jsx`)
-   **UC-OPER-03: Quản lý Lịch làm việc NVBH:** (Hoàn thành - `QuanLyLichNVBH.jsx`)
-   **UC-OPER-04 & 05: Quản lý & Tạo Hồ sơ Nhân viên:** (Hoàn thành - `QuanLyNhanVien.jsx`)
-   **UC-OPER-06: Lập Biên bản Bàn giao:** (Hoàn thành - `QuanLyBienBan.jsx`)

-   **3.6. Quản Trị Viên (UC-ADMIN)**
-   **UC-ADMIN-01: Quản lý Tài khoản Người dùng:** (Đang phát triển)
-   **UC-ADMIN-02: Quản lý Danh sách Dự án:** (Hoàn thành)
-   **UC-ADMIN-03: Quản lý Danh sách Khu vực:** (Hoàn thành)
-   **UC-ADMIN-08: Xem NhậtKýHệThống:** (Đang phát triển - Backend có, thiếu UI)
-   **UC-ADMIN-09: Quản lý Chính sách Cọc:** (Hoàn thành)

---

### Phần 2: Tổng hợp từ toàn bộ thư mục tài liệu (docs/ và server/docs/)

Tôi sẽ tổng hợp thông tin từ tất cả các tệp trong `docs/` (root) và `server/docs/`, kèm các README tài liệu hóa liên quan (ví dụ: `server/routes/README_AUTH_MODES.md`, `client/src/pages/ChuDuAn/README.md`). Nội dung được gom nhóm theo chủ đề để đưa vào SRS và phụ lục nguồn.

- Nhóm Use Cases & Quy trình nghiệp vụ:
- `docs/use-cases-v1.2.md` (chuẩn gốc), `use-cases-v1.1.md`, `use-cases-v1.0.md` (đối chiếu thay đổi)
- `FLOW_TAO_TIN_DANG_MOI.md`, `UC_PROJ_04_IMPLEMENTATION_SUMMARY.md`, `UC_PROJ_04_05_IMPLEMENTATION_PLAN.md`, `CUOC_HEN_IMPLEMENTATION_COMPLETE.md`, `CUOC_HEN_UI_DESIGN.md`, `phe-duyet-cuoc-hen-implementation.md`
- Nhóm Kiến trúc & Tích hợp:
- `GEOCODING_ARCHITECTURE_FINAL.md`, `MODAL_GEOCODING_IMPLEMENTATION.md`, `SMART_ADDRESS_DRAGGABLE_MARKER.md`
- `PHONG_SYNC_ARCHITECTURE.md`, `PHONG_SYNCHRONIZATION_SOLUTION.md`, `INDEX_PHONG_SYNC.md`, `DEPLOYMENT_GUIDE_PHONG_SYNC.md`, `QUICK_START_PHONG_SYNC.md`
- Nhóm Bảo mật & Xác thực:
- `JWT_AUTH_MIGRATION.md`, `AUTH_MIDDLEWARE_CLARIFICATION.md`, `server/docs/AUTH_MIGRATION_STANDARD.md`, `server/routes/README_AUTH_MODES.md`
- Nhóm UI/UX & Chuẩn giao diện:
- `BEM_MIGRATION_GUIDE.md`, `DESIGN_SYSTEM_COLOR_PALETTES.md`, `COLOR_PALETTE_UPDATE_SUMMARY.md`, `QUANLYDUAN_UX_ANALYSIS_AND_REDESIGN.md`, `MODAL_*_REDESIGN.md`
- Nhóm Operator/Sales/Modules:
- `NHAN_VIEN_BAN_HANG_IMPLEMENTATION.md`, `NHAN_VIEN_BAN_HANG_IMPLEMENTATION_PLAN.md`, `TESTING_SALES_STAFF_MODULE.md`, `NVBH_TESTING_*`, `OPERATOR_API_FIX_SUMMARY.md`, `OPERATOR_LOGIN_TEST.md`
- Nhóm Dashboard/Báo cáo:
- `DASHBOARD_METRICS_ANALYSIS.md`, `DASHBOARD_BAOCAO_OPTIMIZATION_PLAN.md`, `SYNC_VERIFICATION_QUANLYDUAN.md`, `QUANLYDUAN_INTEGRATION_COMPLETE.md`, `QUANLYDUAN_V2_COMPLETE.md`
- Nhóm Tình trạng triển khai & Refactor:
- `IMPLEMENTATION_STATUS.md`, `IMPLEMENTATION_*SUMMARY.md`, `FINAL_IMPLEMENTATION_SUMMARY.md`, `REFACTOR_*`, `ROLLBACK_PLAN.md`, `SERVER_START_ALL_ROUTES_FIXED.md`
- Nhóm Testing:
- `TESTING_GUIDE.md`, `PHASE_4A_TESTING_GUIDE.md`, `QUICK_START_TEST.md`, `TEST_README.md`, `NVBH_TESTING_REPORT.md`
- Nhóm CSDL/Schema:
- `thue_tro.sql`, `HOA_HONG_SCHEMA_ANALYSIS.md`
- Nhóm lỗi/khắc phục (đưa vào ràng buộc/ghi chú SRS khi phù hợp):
- `BUGFIX_*`, `FIX_*`, `FINAL_FIX_PHPMYADMIN_VARIABLES.md`

Đầu ra mở rộng:
1) SRS toàn hệ thống (docs/SRS_v1.0.md) – trích xuất, hợp nhất và chuẩn hóa từ toàn bộ nhóm tài liệu trên (ưu tiên `use-cases-v1.2.md` làm chuẩn).
2) Phụ lục Nguồn (docs/SRS_SOURCES_INDEX.md) – bảng ánh xạ từng mục SRS ↔ tài liệu nguồn (file + section).
3) Hiện trạng Hệ thống (docs/SYSTEM_ACTUAL_STATUS_2025.md) – tổng hợp tiến độ từ các “IMPLEMENTATION_*”, “REFACTOR_*”, “*_COMPLETE.md”, đối chiếu thực thi ở code.
4) Ma trận truy vết (docs/SRS_REQUIREMENTS_TRACEABILITY.md) – UC/NFR ↔ Routes/Controllers/Models ↔ Tests.

Quy trình thực hiện (không sửa code):

- Quét và phân loại tài liệu (đã liệt kê ở trên).  
- Chuẩn hóa thuật ngữ theo `use-cases-v1.2.md`.  
- Soạn SRS theo cấu trúc IEEE/ISO (Intro, Overall, System Features, Data Model, NFR, Security, Audit, State Models, External Interfaces).  
- Trích dẫn chính xác nguồn (file + section) vào phụ lục.  
- Tổng hợp trạng thái triển khai và lập ma trận truy vết.

Sau khi bạn xác nhận, tôi sẽ tiến hành tổng hợp theo danh mục trên và cung cấp bản nháp đầu tiên của SRS cùng các phụ lục.
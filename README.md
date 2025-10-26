# Dự án Nền tảng Cho thuê Phòng trọ

[cite_start]Dự án này xây dựng một nền tảng cho thuê phòng trọ theo mô hình **thị trường trung gian được quản lý (managed marketplace)**[cite: 3]. [cite_start]Nền tảng không chỉ là nơi kết nối người thuê và chủ trọ mà còn có sự tham gia của đội ngũ vận hành nội bộ để đảm bảo chất lượng tin đăng, điều phối lịch hẹn và hỗ trợ giao dịch[cite: 4, 9, 10].

Để xem chi tiết về toàn bộ nghiệp vụ và các trường hợp sử dụng (use cases), vui lòng tham khảo file **[docs/use-cases.md](./docs/use-cases-v1.2.md)**.

## Tính năng chính

[cite_start]Hệ thống được thiết kế để phục vụ nhiều nhóm người dùng khác nhau với các bộ tính năng chuyên biệt[cite: 28]:

* **Dành cho Khách hàng:**
    * [cite_start]Tìm kiếm và lọc phòng trọ nâng cao[cite: 28].
    * [cite_start]Hẹn lịch xem phòng trực tuyến dựa trên lịch làm việc của nhân viên[cite: 28].
    * [cite_start]Quản lý ví điện tử, thực hiện đặt cọc an toàn[cite: 28].
* **Dành cho Chủ dự án:**
    * [cite_start]Đăng tin cho thuê và gửi duyệt[cite: 28].
    * [cite_start]Theo dõi hiệu suất kinh doanh qua báo cáo[cite: 28].
    * [cite_start]Báo cáo hợp đồng đã ký kết để cập nhật trạng thái phòng[cite: 28].
* **Dành cho Đội ngũ Vận hành:**
    * [cite_start]**(Nhân viên Điều hành)** Duyệt tin đăng, quản lý nhân viên và lịch làm việc[cite: 28].
    * [cite_start]**(Nhân viên Bán hàng)** Quản lý lịch làm việc, xác nhận cuộc hẹn và báo cáo kết quả[cite: 28].
* **Dành cho Quản trị viên:**
    * [cite_start]Quản lý toàn bộ tài khoản, vai trò, quyền hạn (RBAC)[cite: 28, 685].
    * [cite_start]Xem sổ cái giao dịch không thể thay đổi (immutable ledger) và audit log[cite: 643, 705].

## Stack Công nghệ

* **Backend:** Node.js, Express.js (Thư mục: `server/`)
* **Frontend:** React, Vite (Thư mục: `client/`)
* **Database:** MySQL / MariaDB (Schema tại `thue_tro.sql`)

## Khởi chạy Dự án (Quick Start)

1.  **Clone repository:**
    ```bash
    git clone https://github.com/tienchung21/daphongtro.git
    cd daphongtro
    ```

2.  **Cài đặt dependencies:**
    ```bash
    # Cài đặt cho backend
    cd server
    npm install

    # Cài đặt cho frontend
    cd ../client
    npm install
    ```

3.  **Thiết lập Database:**
    * Đảm bảo bạn đã có một server MySQL đang chạy.
    * Tạo một database mới (ví dụ: `thue_tro`).
    * Import dữ liệu từ file `thue_tro.sql` vào database vừa tạo.

4.  **Cấu hình Biến môi trường:**
    * Di chuyển vào thư mục `server/`.
    * Sao chép file `.env.example` thành `.env`: `cp .env.example .env`.
    * Mở file `.env` và điền các thông tin kết nối database của bạn.

5.  **Chạy dự án:**
    ```bash
    # Chạy backend server (từ thư mục server/)
    npm start

    # Chạy frontend dev server (từ thư mục client/)
    npm run dev
    ```
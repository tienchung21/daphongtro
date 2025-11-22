# Đặc tả Use Case — Hệ thống Cho thuê Phòng trọ (Managed Marketplace)

**Phiên bản:** 1.1 (2025-09-25)

**Phạm vi:** Nền tảng cho thuê phòng trọ theo mô hình managed marketplace, có đội ngũ vận hành chủ động điều phối giao dịch.

## 0) Mục tiêu & Phạm vi

* **Mục tiêu:** Hiện đại hoá quy trình cho thuê; tăng minh bạch, an toàn; tối ưu tỉ lệ chuyển đổi Nhu cầu → Hẹn → Cọc → Hợp đồng → Lấp đầy.
* **Phạm vi:** Chỉ cho thuê phòng trọ (TinĐăng, hẹn xem, đặt cọc, ký hợp đồng).
* **Nguyên tắc:** Trung gian có kiểm soát (xác minh danh tính - KYC, duyệt tin, phân công NhanVienBanHang, chính sách cọc/hoàn cọc, ghi NhậtKýHệThống), security-by-default, đo lường được.

## 1) Tác nhân (Actors)

* **KhachHang (Customer):** Tìm–hẹn–cọc–ký hợp đồng; có ví nội bộ để quản lý TiềnTạmGiữ (Escrow).
* **ChuDuAn (Project Owner):** Đăng tin, theo dõi hiệu suất, và thực hiện các xác nhận đặc biệt nếu chính sách yêu cầu.
* **NhanVienBanHang (Sales):** Đăng ký lịch làm việc, nhận và quản lý CuộcHẹn, xác nhận đặt cọc, và báo cáo kết quả công việc.
* **NhanVienDieuHanh (Operator):** Duyệt tin đăng, điều phối lịch làm việc và nhân sự, có thể thực hiện hành động thay mặt (act-as) khi cần thiết (bắt buộc ghi lại trong NhậtKýHệThống).
* **QuanTriVien (Admin):** Quản lý tài khoản, dự án, khu vực, MẫuHợpĐồng, chính sách, phân quyền (RBAC), và xem NhậtKýHệThống.
* **Tài khoản đa vai trò:** Một người dùng có thể đảm nhiệm nhiều vai trò; hệ thống hỗ trợ chuyển đổi vai trò tức thời mà không cần đăng xuất.

## 2) Từ điển khái niệm

* **TinĐăng (Listing):** Tin đăng cho thuê bao gồm mô tả, hình ảnh, giá, vị trí, và các thuộc tính khác.
* **Phòng (Unit):** Một đơn vị cho thuê cụ thể (ví dụ: một phòng trong một tòa nhà), được gắn với một TinĐăng.
* **CuộcHẹn (Appointment):** Một cuộc hẹn đã được lên lịch để xem Phòng.
* **TiềnTạmGiữ (Escrow):** Tiền đặt cọc của khách hàng được giữ tại ví của hệ thống cho đến khi các điều kiện giải tỏa được đáp ứng.
* **MẫuHợpĐồng (Contract Template):** Mẫu hợp đồng có quản lý phiên bản. Hợp đồng khi được tạo ra phải là một bản sao (snapshot) nội dung của mẫu tại thời điểm đó.
* **NhậtKýHệThống (Audit Log):** Bảng ghi lại toàn bộ các hành động quan trọng trên hệ thống để phục vụ việc kiểm toán và theo dõi.
* **BútToánSổCái (Ledger Entry):** Một dòng ghi nhận Ghi Nợ/Ghi Có trong sổ cái tài chính, đảm bảo tính toàn vẹn và không thể thay đổi của các giao dịch.

## 3) Mô hình trạng thái

### 3.1 TinĐăng

`Nhap -> ChoDuyet -> DaDuyet -> DaDang -> (TamNgung | TuChoi) -> LuuTru`

* **Ràng buộc:** TinĐăng chỉ có thể chuyển sang trạng thái DaDang khi có đủ số lượng ảnh yêu cầu, địa chỉ đã được chuẩn hoá, giá hợp lệ, và ChuDuAn đã hoàn thành xác minh danh tính (KYC).

### 3.2 Phòng

`Trong <-> GiuCho -> DaThue -> DonDep -> Trong`

* **Ràng buộc:** Trạng thái GiuCho sẽ tự động được giải phóng nếu quá thời gian giữ chỗ (TTL) mà hợp đồng chưa được ký. Việc tính phí hoặc hoàn phí sẽ tuân theo chính sách đã định.

### 3.3 CuộcHẹn

`DaYeuCau -> ChoXacNhan* -> DaXacNhan -> (DaDoiLich | HuyBoiKhach | HuyBoiHeThong | KhachKhongDen) -> HoanThanh`

* ***Ghi chú:** Trạng thái ChoXacNhan chỉ áp dụng cho các dự án yêu cầu ChuDuAn hoặc sàn phải duyệt trước.

### 3.4 GiaoDịch / Ví

`KhoiTao -> DaUyQuyen -> DaGhiNhan/DaThanhToan -> (DaHoanTien | DaDaoNguoc)`

* **SổCái:** Hoạt động theo nguyên tắc chỉ ghi thêm (append-only). Một BútToánĐảoNgược là một bút toán đối ứng tham chiếu đến bút toán gốc.

## 4) Quy tắc nghiệp vụ toàn cục

### TiềnTạmGiữ & hoàn cọc:

* Khi hợp đồng được ký, TiềnTạmGiữ sẽ được giải tỏa cho ChuDuAn sau khi trừ phí nền tảng.
* Hủy trong thời gian cho phép (cooling-off) sẽ được hoàn 100%.
* Hủy sát giờ hẹn sẽ hoàn X% và tính phí Y% (có thể cấu hình).
* Phí nền tảng được hạch toán trên một dòng BútToánSổCái riêng biệt.

### Phân công NhanVienBanHang & chống trùng lịch:

* Hệ thống ưu tiên phân công dựa trên khu vực, ca rảnh, SLA, và tải công việc hiện tại.
* NhanVienDieuHanh có thể gán thủ công.
* Hệ thống chặn đặt trùng lịch cho cùng một Phòng.
* Có cơ chế giữ chỗ tạm thời (soft-hold) slot trong ≤ 5 phút khi khách hàng đang trong quá trình chọn.

### Idempotency & Rate limits:

* Các hành động quan trọng như đặt lịch hoặc đặt cọc sử dụng KhóaĐịnhDanh (Idempotency Key) để chống trùng lặp yêu cầu.
* Áp dụng giới hạn: 5 lần đăng nhập/phút/IP; 3 lần đặt cọc/phút/người dùng; và các cơ chế chống spam chat.

### Xác minh danh tính (KYC) & Tin cậy:

* ChuDuAn phải hoàn thành KYC trước khi TinĐăng được phép DaDang.
* Có chương trình "ChuDuAn Tin Cậy" cho phép tự động duyệt và hậu kiểm.

### Thông báo:

* Các sự kiện chính sẽ kích hoạt thông báo: tạo/đổi/hủy hẹn, thay đổi trạng thái TinĐăng/Phòng, cọc/hoàn cọc, ký hợp đồng, thay đổi quyền.
* Kênh thông báo: trong ứng dụng (in-app), email, và thông báo đẩy (push).
* Có Trung tâm Thông báo cho người dùng và quản lý MẫuThôngBáo cho quản trị viên.

### SLA vận hành:

* Thời gian duyệt tin: ≤ 4 giờ làm việc.
* Thời gian phản hồi chat đầu tiên của NhanVienBanHang trong ca: ≤ 10 phút.

## 5) Đặc tả Use Case chi tiết

### 5.1 Chung (GEN)

#### UC-GEN-01: Đăng Nhập

* **Mục tiêu:** Xác thực và tạo phiên truy cập an toàn cho người dùng.
* **Tác nhân:** Tất cả các vai trò.
* **Kích hoạt:** Người dùng mở trang đăng nhập.
* **Tiền điều kiện:** Tài khoản đã tồn tại. Nếu xác thực đa yếu tố (MFA) được bật, người dùng đã cài đặt phương thức MFA.
* **Ràng buộc:** Giới hạn 5 lần/phút/IP. Form đăng nhập được bảo vệ chống lại tấn công CSRF.
* **Hậu điều kiện (Thành công):** Phiên làm việc hoặc JWT hợp lệ được tạo, người dùng được chuyển đến trang dashboard tương ứng với vai trò hiện tại.
* **Luồng chính:**
    1.  Người dùng nhập tên đăng nhập/mật khẩu và gửi.
    2.  Hệ thống xác thực thông tin (sử dụng password hash).
    3.  (Nếu MFA được bật) Hệ thống yêu cầu mã OTP và xác minh.
    4.  Tạo session/JWT, thiết lập cookie an toàn, và ghi nhận `dang_nhap_thanh_cong` vào NhậtKýHệThống.
    5.  Điều hướng người dùng đến Dashboard.
* **Nhánh/Ngoại lệ:**
    * **2a. Sai thông tin:** Tăng bộ đếm, khi đủ ngưỡng sẽ tạm thời khóa tài khoản trong x phút.
    * **2b. Tài khoản bị khóa:** Hiển thị lý do và thông tin liên hệ hỗ trợ.
    * **3a. MFA sai/quá hạn:** Yêu cầu nhập lại mã mới.
    * **4a. CSRF token không hợp lệ:** Từ chối yêu cầu, yêu cầu tải lại trang.
* **Audit:** `dang_nhap_thanh_cong`, `dang_nhap_that_bai`, `tai_khoan_bi_khoa`.
* **Nghiệm thu:** Thử sai 5 lần dẫn đến khóa tạm; MFA sai không tạo phiên; cookie có cờ HttpOnly/SameSite.

#### UC-GEN-02: Đăng Ký Tài Khoản

* **Mục tiêu:** Cho phép người dùng mới tạo tài khoản.
* **Tác nhân:** KhachHang, ChuDuAn.
* **Tiền điều kiện:** Email hoặc số điện thoại chưa được đăng ký trong hệ thống.
* **Ràng buộc:** Mật khẩu phải đạt độ mạnh yêu cầu; người dùng phải đồng ý với điều khoản dịch vụ.
* **Hậu điều kiện (Thành công):** Một người dùng mới được tạo với trạng thái ChờXácMinh. Hệ thống gửi email/SMS chứa mã hoặc đường dẫn xác minh.
* **Luồng chính:**
    1.  Người dùng mở form đăng ký và nhập thông tin (tên, email/SĐT, mật khẩu) và đồng ý với điều khoản.
    2.  Hệ thống thực hiện kiểm tra và xác thực dữ liệu phía server.
    3.  Tạo một bản ghi người dùng mới với trạng thái là ChoXacMinh.
    4.  Gửi mã/đường dẫn xác minh đến email/SĐT của người dùng.
    5.  Hiển thị thông báo hướng dẫn người dùng kiểm tra và xác minh tài khoản.
* **Nhánh/Ngoại lệ:**
    * **2a. Email/SĐT đã tồn tại:** Hiển thị thông báo lỗi.
    * **2b. Mật khẩu yếu:** Gợi ý người dùng tăng cường độ mạnh của mật khẩu.
    * **4a. Gửi mail/SMS lỗi:** Thực hiện retry và hiển thị banner thông báo.
* **Audit:** `nguoi_dung_dang_ky`.
* **Nghiệm thu:** Không thể đăng ký email/SĐT trùng; link xác minh chỉ có hiệu lực một lần hoặc trong một khoảng thời gian nhất định (TTL).

#### UC-GEN-03: Chuyển Đổi Vai Trò

* **Mục tiêu:** Cho phép người dùng có nhiều vai trò chuyển đổi giữa các vai trò đang hoạt động.
* **Tác nhân:** Người dùng có ≥ 2 vai trò.
* **Tiền điều kiện:** Người dùng đã đăng nhập và được gán ít nhất 2 vai trò.
* **Hậu điều kiện:** Quyền truy cập (permission) được cập nhật theo vai trò mới, giao diện người dùng được làm mới.
* **Luồng chính:**
    1.  Người dùng mở menu tài khoản và chọn vai trò mục tiêu.
    2.  Server cập nhật VaiTroHoatDongID trong session/JWT của người dùng.
    3.  Tải lại trang hoặc API guard nạp các quyền mới tương ứng.
* **Ngoại lệ:** Vai trò không khả dụng → báo lỗi và giữ vai trò cũ.
* **Audit:** `chuyen_doi_vai_tro (from → to)`.
* **Nghiệm thu:** API trả về claim quyền mới; các tài nguyên bị chặn trước đó vẫn bị chặn sau khi đổi vai trò nếu vai trò mới không có quyền truy cập.

#### UC-GEN-04: Xem Danh Sách Cuộc Hẹn

* **Mục tiêu:** Hiển thị danh sách các CuộcHẹn phù hợp với vai trò của người dùng.
* **Tác nhân:** KhachHang, NhanVienBanHang, ChuDuAn, NhanVienDieuHanh.
* **Luồng chính:**
    1.  Người dùng truy cập trang quản lý CuộcHẹn.
    2.  Server trả về danh sách CuộcHẹn dựa trên phạm vi vai trò:
        * **KhachHang:** Chỉ thấy các cuộc hẹn do chính họ tạo.
        * **NhanVienBanHang:** Chỉ thấy các cuộc hẹn được giao cho họ.
        * **ChuDuAn:** Thấy các cuộc hẹn liên quan đến TinĐăng/Phòng của họ.
        * **NhanVienDieuHanh:** Thấy tất cả các cuộc hẹn và có bộ lọc nâng cao.
    3.  Người dùng có thể lọc danh sách theo trạng thái, khoảng thời gian, khu vực, v.v.
* **Ngoại lệ:** Không có dữ liệu → hiển thị trạng thái trống.
* **Audit:** `xem_danh_sach_cuoc_hen`.
* **Nghiệm thu:** Phân trang và lọc hoạt động chính xác; người dùng chỉ thấy được dữ liệu trong phạm vi cho phép của mình.

#### UC-GEN-05: Trung Tâm Thông Báo

* **Mục tiêu:** Cho phép người dùng xem, điều hướng và quản lý thông báo. Cho phép QuanTriVien quản lý các mẫu thông báo.
* **Tác nhân:** Tất cả người dùng (xem thông báo), QuanTriVien (quản lý mẫu).
* **Luồng chính (Người dùng):** Xem danh sách thông báo → nhấp vào một mục → được điều hướng đến tài nguyên liên quan → thông báo được đánh dấu là đã đọc.
* **Luồng chính (QuanTriVien):** Mở trang cấu hình → tạo/sửa mẫu thông báo (trigger, biến, kênh gửi...) → lưu lại.
* **Ngoại lệ:** Tài nguyên đích không tồn tại → hiển thị thông báo thân thiện.
* **Audit:** `doc_thong_bao`, `cap_nhat_mau_thong_bao`.
* **Nghiệm thu:** Nhấp vào thông báo dẫn đến đúng đích; template render đúng các biến dữ liệu.

### 5.2 KhachHang (CUST)

#### UC-CUST-01: Tìm Kiếm Phòng Trọ

* **Mục tiêu:** Tìm TinĐăng phù hợp.
* **Tác nhân:** KhachHang / Public.
* **Luồng chính:** Nhập từ khóa/áp dụng bộ lọc → Tìm kiếm → Xem kết quả → Mở trang chi tiết.
* **Ràng buộc:** P95 ≤ 2s; chống SQLi.
* **Ngoại lệ:** Không có kết quả → Gợi ý nới lỏng điều kiện tìm kiếm.
* **Audit:** `tim_kiem_tin_dang`.
* **Nghiệm thu:** Bộ lọc (khu vực, giá, tiện ích…) hoạt động chính xác; sắp xếp đúng.

#### UC-CUST-02: Quản Lý Yêu Thích

* **Mục tiêu:** Lưu lại các TinĐăng quan tâm.
* **Tác nhân:** KhachHang.
* **Tiền điều kiện:** Đã đăng nhập.
* **Luồng chính:** Nhấn nút “Yêu thích” trên TinĐăng → tạo liên kết; xem danh sách yêu thích; bỏ yêu thích.
* **Ngoại lệ:** Chưa đăng nhập → hiển thị popup yêu cầu đăng nhập.
* **Audit:** `them_yeu_thich`, `xoa_yeu_thich`.
* **Nghiệm thu:** Không có bản ghi trùng; trạng thái UI cập nhật tức thời.

#### UC-CUST-03: Hẹn Lịch Xem Phòng

* **Mục tiêu:** Tạo CuộcHẹn hợp lệ, chống trùng slot.
* **Tiền điều kiện:** Phòng ở trạng thái Trống; KhachHang đã KYC tối thiểu; chưa quá giới hạn đổi lịch (SoLanDoiLich < N).
* **Ràng buộc:** Giữ chỗ tạm thời slot ≤ 5 phút; KhóaĐịnhDanh (user, unit, slot) để chống trùng lặp.
* **Hậu điều kiện:** CuộcHẹn được DaXacNhan, NhanVienBanHang được gán; gửi thông báo.
* **Luồng chính:**
    1.  Mở “Hẹn lịch” trên Phòng → tải các slot còn trống.
    2.  Chọn slot → server xác thực (trùng lịch, TTL giữ chỗ).
    3.  Xác nhận → tạo CuộcHẹn với trạng thái DaYeuCau (hoặc ChoXacNhan*) → tự động gán NhanVienBanHang → chuyển trạng thái sang DaXacNhan.
    4.  Gửi thông báo cho KhachHang/NhanVienBanHang/ChuDuAn.
* **Nhánh/Ngoại lệ:**
    * **2a. Overbook:** Hết slot trong lúc chọn → gợi ý slot gần nhất.
    * **3a. Dự án yêu cầu duyệt:** CuộcHẹn ở trạng thái ChoXacNhan cho đến khi ChuDuAn/NhanVienDieuHanh duyệt.
    * **4a. DoiLich:** Giới hạn N lần/tuần, khi đổi lịch giữ nguyên NhanVienBanHang nếu phù hợp.
    * **4b. No-show:** Đánh dấu KhachKhongDen; áp dụng chế tài từ lần thứ 2.
* **Audit:** `tao_cuoc_hen`, `doi_lich`, `huy_lich`, `khach_khong_den`.
* **Nghiệm thu:** Hai người dùng cùng tạo một slot → chỉ một người thành công; chức năng đổi lịch bị giới hạn.

#### UC-CUST-04: Thực Hiện Đặt Cọc (TiềnTạmGiữ)

* **Mục tiêu:** Giữ chỗ Phòng bằng cách đặt cọc an toàn.
* **Tiền điều kiện:** Số dư trong ví ≥ tiền cọc; CuộcHẹn đã ở trạng thái DaXacNhan.
* **Ràng buộc:** Sử dụng KhóaĐịnhDanh (UUID) cho hành động đặt cọc.
* **Hậu điều kiện:** GiaoDịch DaGhiNhan; Phòng → GiuCho; thông báo 3 bên.
* **Luồng chính:**
    1.  Nhấn “Đặt cọc” → hiển thị màn hình xác nhận (giá trị, điều khoản, phí).
    2.  Gọi cổng thanh toán hoặc ví nội bộ: Authorize → Capture.
    3.  Tạo BútToánSổCái (chỉ ghi thêm); cập nhật trạng thái Phòng sang GiuCho.
    4.  Gửi thông báo.
* **Ngoại lệ:** Số dư không đủ; cổng thanh toán lỗi; KhóaĐịnhDanh trùng → từ chối yêu cầu lặp.
* **Audit:** `dat_coc_thanh_cong`.
* **Nghiệm thu:** Nhấn nút 2 lần nhanh chỉ tạo ra 1 GiaoDịch DaGhiNhan; số dư và SổCái khớp.

#### UC-CUST-05: Hủy Giao Dịch (Hoàn tiền/Đảo ngược)

* **Mục tiêu:** Yêu cầu hoàn cọc theo chính sách.
* **Tiền điều kiện:** GiaoDịch ở trạng thái DaGhiNhan/DaThanhToan và trong khung thời gian cho phép hoàn tiền.
* **Hậu điều kiện:** Tạo lệnh hoàn tiền (Refund/Reversal) theo chính sách; có thể giải phóng Phòng về trạng thái Trống.
* **Luồng chính:**
    1.  Vào lịch sử giao dịch → chọn giao dịch → “Hủy/Hoàn tiền”.
    2.  Hiển thị mức hoàn và phí (nếu có) → xác nhận.
    3.  Tạo lệnh hoàn tiền → cập nhật trạng thái giao dịch & Phòng.
* **Ngoại lệ:** Quá hạn/không hợp lệ → từ chối kèm lý do.
* **Audit:** `yeu_cau_hoan_tien`, `da_hoan_tien`, `tu_choi`.
* **Nghiệm thu:** Số tiền hoàn chính xác; bút toán đối ứng đảm bảo tổng hệ thống không đổi.

#### UC-CUST-06: Quản Lý Ví Điện Tử

* **Mục tiêu:** Xem số dư, nạp tiền, và lịch sử giao dịch.
* **Tác nhân:** KhachHang.
* **Luồng chính:** Mở “Ví của tôi” → xem số dư & lịch sử → “Nạp tiền” → cập nhật số dư.
* **Ngoại lệ:** Nạp tiền lỗi → thực hiện retry/backoff.
* **Audit:** `nap_vi_thanh_cong`, `nap_vi_that_bai`.
* **Nghiệm thu:** Lịch sử được sắp xếp theo thời gian; số dư = đầu kỳ + ∑(các dòng hợp lệ).

#### UC-CUST-07: Nhắn Tin

* **Mục tiêu:** Trao đổi với NhanVienBanHang/ChuDuAn.
* **Luồng chính:** Mở hội thoại → Soạn tin → Gửi → Hiển thị real-time/near-real-time.
* **Ngoại lệ:** Spam/rate limit → chặn tạm thời.
* **Audit:** `gui_tin_nhan`.
* **Nghiệm thu:** Tin nhắn mới hiển thị ở cả hai phía; thông báo đẩy hoạt động.

### 5.3 NhanVienBanHang (SALE)

#### UC-SALE-01: Đăng ký Lịch làm việc

* **Mục tiêu:** Khai báo các khung giờ rảnh để hệ thống có thể tự động gán CuộcHẹn.
* **Tác nhân:** NhanVienBanHang.
* **Tiền điều kiện:** Đã đăng nhập với vai trò NhanVienBanHang.
* **Hậu điều kiện:** Ca làm việc được lưu vào hệ thống, sẵn sàng cho việc phân công. Hệ thống chống xung đột lịch.
* **Luồng chính:** Mở trang “Lịch làm việc” → chọn ngày/ca làm việc → Lưu.
* **Ngoại lệ:** Cố gắng xóa một ca làm việc đã có CuộcHẹn DaXacNhan → hệ thống từ chối và thông báo.
* **Audit:** `tao_ca_lam_viec_sales`, `cap_nhat_ca_lam_viec_sales`.
* **Nghiệm thu:** Gỡ bỏ một ca làm việc trống thì thành công; không thể gỡ bỏ ca đã có hẹn.

#### UC-SALE-02: Xem Chi tiết Cuộc hẹn

* **Mục tiêu:** Nắm bắt đầy đủ thông tin về CuộcHẹn để chuẩn bị và thực hiện.
* **Tác nhân:** NhanVienBanHang.
* **Luồng chính:** Chọn một CuộcHẹn từ danh sách → xem thông tin chi tiết (thông tin khách hàng, Phòng, thời gian, địa điểm, ghi chú, trạng thái, lịch sử).
* **Audit:** `xem_chi_tiet_cuoc_hen`.
* **Nghiệm thu:** Dữ liệu hiển thị đầy đủ và chính xác; các thông tin nhạy cảm nằm ngoài quyền hạn sẽ được ẩn đi.

#### UC-SALE-03: Quản lý Cuộc hẹn (Xác nhận/Đổi lịch/Hủy)

* **Tác nhân:** NhanVienBanHang.
* **Tiền điều kiện:** CuộcHẹn đã được phân công cho NhanVienBanHang đó.
* **Luồng chính:**
    * **Xác nhận:** Nhấn nút “Xác nhận” → trạng thái CuộcHẹn được cập nhật → gửi thông báo.
    * **Đổi lịch:** Chọn một slot thời gian mới hợp lệ → Lưu → gửi thông báo cho các bên liên quan.
    * **Hủy:** Nhập lý do hủy → trạng thái CuộcHẹn được cập nhật → gửi thông báo và áp dụng chính sách (nếu hủy sát giờ).
* **Ngoại lệ:** Vượt quá giới hạn số lần đổi lịch cho phép → cần NhanVienDieuHanh duyệt.
* **Audit:** `xac_nhan_cuoc_hen`, `doi_lich_cuoc_hen`, `huy_cuoc_hen (bởi NhanVienBanHang)`.
* **Nghiệm thu:** Hệ thống không cho phép đổi vào slot đã có lịch; thông báo được gửi đến đủ 3 bên (KhachHang, NhanVienBanHang, ChuDuAn).

#### UC-SALE-04: Xác nhận Cọc của Khách hàng

* **Mục tiêu:** Xác nhận giao dịch đặt cọc đã được thực hiện thành công (nếu quy trình yêu cầu).
* **Tác nhân:** NhanVienBanHang.
* **Tiền điều kiện:** GiaoDịch đang ở trạng thái DaUyQuyen hoặc DaGhiNhan; có quyền xem GiaoDịch.
* **Luồng chính:** Truy cập danh sách GiaoDịch → chọn giao dịch cần xác nhận → Nhấn “Xác nhận” → hệ thống cập nhật trạng thái và tính hoa hồng (nếu có).
* **Audit:** `coc_xac_nhan_boi_sales`.
* **Nghiệm thu:** Hoa hồng được tính toán và hiển thị đúng trong báo cáo thu nhập cá nhân.

#### UC-SALE-05: Báo cáo Kết quả Cuộc hẹn

* **Mục tiêu:** Ghi nhận lại kết quả của CuộcHẹn (thành công, thất bại, cần theo dõi thêm).
* **Tác nhân:** NhanVienBanHang.
* **Luồng chính:** Chọn một CuộcHẹn đã diễn ra → nhập kết quả (ví dụ: khách đã cọc, khách từ chối...) và ghi chú → Lưu.
* **Ngoại lệ:** Quá hạn khai báo kết quả → hệ thống cảnh báo hoặc ghi nhận vi phạm SLA.
* **Audit:** `bao_cao_ket_qua_cuoc_hen`.
* **Nghiệm thu:** KPI hiệu suất của NhanVienBanHang được cập nhật; báo cáo SLA phản ánh đúng tình trạng.

#### UC-SALE-06: Xem Báo cáo Thu nhập

* **Mục tiêu:** Theo dõi hoa hồng và thu nhập cá nhân.
* **Tác nhân:** NhanVienBanHang.
* **Luồng chính:** Mở trang “Báo cáo thu nhập” → xem biểu đồ/bảng thống kê, có thể lọc theo kỳ thanh toán hoặc khoảng thời gian.
* **Audit:** `xem_bao_cao_thu_nhap_sales`.
* **Nghiệm thu:** Số liệu trong báo cáo khớp với dữ liệu từ các GiaoDịch và chính sách hoa hồng nguồn.

#### UC-SALE-07: Nhắn tin

* **Mô tả:** Tương tự UC-CUST-07, nhưng ở phía NhanVienBanHang trao đổi với KhachHang. Hệ thống phải tôn trọng phạm vi hội thoại (chỉ NhanVienBanHang được gán cho CuộcHẹn mới có thể nhắn tin).

### 5.4 ChuDuAn (PROJ)

#### UC-PROJ-01: Đăng tin Cho thuê

* **Mục tiêu:** Tạo một TinĐăng mới và gửi cho hệ thống để duyệt.
* **Tác nhân:** ChuDuAn.
* **Tiền điều kiện:** ChuDuAn đã hoàn thành KYC, hoặc sẽ được yêu cầu KYC trước khi TinĐăng được phép DaDang.
* **Ràng buộc:** Phải cung cấp đủ số lượng ảnh tối thiểu; địa chỉ phải được chuẩn hoá; giá phải hợp lệ.
* **Hậu điều kiện:** TinĐăng được tạo và chuyển sang trạng thái ChoDuyet.
* **Luồng chính:** Chọn “Đăng tin mới” → điền vào form nhiều bước (thông tin chung, ảnh, mô tả, giá, vị trí, tiện ích) → xác thực dữ liệu → “Gửi duyệt”.
* **Ngoại lệ:** Thiếu thông tin bắt buộc; định dạng file không hợp lệ; hệ thống nghi ngờ gian lận.
* **Audit:** `gui_tin_dang`.
* **Nghiệm thu:** TinĐăng không thể được DaDang nếu thiếu các điều kiện bắt buộc.

#### UC-PROJ-02: Xác nhận Cuộc hẹn (nếu yêu cầu)

* **Mục tiêu:** Cho phép ChuDuAn phê duyệt các yêu cầu hẹn xem phòng đối với các dự án có chính sách đặc biệt.
* **Tác nhân:** ChuDuAn.
* **Luồng chính:** Nhận thông báo về yêu cầu hẹn mới → mở yêu cầu → chọn “Phê duyệt” hoặc “Từ chối” → hệ thống cập nhật trạng thái CuộcHẹn và thông báo cho các bên.
* **Audit:** `chu_du_an_duyet_cuoc_hen`, `chu_du_an_tu_choi_cuoc_hen`.
* **Nghiệm thu:** Quy trình này chỉ được kích hoạt đối với các TinĐăng đã được cấu hình chính sách yêu cầu duyệt.

#### UC-PROJ-03: Xem Báo cáo Kinh doanh

* **Mục tiêu:** Theo dõi hiệu suất của các TinĐăng.
* **Tác nhân:** ChuDuAn.
* **Luồng chính:** Mở trang “Báo cáo” → xem các chỉ số hiệu suất (số lượt xem, lượt yêu thích, số CuộcHẹn, tỉ lệ lấp đầy).
* **Audit:** `chu_du_an_xem_bao_cao`.
* **Nghiệm thu:** Số liệu trong báo cáo khớp với dữ liệu sự kiện và cơ sở dữ liệu nguồn.

#### UC-PROJ-04: Báo cáo Hợp đồng Cho thuê

* **Mục tiêu:** Báo cáo việc đã ký hợp đồng với khách thuê để chốt trạng thái và giải tỏa TiềnTạmGiữ.
* **Tác nhân:** ChuDuAn.
* **Tiền điều kiện:** Phòng đang ở trạng thái GiuCho; có một giao dịch đặt cọc hợp lệ tồn tại.
* **Luồng chính:** Chọn Phòng đã được đặt cọc → chọn chức năng “Báo cáo hợp đồng” → nhập các thông tin cần thiết → hệ thống chuyển trạng thái Phòng sang DaThue và chuẩn bị giải tỏa TiềnTạmGiữ theo chính sách.
* **Ngoại lệ:** Không có giao dịch cọc hoặc thông tin không khớp → hệ thống từ chối.
* **Audit:** `bao_cao_hop_dong_thue`.
* **Nghiệm thu:** TiềnTạmGiữ sẵn sàng được giải tỏa; trạng thái Phòng được đồng bộ trên toàn hệ thống.

#### UC-PROJ-05: Nhắn tin

* **Mô tả:** Tương tự UC-CUST-07, nhưng ở vai trò ChuDuAn (nếu được hệ thống cho phép).

### 5.5 NhanVienDieuHanh (OPER)

#### UC-OPER-01: Duyệt Tin đăng

* **Mục tiêu:** Đảm bảo TinĐăng đạt tiêu chuẩn chất lượng và pháp lý trước khi được hiển thị công khai.
* **Tác nhân:** NhanVienDieuHanh.
* **Tiền điều kiện:** TinĐăng ở trạng thái ChoDuyet.
* **Ràng buộc:** Phải kiểm tra theo checklist: KYC của ChuDuAn (TrangThaiXacMinh = DaXacMinh), đủ ảnh, dữ liệu an toàn, giá hợp lệ.
* **Hậu điều kiện:** TinĐăng chuyển sang DaDang (nếu duyệt) hoặc TuChoi (nếu không đạt).
* **Luồng chính:** Mở danh sách TinĐăng chờ duyệt → vào chi tiết → kiểm tra theo checklist → chọn “Duyệt” (hoặc “Từ chối” kèm lý do).
* **Ngoại lệ:** Thiếu thông tin KYC → yêu cầu ChuDuAn bổ sung.
* **Audit:** `duyet_tin_dang`, `tu_choi_tin_dang`.
* **Nghiệm thu:** TinĐăng chỉ được DaDang khi tất cả điều kiện trong checklist được thỏa mãn.

#### UC-OPER-02: Quản lý Danh sách Dự án

* **Mục tiêu:** Quản lý vận hành các dự án (ví dụ: tạm ngưng, kích hoạt lại).
* **Luồng chính:** Mở danh sách dự án → lọc/tìm kiếm → chọn dự án → thực hiện hành động (tạm ngưng, kích hoạt...).
* **Audit:** `thay_doi_trang_thai_du_an`.
* **Nghiệm thu:** Khi một dự án bị tạm ngưng, tất cả TinĐăng thuộc dự án đó sẽ không xuất hiện trên trang tìm kiếm của khách hàng.

#### UC-OPER-03: Quản lý Lịch làm việc NVBH (tổng thể)

* **Mục tiêu:** Điều phối nhân sự và ca trực để đảm bảo độ phủ.
* **Luồng chính:** Mở lịch làm việc tổng hợp của tất cả NhanVienBanHang → xem heatmap/phân tích các khu vực thiếu nhân sự → gán lại CuộcHẹn nếu cần thiết.
* **Ngoại lệ:** Gán CuộcHẹn vào ca đã kín hoặc trùng lịch → hệ thống cảnh báo.
* **Audit:** `dieu_hanh_gan_lai_cuoc_hen`.
* **Nghiệm thu:** Việc gán lại CuộcHẹn phải được cập nhật ngay lập tức cho các NhanVienBanHang liên quan.

#### UC-OPER-04: Quản lý Hồ sơ Nhân viên

* **Mục tiêu:** Thêm, sửa, xóa hồ sơ nhân sự nội bộ (không phải quản lý quyền).
* **Luồng chính:** Mở danh sách nhân viên → xem/chỉnh sửa thông tin cơ bản, trạng thái hoạt động (active/inactive).
* **Audit:** `cap_nhat_ho_so_nhan_vien`.
* **Nghiệm thu:** Không thể sửa các trường chỉ đọc (ví dụ: email công ty nếu chính sách cấm).

#### UC-OPER-05: Tạo Tài khoản Nhân viên

* **Mục tiêu:** Tạo tài khoản mới cho NhanVienBanHang.
* **Luồng chính:** Chọn “Tạo tài khoản mới” → nhập thông tin nhân viên → hệ thống tạo người dùng và gửi email mời thiết lập mật khẩu.
* **Ngoại lệ:** Email đã tồn tại → báo lỗi.
* **Audit:** `tao_tai_khoan_nhan_vien`.
* **Nghiệm thu:** Người dùng mới có thể đăng nhập thành công bằng đường link thiết lập mật khẩu một lần.

### 5.6 QuanTriVien Hệ thống (ADMIN)

#### UC-ADMIN-01: Quản lý Tài khoản Người dùng

* **Mục tiêu:** Quản trị tài khoản ở cấp hệ thống (xem, sửa, khóa/mở, reset mật khẩu).
* **Luồng chính:** Tìm kiếm người dùng → xem chi tiết → chỉnh sửa thông tin, gán/gỡ vai trò, kích hoạt quy trình reset mật khẩu → Lưu.
* **Ngoại lệ:** Các thao tác nguy hiểm (ví dụ: xóa tài khoản) yêu cầu xác nhận 2 bước.
* **Audit:** `thay_doi_vai_tro_nguoi_dung`, `khoa_mo_khoa_nguoi_dung`, `khoi_tao_dat_lai_mat_khau`.
* **Nghiệm thu:** Lịch sử các thay đổi quan trọng phải được hiển thị trong NhậtKýHệThống.

#### UC-ADMIN-02: Quản lý Danh sách Dự án

* **Mục tiêu:** Quản trị kỹ thuật danh mục dự án (tạo, xóa, cấu hình).
* **Ràng buộc:** Không cho phép xóa dự án nếu vẫn còn TinĐăng đang hoạt động.
* **Audit:** `tao_du_an`, `xoa`, `cap_nhat`.
* **Nghiệm thu:** Thử xóa một dự án vẫn còn TinĐăng → hệ thống chặn và báo lỗi.

#### UC-ADMIN-03: Quản lý Danh sách Khu vực

* **Mục tiêu:** Quản lý cấu trúc cây khu vực (taxonomy) cho bộ lọc tìm kiếm.
* **Luồng chính:** Truy cập cây khu vực → thêm/sửa/xóa một node (quận, phường...) → Lưu.
* **Ngoại lệ:** Xóa một node đang được sử dụng → yêu cầu chuyển các TinĐăng liên quan sang node khác trước.
* **Audit:** `cap_nhat_danh_muc_khu_vuc`.
* **Nghiệm thu:** Chức năng tìm kiếm theo khu vực phải phản ánh các cập nhật ngay lập tức (sau khi re-index nếu cần).

#### UC-ADMIN-04: Xem Báo cáo Thu nhập Toàn hệ thống

* **Mục tiêu:** Cung cấp cái nhìn tổng quan về tình hình tài chính của nền tảng.
* **Luồng chính:** Mở dashboard tài chính → sử dụng bộ lọc thời gian/nguồn doanh thu → xem biểu đồ và bảng dữ liệu.
* **Dữ liệu:** Doanh thu, nguồn thu, chi phí, lợi nhuận (tách riêng phí nền tảng).
* **Audit:** `xem_bao_cao_tai_chinh_nen_tang`.
* **Nghiệm thu:** Số liệu phải đối soát được với SổCái tổng của hệ thống.

#### UC-ADMIN-05: Quản lý Chính sách

* **Mục tiêu:** Cập nhật các văn bản pháp lý (Điều khoản dịch vụ, Chính sách bảo mật) và biểu phí.
* **Luồng chính:** Chọn chính sách cần cập nhật → chỉnh sửa nội dung → quản lý phiên bản (versioning) → xuất bản.
* **Ngoại lệ:** Thay đổi lớn về phí yêu cầu phải có ngày hiệu lực trong tương lai.
* **Audit:** `xuat_ban_phien_ban_chinh_sach`.
* **Nghiệm thu:** Người dùng mới đăng ký phải chấp nhận phiên bản chính sách mới nhất.

#### UC-ADMIN-06: Quản lý Mẫu Hợp đồng

* **Mục tiêu:** Quản lý các MẫuHợpĐồng và sinh hợp đồng điện tử.
* **Ràng buộc:** Không xóa vật lý các mẫu đã dùng; mỗi loại mẫu chỉ có một phiên bản Active tại một thời điểm; thay đổi lớn phải tăng phiên bản.
* **Luồng chính:**
    1.  Tải lên hoặc soạn thảo mẫu mới → Lưu phiên bản.
    2.  Đặt một phiên bản làm Active (hành động này sẽ vô hiệu hóa phiên bản cũ).
    3.  Sinh hợp đồng: Chọn mẫu Active → điền các biến (thông tin KhachHang, ChuDuAn, Phòng, giá, kỳ hạn, phí...) → sinh ra file PDF là một bản sao (snapshot) nội dung bất biến.
* **Ngoại lệ:** Thiếu các biến bắt buộc → không cho phép sinh hợp đồng.
* **Audit:** `mau_hop_dong_tao_phien_ban_kich_hoat`, `tao_hop_dong`.
* **Nghiệm thu:** File PDF được sinh ra chứa đúng snapshot nội dung; file được lưu kèm checksum để đảm bảo toàn vẹn.

#### UC-ADMIN-07: Quản lý Quyền & Phân quyền (RBAC)

* **Mục tiêu:** Quản lý các VaiTro, Quyen và ánh xạ giữa chúng.
* **Luồng chính:** Tạo/sửa/xóa VaiTro; tạo/sửa/xóa Quyen; gán Quyen vào VaiTro; gán VaiTro cho người dùng.
* **Ngoại lệ:** Không cho phép xóa VaiTro đang được sử dụng (phải di trú người dùng sang vai trò khác trước).
* **Audit:** `vai_tro_tao_cap_nhat_xoa`, `quyen_da_cap_da_thu_hoi`.
* **Nghiệm thu:** Quyền mới phải có hiệu lực ngay trong các lớp guard của hệ thống; các API bị chặn khi người dùng thiếu quyền.

#### UC-ADMIN-08: Xem NhậtKýHệThống

* **Mục tiêu:** Tra cứu các hành động quan trọng để phục vụ kiểm toán và điều tra sự cố.
* **Luồng chính:** Sử dụng bộ lọc (người thực hiện, hành động, đối tượng, khoảng thời gian) → xem chi tiết (dữ liệu trước/sau, metadata, IP, User Agent) → xuất báo cáo.
* **Ràng buộc:** Log phải là append-only, có thể dùng hash chain để đảm bảo toàn vẹn; lưu trữ tối thiểu 365 ngày.
* **Audit:** `xem_nhat_ky_he_thong`, `xuat_nhat_ky_he_thong`.
* **Nghiệm thu:** Việc sửa đổi log bằng tay bị phát hiện (đứt chuỗi hash); truy vấn theo các tiêu chí trả về đúng kết quả.

## 6) RBAC (Quyền–Vai trò)

| Quyền | KhachHang | NhanVienBanHang | ChuDuAn | NhanVienDieuHanh | QuanTriVien |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Tìm kiếm/Xem tin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tạo lịch xem | ✓ | – | – | ✓ (đại diện) | ✓ |
| Nhắn tin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Đăng tin | – | – | ✓ | ✓ (thay mặt) | ✓ |
| Duyệt tin | – | – | – | ✓ | ✓ |
| Quản lý lịch NVBH | – | (chỉ mình) | – | ✓ | ✓ |
| Ví (nạp/cọc/hủy) | ✓ | – | – | – | ✓ (xem) |
| Xem báo cáo hệ thống | – | – | – | – | ✓ |
| RBAC/Policy | – | – | – | – | ✓ |
| NhậtKýHệThống | – | – | – | Read | ✓ |

**Act-as:** Khi NhanVienDieuHanh thao tác thay mặt người dùng khác, giao diện phải hiển thị rõ "acting as..." và NhậtKýHệThống phải ghi lại đầy đủ thông tin.

## 7) Yêu cầu phi chức năng (NFR) & nghiệm thu

### Hiệu năng:

* Tìm kiếm TinĐăng: P95 ≤ 2.0s.
* Đặt cọc end-to-end: ≤ 4s (với gateway sandbox).

### Bảo mật:

* Mật khẩu phải được hash an toàn (Argon2id/Bcrypt).
* Sử dụng KhóaĐịnhDanh cho các GiaoDịch.
* Bảo vệ chống CSRF cho các form thay đổi trạng thái.

### Sẵn sàng:

* Uptime ≥ 99.5%/tháng.

### Nghiệm thu chung:

* **Idempotency:** Gửi lại một request trong thời gian hiệu lực (TTL) sẽ không tạo ra bản ghi trùng lặp.
* **Race condition:** Việc tạo hẹn hoặc đặt cọc đồng thời sẽ không gây ra tình trạng trùng slot hoặc nhân đôi giao dịch.
* **SổCái:** Mọi BútToánĐảoNgược phải giữ nguyên tổng số dư của hệ thống; phí dịch vụ phải được tách dòng riêng.

## 8) Mô hình dữ liệu tham chiếu

* `NguoiDung: (NguoiDungID, TenDayDu, Email, MatKhauHash, TrangThai, VaiTroHoatDongID, TrangThaiXacMinh, NgaySinh, DiaChi, SoCCCD, NgayCapCCCD, NoiCapCCCD)`
* `VaiTro: (VaiTroID, TenVaiTro)`
* `Quyen: (QuyenID, MaQuyen)`
* `NguoiDung_VaiTro: (Bảng trung gian: NguoiDungID, VaiTroID)`
* `VaiTro_Quyen: (Bảng trung gian: VaiTroID, QuyenID)`
* `DuAn: (DuAnID, TenDuAn, ChuDuAnID, TrangThai)`
* `TinDang: (TinDangID, DuAnID, TieuDe, Gia, DienTich, TrangThai)`
* `Phong: (PhongID, TinDangID, TenPhong, TrangThai, Gia)`
* `CuocHen: (CuocHenID, PhongID, KhachHangID, NhanVienBanHangID, ThoiGianHen, TrangThai, SoLanDoiLich)`
* `Vi: (ViID, NguoiDungID, SoDu)`
* `GiaoDich: (GiaoDichID, ViID, SoTien, Loai, TrangThai, KhoaDinhDanh)`
* `ButToanSoCai: (Bảng sổ cái: ButToanID, GiaoDichID, ViID, SoTien, LoaiButToan)`
* `NhatKyHeThong: (NhatKyID, NguoiDungID, HanhDong, DoiTuong, DoiTuongID, GiaTriTruoc, GiaTriSau, DiaChiIP)`

## 9) Checklist kiểm thử

* **Unit test:** Logic tính phí hủy theo thời điểm; KhóaĐịnhDanh; giới hạn truy cập (rate limit); tính toàn vẹn của SổCái; RBAC guard.
* **Integration:** Cổng thanh toán (sandbox), dịch vụ email/push, trình tạo PDF từ mẫu.
* **E2E:** Toàn bộ hành trình của KhachHang: tìm → hẹn → cọc → ký → bàn giao, bao gồm cả các nhánh rẽ như hủy hẹn hoặc không đến.

## 10) Khác biệt so với bản 1.0

* **Loại bỏ:** Tác nhân "Kế toán" đã được loại bỏ để đơn giản hóa luồng vai trò.
* **Chuẩn hóa thuật ngữ:** Toàn bộ các khái niệm và trạng thái cốt lõi trong hệ thống đã được viết hoa và Việt hóa để đảm bảo tính nhất quán (ví dụ: Listing → TinĐăng, Unit → Phòng, Reserved → GiữChỗ).
* **Tái cấu trúc:**
    * Mô hình RBAC được hoàn chỉnh hơn.
    * Mô hình tài chính được làm rõ với khái niệm SổCái và KhóaĐịnhDanh để tăng cường an toàn.
    * Bổ sung thực thể Phòng để quản lý chi tiết hơn các đơn vị cho thuê.
    * Bổ sung NhậtKýHệThống để ghi lại toàn bộ hành động quan trọng.

## 11) Phụ lục Quy tắc chung

* **Thông báo chuẩn:** Đa kênh (in-app, email, push), có deep-link để điều hướng nhanh.
* **Ghi NhậtKýHệThống chuẩn:** Mọi hành động thay đổi trạng thái, giao dịch, vai trò, hay mẫu cấu hình đều được ghi lại chi tiết: người thực hiện, hành động, đối tượng, dữ liệu trước/sau, IP, User Agent.
* **Bảo mật:** CSRF cho các form thay đổi trạng thái; rate limit cho các endpoint nhạy cảm; KhóaĐịnhDanh cho các hành động tạo mới dữ liệu quan trọng.
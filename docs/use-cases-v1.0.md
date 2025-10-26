# Đặc tả Use Case Hệ thống Cho thuê Phòng trọ

[cite_start]Báo cáo này trình bày bản phân tích chi tiết và đặc tả đầy đủ cho toàn bộ các trường hợp sử dụng (use case) của hệ thống cho thuê phòng trọ. [cite: 2] [cite_start]Dựa trên yêu cầu ban đầu, logic hệ thống đã được đánh giá và tối ưu hóa để phản ánh mô hình kinh doanh **thị trường trung gian được quản lý (managed marketplace)**. [cite: 3] [cite_start]Mô hình này không chỉ kết nối người thuê và chủ trọ mà còn chủ động tham gia vào quá trình giao dịch thông qua đội ngũ vận hành, nhằm đảm bảo chất lượng, an toàn và nâng cao trải nghiệm cho tất cả các bên. [cite: 4]

---

## 1. Tổng quan Hệ thống và các Tác nhân

### 1.1. Bối cảnh và Mục tiêu Hệ thống
[cite_start]Mục tiêu cốt lõi của hệ thống là hiện đại hóa và hợp lý hóa quy trình cho thuê nhà trọ, phòng trọ bằng cách tạo ra một hệ sinh thái có cấu trúc, minh bạch và đáng tin cậy. [cite: 8] [cite_start]Nền tảng này không hoạt động như một trang rao vặt thụ động, mà đóng vai trò là một cầu nối trung gian được quản lý, kết nối hiệu quả giữa ba nhóm đối tượng chính: Khách hàng, Chủ dự án, và đội ngũ vận hành nội bộ. [cite: 9] [cite_start]Sự tham gia của đội ngũ vận hành là yếu tố then chốt, giúp xác thực thông tin, điều phối lịch hẹn và hỗ trợ giao dịch, từ đó xây dựng niềm tin và đảm bảo chất lượng dịch vụ. [cite: 10] [cite_start]Phạm vi kinh doanh của hệ thống được giới hạn nghiêm ngặt trong lĩnh vực "cho thuê trọ". [cite: 11]

### 1.2. Định nghĩa chi tiết các Tác nhân (Actors)
* [cite_start]**Khách hàng (Customer):** Là người dùng cuối có nhu cầu tìm kiếm và thuê một nơi ở phù hợp. [cite: 14] [cite_start]Mục tiêu của họ là tìm kiếm một cách an toàn, tiện lợi và được hỗ trợ chuyên nghiệp, giảm thiểu rủi ro. [cite: 15]
* [cite_start]**Nhân viên Bán hàng (Sales Staff):** Là đại diện tuyến đầu của công ty, chịu trách nhiệm trực tiếp trong việc hỗ trợ và dẫn dắt khách hàng. [cite: 16] [cite_start]Mục tiêu của họ là chuyển đổi các cuộc hẹn thành hợp đồng thuê thành công để mang lại doanh thu. [cite: 17]
* [cite_start]**Chủ dự án (Project Owner):** Là cá nhân hoặc tổ chức sở hữu bất động sản cho thuê. [cite: 18] [cite_start]Mục tiêu của họ là tối đa hóa tỷ lệ lấp đầy và doanh thu bằng cách ủy thác việc quảng bá và sàng lọc khách ban đầu cho một đội ngũ chuyên nghiệp. [cite: 19]
* [cite_start]**Nhân viên Điều hành (Operator):** Là quản trị viên nội bộ, chịu trách nhiệm duy trì tính toàn vẹn và chất lượng của nền tảng. [cite: 20] [cite_start]Mục tiêu của họ là đảm bảo mọi tin đăng đều được xác thực và tối ưu hóa việc phân bổ nguồn lực bán hàng. [cite: 21]
* [cite_start]**Quản trị viên Hệ thống (System Administrator):** Là người dùng kỹ thuật cấp cao nhất, chịu trách nhiệm về sức khỏe, an ninh và cấu hình tổng thể của nền tảng. [cite: 22] [cite_start]Mục tiêu của họ là đảm bảo hệ thống hoạt động ổn định và an toàn. [cite: 23]

---

## 2. Bảng Tóm tắt Use Case

| ID Use Case | Tên Use Case | Tác nhân chính | Mô tả ngắn gọn |
| :--- | :--- | :--- | :--- |
| **Chung** |
| UC-GEN-01 | Đăng nhập vào Hệ thống | Tất cả Tác nhân | [cite_start]Xác thực thông tin đăng nhập và cấp quyền truy cập vào hệ thống. [cite: 28] |
| UC-GEN-02 | Đăng ký Tài khoản Mới | Khách hàng, Chủ dự án | [cite_start]Cho phép người dùng mới tạo tài khoản trên hệ thống. [cite: 28] |
| UC-GEN-03 | Chuyển đổi Chế độ Người dùng | Khách hàng, Chủ dự án | [cite_start]Cho phép người dùng có nhiều vai trò chuyển đổi giao diện và chức năng. [cite: 28] |
| UC-GEN-04 | Xem Danh sách Cuộc hẹn | Tất cả Tác nhân | [cite_start]Hiển thị danh sách các cuộc hẹn liên quan đến tác nhân. [cite: 28] |
| UC-GEN-05 | Trung tâm Thông báo | Tất cả người dùng | [cite_start]Người dùng xem/đánh dấu/điều hướng từ các thông báo, admin cấu hình mẫu thông báo. [cite: 665] |
| **Khách hàng** |
| UC-CUST-01 | Tìm kiếm Phòng trọ | Khách hàng | [cite_start]Tìm kiếm và lọc các tin đăng cho thuê theo nhiều tiêu chí. [cite: 28] |
| UC-CUST-02 | Quản lý Danh sách Yêu thích | Khách hàng | [cite_start]Lưu và quản lý các tin đăng quan tâm để xem lại sau. [cite: 28] |
| UC-CUST-03 | Hẹn lịch Xem phòng | Khách hàng | [cite_start]Gửi yêu cầu đặt lịch hẹn để đi xem một phòng trọ cụ thể. [cite: 28] |
| UC-CUST-04 | Thực hiện Đặt cọc | Khách hàng | [cite_start]Sử dụng ví điện tử để đặt cọc giữ chỗ cho một phòng trọ. [cite: 28] |
| UC-CUST-05 | Hủy Giao dịch | Khách hàng | [cite_start]Yêu cầu hủy một giao dịch đặt cọc đã thực hiện. [cite: 28] |
| UC-CUST-06 | Quản lý Ví điện tử | Khách hàng | [cite_start]Nạp tiền, xem lịch sử giao dịch trong ví cá nhân. [cite: 28] |
| UC-CUST-07 | Nhắn tin | Khách hàng | [cite_start]Trao đổi thông tin với Nhân viên Bán hàng hoặc Chủ dự án. [cite: 28] |
| **Nhân viên Bán hàng** |
| UC-SALE-01 | Đăng ký Lịch làm việc | Nhân viên Bán hàng | [cite_start]Đăng ký các khung giờ sẵn sàng làm việc để hệ thống xếp lịch hẹn. [cite: 28] |
| UC-SALE-02 | Xem Chi tiết Cuộc hẹn | Nhân viên Bán hàng | [cite_start]Xem thông tin chi tiết về một cuộc hẹn được giao. [cite: 28] |
| UC-SALE-03 | Quản lý Cuộc hẹn | Nhân viên Bán hàng | [cite_start]Xác nhận, thay đổi lịch hoặc hủy các cuộc hẹn được phân công. [cite: 28] |
| UC-SALE-04 | Xác nhận Cọc của Khách hàng | Nhân viên Bán hàng | [cite_start]Xác nhận khoản tiền đặt cọc từ khách hàng đã thành công. [cite: 28] |
| UC-SALE-05 | Báo cáo Kết quả Cuộc hẹn | Nhân viên Bán hàng | [cite_start]Cập nhật kết quả và ghi chú sau khi hoàn thành một cuộc hẹn. [cite: 28] |
| UC-SALE-06 | Xem Báo cáo Thu nhập | Nhân viên Bán hàng | [cite_start]Theo dõi thu nhập và hoa hồng cá nhân. [cite: 28] |
| UC-SALE-07 | Nhắn tin | Nhân viên Bán hàng | [cite_start]Trao đổi thông tin với Khách hàng. [cite: 28] |
| **Chủ dự án** |
| UC-PROJ-01 | Đăng tin Cho thuê | Chủ dự án | [cite_start]Tạo và gửi một tin đăng cho thuê mới để chờ duyệt. [cite: 28] |
| UC-PROJ-02 | Xác nhận Cuộc hẹn | Chủ dự án | [cite_start]Phê duyệt một yêu cầu hẹn xem phòng (đối với các trường hợp đặc biệt). [cite: 28] |
| UC-PROJ-03 | Xem Báo cáo Kinh doanh | Chủ dự án | [cite_start]Theo dõi hiệu suất của các tin đăng (lượt xem, lịch hẹn). [cite: 28] |
| UC-PROJ-04 | Báo cáo Hợp đồng Cho thuê | Chủ dự án | [cite_start]Báo cáo về một hợp đồng đã được ký kết thành công. [cite: 28] |
| UC-PROJ-05 | Nhắn tin | Chủ dự án | [cite_start]Trao đổi thông tin với Khách hàng. [cite: 28] |
| **Nhân viên Điều hành** |
| UC-OPER-01 | Duyệt Tin đăng | Nhân viên Điều hành | [cite_start]Xem xét và phê duyệt hoặc từ chối các tin đăng mới từ Chủ dự án. [cite: 28] |
| UC-OPER-02 | Quản lý Danh sách Dự án | Nhân viên Điều hành | [cite_start]Quản lý thông tin vận hành các dự án cho thuê trên toàn hệ thống. [cite: 28] |
| UC-OPER-03 | Quản lý Lịch làm việc NVBH | Nhân viên Điều hành | [cite_start]Giám sát và điều phối lịch làm việc của đội ngũ Nhân viên Bán hàng. [cite: 28] |
| UC-OPER-04 | Quản lý Danh sách Nhân viên | Nhân viên Điều hành | [cite_start]Quản lý thông tin của các nhân viên trong hệ thống. [cite: 28] |
| UC-OPER-05 | Tạo Tài khoản Nhân viên | Nhân viên Điều hành | [cite_start]Tạo tài khoản mới cho Nhân viên Bán hàng hoặc Nhân viên Điều hành. [cite: 28] |
| **Quản trị viên Hệ thống** |
| UC-ADMIN-01 | Quản lý Tài khoản Người dùng | Quản trị viên Hệ thống | [cite_start]Quản lý tất cả tài khoản người dùng trên hệ thống. [cite: 28] |
| UC-ADMIN-02 | Quản lý Danh sách Dự án | Quản trị viên Hệ thống | [cite_start]Quản lý tổng thể (tạo, xóa, cấu hình) danh sách các dự án. [cite: 28] |
| UC-ADMIN-03 | Quản lý Danh sách Khu vực | Quản trị viên Hệ thống | [cite_start]Quản lý các đơn vị hành chính cho bộ lọc tìm kiếm. [cite: 28] |
| UC-ADMIN-04 | Xem Báo cáo Thu nhập Toàn hệ thống | Quản trị viên Hệ thống | [cite_start]Xem báo cáo tài chính tổng hợp của toàn bộ nền tảng. [cite: 28] |
| UC-ADMIN-05 | Quản lý Chính sách | Quản trị viên Hệ thống | [cite_start]Cập nhật các điều khoản dịch vụ, chính sách bảo mật. [cite: 28] |
| UC-ADMIN-06 | Quản lý Biểu mẫu Hợp đồng | Quản trị viên Hệ thống | [cite_start]Tải lên và quản lý các mẫu hợp đồng cho thuê tiêu chuẩn. [cite: 28] |
| UC-ADMIN-06A | Quản lý Mẫu Hợp đồng | Quản trị viên Hệ thống | [cite_start]Cho phép admin upload, preview, version, kích hoạt/archive mẫu hợp đồng. [cite: 623] |
| UC-ADMIN-07 | Xem Sổ cái Giao dịch | Quản trị viên Hệ thống, Kế toán | [cite_start]Cung cấp chế độ xem, lọc, tra cứu và xuất file của sổ cái giao dịch. [cite: 644, 645] |
| UC-ADMIN-08 | Quản lý Quyền và Phân quyền | Quản trị viên Hệ thống | [cite_start]Quản lý role, permission và mapping để thực thi RBAC. [cite: 685] |
| UC-ADMIN-09 | Xem Audit Log | Quản trị viên Hệ thống, Security Officer | [cite_start]Cho phép tra cứu lịch sử hành động quan trọng để phục vụ điều tra/kiểm toán. [cite: 705] |

---

## 3. Đặc tả Chi tiết Use Case

### 3.1 Use Case Chung (UC-GEN)

#### **UC-GEN-01: Đăng nhập vào Hệ thống**
* [cite_start]**Tác nhân:** Tất cả Tác nhân [cite: 34]
* [cite_start]**Mô tả:** Cho phép người dùng đã có tài khoản xác thực danh tính và truy cập vào các chức năng của hệ thống tương ứng với vai trò của họ. [cite: 35]
* [cite_start]**Tiền điều kiện:** Người dùng đã có một tài khoản hợp lệ và đang ở trang đăng nhập. [cite: 37, 38]
* [cite_start]**Hậu điều kiện:** Nếu thành công, hệ thống tạo một phiên làm việc và chuyển hướng người dùng đến trang tổng quan tương ứng. [cite: 40]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Người dùng truy cập trang đăng nhập. [cite: 42]
    2.  [cite_start]Hệ thống hiển thị biểu mẫu đăng nhập (Tên đăng nhập, Mật khẩu). [cite: 43]
    3.  [cite_start]Người dùng nhập Tên đăng nhập và Mật khẩu. [cite: 44]
    4.  [cite_start]Người dùng nhấn nút "Đăng nhập". [cite: 45]
    5.  [cite_start]Hệ thống xác thực thông tin. [cite: 46] [cite_start]Nếu hợp lệ, hệ thống tạo phiên làm việc và chuyển hướng người dùng. [cite: 47]
* **Luồng Ngoại lệ:**
    * **5a. [cite_start]Tên đăng nhập hoặc mật khẩu không chính xác:** Hệ thống hiển thị thông báo lỗi. [cite: 49]
    * **5b. [cite_start]Tài khoản bị khóa:** Hệ thống hiển thị thông báo tài khoản đã bị khóa. [cite: 51]

#### **UC-GEN-02: Đăng ký Tài khoản Mới**
* [cite_start]**Tác nhân:** Khách hàng, Chủ dự án [cite: 55]
* [cite_start]**Mô tả:** Cho phép người dùng mới tạo tài khoản bằng cách cung cấp các thông tin cần thiết. [cite: 56]
* [cite_start]**Tiền điều kiện:** Người dùng chưa có tài khoản trên hệ thống. [cite: 58]
* [cite_start]**Hậu điều kiện:** Một tài khoản mới được tạo với trạng thái "Chưa kích hoạt" và hệ thống gửi email/SMS xác thực. [cite: 60, 61]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Người dùng chọn "Đăng ký". [cite: 63]
    2.  [cite_start]Hệ thống hiển thị biểu mẫu đăng ký. [cite: 64]
    3.  [cite_start]Người dùng điền đầy đủ thông tin và nhấn "Đăng ký". [cite: 65, 66]
    4.  [cite_start]Hệ thống kiểm tra tính hợp lệ và tạo tài khoản mới. [cite: 67, 68]
    5.  [cite_start]Hệ thống gửi email/SMS xác thực và hiển thị thông báo hướng dẫn. [cite: 69, 70]
* **Luồng Ngoại lệ:**
    * **5a. [cite_start]Email hoặc số điện thoại đã tồn tại:** Hệ thống báo lỗi. [cite: 72]
    * **5b. [cite_start]Mật khẩu không khớp hoặc không đủ mạnh:** Hệ thống báo lỗi tương ứng. [cite: 73]

#### **UC-GEN-03: Chuyển đổi Chế độ Người dùng**
* [cite_start]**Tác nhân:** Người dùng có nhiều vai trò [cite: 77]
* [cite_start]**Mô tả:** Cho phép người dùng có nhiều vai trò chuyển đổi giữa các giao diện và bộ chức năng khác nhau mà không cần đăng xuất. [cite: 78]
* [cite_start]**Tiền điều kiện:** Người dùng đã đăng nhập và có ít nhất hai vai trò. [cite: 80, 81]
* [cite_start]**Hậu điều kiện:** Giao diện người dùng được làm mới để hiển thị chức năng tương ứng với vai trò mới. [cite: 83]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Người dùng nhấp vào menu tài khoản cá nhân. [cite: 85]
    2.  [cite_start]Hệ thống hiển thị tùy chọn "Chuyển đổi vai trò". [cite: 86]
    3.  [cite_start]Người dùng chọn vai trò muốn chuyển sang. [cite: 87]
    4.  [cite_start]Hệ thống cập nhật vai trò và tải lại giao diện. [cite: 88, 89]

#### **UC-GEN-04: Xem Danh sách Cuộc hẹn**
* [cite_start]**Tác nhân:** Khách hàng, Nhân viên Bán hàng, Chủ dự án, Nhân viên Điều hành [cite: 93]
* [cite_start]**Mô tả:** Cung cấp giao diện để người dùng xem danh sách các cuộc hẹn liên quan đến họ. [cite: 94]
* [cite_start]**Tiền điều kiện:** Người dùng đã đăng nhập vào hệ thống. [cite: 97]
* [cite_start]**Hậu điều kiện:** Danh sách các cuộc hẹn phù hợp với vai trò được hiển thị. [cite: 99]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Người dùng điều hướng đến mục "Quản lý cuộc hẹn". [cite: 101]
    2.  [cite_start]Hệ thống truy vấn và hiển thị danh sách các cuộc hẹn dựa trên vai trò của người dùng: [cite: 102]
        * [cite_start]**Khách hàng:** Các cuộc hẹn do chính họ tạo. [cite: 103]
        * [cite_start]**Nhân viên Bán hàng:** Các cuộc hẹn được phân công cho họ. [cite: 104]
        * [cite_start]**Chủ dự án:** Các cuộc hẹn liên quan đến dự án của họ. [cite: 105]
        * [cite_start]**Nhân viên Điều hành:** Tất cả các cuộc hẹn trong hệ thống. [cite: 106]
    3.  [cite_start]Hệ thống cung cấp công cụ lọc và sắp xếp. [cite: 108]

#### **UC-GEN-05: Trung tâm Thông báo (Notification Center)**
* [cite_start]**Tác nhân:** Tất cả người dùng [cite: 665]
* **Mô tả:** Người dùng xem/đánh dấu/điều hướng từ các thông báo. [cite_start]Admin có thể cấu hình mẫu thông báo. [cite: 665]
* [cite_start]**Tiền điều kiện:** Người dùng đã đăng nhập. [cite: 666] [cite_start]Hệ thống có các bản ghi thông báo. [cite: 667]
* [cite_start]**Hậu điều kiện:** Người dùng có thể xem lịch sử, đánh dấu đọc/chưa đọc, và điều hướng đến tài nguyên liên quan. [cite: 667]
* **Luồng Sự kiện Chính (User view):**
    1.  [cite_start]User mở "Thông báo". [cite: 669]
    2.  [cite_start]Hệ thống hiển thị danh sách thông báo. [cite: 671]
    3.  [cite_start]User click vào một thông báo, hệ thống chuyển hướng và cập nhật trạng thái đã đọc. [cite: 672]
* **Luồng Sự kiện Chính (Admin template):**
    1.  [cite_start]Admin truy cập "Cấu hình Thông báo". [cite: 675]
    2.  [cite_start]Admin tạo/chỉnh sửa mẫu thông báo. [cite: 676]
* **Luồng Ngoại lệ:**
    * **2a. [cite_start]Nếu thông báo gửi lỗi:** Hiển thị icon lỗi và logic thử lại. [cite: 679]
    * **4a. [cite_start]Nếu tài nguyên liên quan không tồn tại:** Hiển thị thông báo thân thiện. [cite: 680]

### 3.2 Use Case của Khách hàng (UC-CUST)

#### **UC-CUST-01: Tìm kiếm Phòng trọ**
* [cite_start]**Tác nhân:** Khách hàng [cite: 113]
* [cite_start]**Mô tả:** Cho phép Khách hàng tìm kiếm các tin đăng cho thuê dựa trên nhiều tiêu chí. [cite: 114]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Khách hàng truy cập trang tìm kiếm, nhập từ khóa và/hoặc chọn các bộ lọc. [cite: 120, 122]
    2.  [cite_start]Khách hàng nhấn "Tìm kiếm". [cite: 123]
    3.  [cite_start]Hệ thống truy vấn và trả về các tin đăng phù hợp. [cite: 124, 125]
* **Luồng Rẽ nhánh:**
    * **6a. [cite_start]Không tìm thấy kết quả:** Hệ thống hiển thị thông báo. [cite: 127]

#### **UC-CUST-02: Quản lý Danh sách Yêu thích**
* [cite_start]**Tác nhân:** Khách hàng [cite: 131]
* [cite_start]**Mô tả:** Cho phép Khách hàng lưu lại các tin đăng quan tâm vào một danh sách cá nhân. [cite: 132]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Khách hàng đang xem một tin đăng và nhấn vào biểu tượng "Yêu thích". [cite: 138, 139]
    2.  [cite_start]Hệ thống lưu liên kết và cập nhật giao diện. [cite: 140, 141]
* **Luồng Ngoại lệ:**
    * **2a. [cite_start]Khách hàng chưa đăng nhập:** Hệ thống hiển thị pop-up yêu cầu đăng nhập. [cite: 143]

#### **UC-CUST-03: Hẹn lịch Xem phòng**
* [cite_start]**Tác nhân:** Khách hàng [cite: 147]
* [cite_start]**Mô tả:** Cho phép Khách hàng gửi yêu cầu đặt lịch hẹn để đến xem trực tiếp một phòng trọ. [cite: 148]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Khách hàng nhấn nút "Hẹn lịch xem phòng". [cite: 156]
    2.  [cite_start]Hệ thống hiển thị lịch biểu các khung giờ còn trống. [cite: 157]
    3.  [cite_start]Khách hàng chọn ngày giờ và nhấn "Xác nhận Lịch hẹn". [cite: 158, 159]
    4.  [cite_start]Hệ thống tạo bản ghi cuộc hẹn với trạng thái "Chờ xác nhận". [cite: 160]
* **Luồng Ngoại lệ:**
    * **2a. [cite_start]Không có lịch trống:** Hệ thống hiển thị thông báo. [cite: 163]
    * **4a. [cite_start]Khung giờ vừa được người khác chọn:** Hệ thống báo lỗi. [cite: 164]

#### **UC-CUST-04: Thực hiện Đặt cọc**
* [cite_start]**Tác nhân:** Khách hàng [cite: 168]
* [cite_start]**Mô tả:** Cho phép Khách hàng sử dụng ví điện tử để đặt cọc giữ chỗ. [cite: 169]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Khách hàng nhấn nút "Đặt cọc". [cite: 179]
    2.  [cite_start]Hệ thống hiển thị màn hình xác nhận. [cite: 180]
    3.  [cite_start]Khách hàng nhấn "Xác nhận Đặt cọc". [cite: 181]
    4.  [cite_start]Hệ thống thực hiện giao dịch, trừ tiền và cập nhật trạng thái phòng. [cite: 182, 183]
* **Luồng Ngoại lệ:**
    * **1a. [cite_start]Số dư không đủ:** Nút "Đặt cọc" bị vô hiệu hóa và hiển thị thông báo. [cite: 186]

#### **UC-CUST-05: Hủy Giao dịch**
* [cite_start]**Tác nhân:** Khách hàng [cite: 190]
* [cite_start]**Mô tả:** Cho phép Khách hàng yêu cầu hủy một giao dịch đặt cọc. [cite: 191]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Khách hàng vào "Lịch sử giao dịch" và chọn giao dịch muốn hủy. [cite: 199, 200]
    2.  [cite_start]Khách hàng nhấn "Hủy giao dịch". [cite: 201]
    3.  [cite_start]Hệ thống hiển thị cảnh báo và yêu cầu xác nhận. [cite: 202, 203]
    4.  [cite_start]Hệ thống cập nhật trạng thái giao dịch thành "Yêu cầu hủy". [cite: 204]

#### **UC-CUST-06: Quản lý Ví điện tử**
* [cite_start]**Tác nhân:** Khách hàng [cite: 208]
* [cite_start]**Mô tả:** Cho phép Khách hàng nạp tiền, xem số dư và lịch sử giao dịch. [cite: 209]
* **Luồng Sự kiện Chính (Xem lịch sử):**
    1.  [cite_start]Khách hàng truy cập "Ví của tôi". [cite: 216]
    2.  [cite_start]Hệ thống hiển thị số dư và danh sách giao dịch. [cite: 217]
* **Luồng Rẽ nhánh (Nạp tiền):**
    1.  [cite_start]Khách hàng chọn "Nạp tiền" và thực hiện theo hướng dẫn. [cite: 219, 220, 221]
    2.  [cite_start]Sau khi thành công, hệ thống cập nhật số dư ví. [cite: 222]

#### **UC-CUST-07: Nhắn tin**
* [cite_start]**Tác nhân:** Khách hàng [cite: 226]
* [cite_start]**Mô tả:** Cho phép Khách hàng trao đổi thông tin với các bên liên quan. [cite: 227]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Khách hàng nhấn vào biểu tượng "Nhắn tin". [cite: 233]
    2.  [cite_start]Hệ thống mở giao diện trò chuyện. [cite: 234]
    3.  [cite_start]Khách hàng nhập tin nhắn và nhấn "Gửi". [cite: 235]
    4.  [cite_start]Hệ thống lưu tin nhắn và gửi thông báo đến người nhận. [cite: 236]

### 3.3 Use Case của Nhân viên Bán hàng (UC-SALE)

#### **UC-SALE-01: Đăng ký Lịch làm việc**
* [cite_start]**Tác nhân:** Nhân viên Bán hàng [cite: 241]
* [cite_start]**Mô tả:** Cho phép Nhân viên Bán hàng đăng ký các khung giờ làm việc. [cite: 242]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVBH truy cập "Lịch làm việc", chọn các ngày và ca làm việc. [cite: 249, 251]
    2.  [cite_start]NVBH nhấn "Lưu Lịch". [cite: 252]
* **Luồng Ngoại lệ:**
    * **4a. [cite_start]Cố gắng xóa khung giờ đã có lịch hẹn:** Hệ thống báo lỗi. [cite: 255]

#### **UC-SALE-02: Xem Chi tiết Cuộc hẹn**
* [cite_start]**Tác nhân:** Nhân viên Bán hàng [cite: 259]
* [cite_start]**Mô tả:** Cho phép xem thông tin chi tiết về một cuộc hẹn được giao. [cite: 260]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVBH chọn một cuộc hẹn từ danh sách. [cite: 267]
    2.  [cite_start]Hệ thống hiển thị trang chi tiết (thông tin khách hàng, phòng trọ, thời gian, trạng thái). [cite: 268]

#### **UC-SALE-03: Quản lý Cuộc hẹn**
* [cite_start]**Tác nhân:** Nhân viên Bán hàng [cite: 277]
* [cite_start]**Mô tả:** Cho phép NVBH xác nhận, thay đổi lịch hoặc hủy cuộc hẹn. [cite: 278]
* **Luồng Sự kiện Chính (Xác nhận):**
    1.  [cite_start]NVBH nhấn nút "Xác nhận". [cite: 286]
    2.  [cite_start]Hệ thống cập nhật trạng thái và gửi thông báo cho Khách hàng. [cite: 287, 288]
* **Luồng Rẽ nhánh (Hủy hẹn):**
    1.  [cite_start]NVBH nhấn "Hủy hẹn" và nhập lý do. [cite: 290, 291]
    2.  [cite_start]Hệ thống cập nhật trạng thái và thông báo cho Khách hàng. [cite: 292]

#### **UC-SALE-04: Xác nhận Cọc của Khách hàng**
* [cite_start]**Tác nhân:** Nhân viên Bán hàng [cite: 296]
* [cite_start]**Mô tả:** NVBH xác nhận giao dịch đặt cọc của khách hàng để hoàn tất quy trình. [cite: 297]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVBH vào "Quản lý giao dịch", chọn giao dịch cần xác nhận. [cite: 306]
    2.  [cite_start]NVBH kiểm tra và nhấn "Xác nhận giao dịch". [cite: 307, 308]
    3.  [cite_start]Hệ thống cập nhật trạng thái giao dịch và ghi nhận hoa hồng. [cite: 309]

#### **UC-SALE-05: Báo cáo Kết quả Cuộc hẹn**
* [cite_start]**Tác nhân:** Nhân viên Bán hàng [cite: 313]
* [cite_start]**Mô tả:** Sau cuộc hẹn, NVBH cập nhật kết quả và ghi chú. [cite: 314]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVBH chọn cuộc hẹn đã diễn ra. [cite: 321]
    2.  [cite_start]NVBH chọn kết quả, nhập ghi chú và nhấn "Lưu báo cáo". [cite: 323, 324, 325]

#### **UC-SALE-06: Xem Báo cáo Thu nhập**
* [cite_start]**Tác nhân:** Nhân viên Bán hàng [cite: 330]
* [cite_start]**Mô tả:** Cung cấp trang tổng quan để NVBH theo dõi thu nhập và hoa hồng. [cite: 331]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVBH truy cập "Báo cáo thu nhập". [cite: 337]
    2.  [cite_start]Hệ thống hiển thị biểu đồ, bảng thống kê và chi tiết các khoản hoa hồng. [cite: 338, 339]

#### **UC-SALE-07: Nhắn tin**
* [cite_start]**Tác nhân:** Nhân viên Bán hàng [cite: 343]
* [cite_start]**Mô tả:** Cho phép NVBH trao đổi thông tin với Khách hàng. [cite: 344]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Từ trang chi tiết cuộc hẹn, NVBH nhấn "Nhắn tin cho Khách hàng". [cite: 350]
    2.  [cite_start]Hệ thống mở giao diện trò chuyện. [cite: 351]
    3.  [cite_start]NVBH nhập tin nhắn và gửi. [cite: 352]

### 3.4 Use Case của Chủ dự án (UC-PROJ)

#### **UC-PROJ-01: Đăng tin Cho thuê**
* [cite_start]**Tác nhân:** Chủ dự án [cite: 358]
* [cite_start]**Mô tả:** Cung cấp quy trình để Chủ dự án tạo tin đăng mới và gửi để chờ duyệt. [cite: 359]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Chủ dự án chọn "Đăng tin mới". [cite: 366]
    2.  [cite_start]Hệ thống hiển thị biểu mẫu đa bước để nhập thông tin và tải ảnh. [cite: 367, 368, 369, 370]
    3.  [cite_start]Chủ dự án xem lại và "Gửi duyệt". [cite: 371, 372]
    4.  [cite_start]Hệ thống lưu tin đăng với trạng thái "Chờ duyệt". [cite: 373]
* **Luồng Ngoại lệ:**
    * **7a. [cite_start]Thiếu thông tin bắt buộc:** Hệ thống báo lỗi. [cite: 375]
    * **5a. [cite_start]Tải lên tệp không hợp lệ:** Hệ thống báo lỗi. [cite: 376]

#### **UC-PROJ-02: Xác nhận Cuộc hẹn**
* [cite_start]**Tác nhân:** Chủ dự án [cite: 380]
* [cite_start]**Mô tả:** Cho phép Chủ dự án phê duyệt yêu cầu hẹn xem phòng (áp dụng cho các dự án đặc biệt). [cite: 381, 382]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Hệ thống gửi thông báo cho Chủ dự án. [cite: 390]
    2.  [cite_start]Chủ dự án xem xét và nhấn "Phê duyệt". [cite: 391, 392]
    3.  [cite_start]Hệ thống cập nhật trạng thái và gửi thông báo cho NVBH. [cite: 393]

#### **UC-PROJ-03: Xem Báo cáo Kinh doanh**
* [cite_start]**Tác nhân:** Chủ dự án [cite: 399]
* [cite_start]**Mô tả:** Cung cấp báo cáo về hiệu suất của các tin đăng. [cite: 400]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Chủ dự án truy cập "Báo cáo". [cite: 406]
    2.  [cite_start]Hệ thống hiển thị các chỉ số: tổng lượt xem, yêu thích, cuộc hẹn, tỷ lệ lấp đầy. [cite: 407, 408, 409, 410, 411]

#### **UC-PROJ-04: Báo cáo Hợp đồng Cho thuê**
* [cite_start]**Tác nhân:** Chủ dự án [cite: 416]
* [cite_start]**Mô tả:** Sau khi ký hợp đồng, Chủ dự án báo cáo thông tin này lên hệ thống. [cite: 417]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Chủ dự án chọn một phòng đã cọc và chọn "Báo cáo đã ký hợp đồng". [cite: 425, 426]
    2.  [cite_start]Chủ dự án nhập thông tin hợp đồng và xác nhận. [cite: 427, 428]
    3.  [cite_start]Hệ thống cập nhật trạng thái phòng thành "Đã cho thuê". [cite: 429]

#### **UC-PROJ-05: Nhắn tin**
* [cite_start]**Tác nhân:** Chủ dự án [cite: 433]
* [cite_start]**Mô tả:** Cho phép Chủ dự án trao đổi với Khách hàng hoặc NVBH. [cite: 434]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Chủ dự án nhập tin nhắn từ một cuộc hội thoại có sẵn. [cite: 440]
    2.  [cite_start]Chủ dự án nhấn "Gửi". [cite: 441]

### 3.5 Use Case của Nhân viên Điều hành (UC-OPER)

#### **UC-OPER-01: Duyệt Tin đăng**
* [cite_start]**Tác nhân:** Nhân viên Điều hành [cite: 447]
* [cite_start]**Mô tả:** NVĐH xem xét các tin đăng chờ duyệt, quyết định phê duyệt hoặc từ chối. [cite: 448]
* **Luồng Sự kiện Chính (Phê duyệt):**
    1.  [cite_start]NVĐH truy cập danh sách "Tin đăng chờ duyệt". [cite: 456]
    2.  [cite_start]NVĐH kiểm tra và nhấn "Duyệt". [cite: 459, 460]
    3.  [cite_start]Hệ thống cập nhật trạng thái thành "Đã duyệt". [cite: 461]
* **Luồng Rẽ nhánh (Từ chối):**
    1.  [cite_start]NVĐH nhấn "Từ chối", nhập lý do và xác nhận. [cite: 463, 464, 465]
    2.  [cite_start]Hệ thống cập nhật trạng thái và thông báo cho Chủ dự án. [cite: 466]

#### **UC-OPER-02: Quản lý Danh sách Dự án**
* [cite_start]**Tác nhân:** Nhân viên Điều hành [cite: 470]
* [cite_start]**Mô tả:** Quản lý các khía cạnh vận hành của dự án như kích hoạt/vô hiệu hóa tạm thời. [cite: 471, 472]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVĐH truy cập "Quản lý Dự án". [cite: 478]
    2.  [cite_start]Hệ thống hiển thị danh sách dự án và chỉ số vận hành. [cite: 479]
    3.  [cite_start]NVĐH có thể thực hiện hành động như "Tạm ngưng hiển thị". [cite: 481]

#### **UC-OPER-03: Quản lý Lịch làm việc NVBH**
* [cite_start]**Tác nhân:** Nhân viên Điều hành [cite: 486]
* [cite_start]**Mô tả:** Giám sát và điều phối tổng thể lịch làm việc của đội ngũ NVBH. [cite: 487]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVĐH truy cập "Lịch làm việc tổng thể". [cite: 493]
    2.  [cite_start]Hệ thống hiển thị lịch tổng hợp của tất cả NVBH. [cite: 494]
    3.  [cite_start]NVĐH có thể xem khu vực thiếu nhân lực hoặc gán lại cuộc hẹn. [cite: 495, 496]

#### **UC-OPER-04: Quản lý Danh sách Nhân viên**
* [cite_start]**Tác nhân:** Nhân viên Điều hành [cite: 500]
* [cite_start]**Mô tả:** Quản lý thông tin của các nhân viên nội bộ. [cite: 501]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVĐH truy cập "Quản lý Nhân viên". [cite: 507]
    2.  [cite_start]Hệ thống hiển thị danh sách, NVĐH có thể chọn để xem/chỉnh sửa thông tin. [cite: 508, 509]

#### **UC-OPER-05: Tạo Tài khoản Nhân viên**
* [cite_start]**Tác nhân:** Nhân viên Điều hành [cite: 514]
* [cite_start]**Mô tả:** Tạo tài khoản mới cho nhân sự nội bộ. [cite: 515]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]NVĐH chọn "Tạo tài khoản mới". [cite: 521]
    2.  [cite_start]Hệ thống hiển thị biểu mẫu, NVĐH điền thông tin và nhấn "Tạo". [cite: 522, 523]
    3.  [cite_start]Hệ thống tạo tài khoản và gửi thông tin đăng nhập qua email. [cite: 524]

### 3.6 Use Case của Quản trị viên Hệ thống (UC-ADMIN)

#### **UC-ADMIN-01: Quản lý Tài khoản Người dùng**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống [cite: 529]
* [cite_start]**Mô tả:** Cung cấp công cụ quản trị cấp cao để xem, chỉnh sửa, khóa hoặc xóa bất kỳ tài khoản nào. [cite: 530]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin truy cập "Quản lý Người dùng", tìm và chọn tài khoản. [cite: 536, 538]
    2.  [cite_start]Admin thay đổi thông tin (vai trò, mật khẩu) và lưu lại. [cite: 540, 541]
* **Luồng Rẽ nhánh (Khóa/Mở khóa):**
    * [cite_start]Admin nhấn nút "Khóa tài khoản" hoặc "Mở khóa tài khoản" để cập nhật trạng thái. [cite: 543, 544]

#### **UC-ADMIN-02: Quản lý Danh sách Dự án**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống [cite: 548]
* [cite_start]**Mô tả:** Quản lý ở cấp độ kỹ thuật: tạo mới, định nghĩa thuộc tính cốt lõi, hoặc xóa vĩnh viễn dự án. [cite: 549]
* **Luồng Sự kiện Chính (Tạo mới):**
    1.  [cite_start]Admin chọn "Tạo dự án mới". [cite: 555]
    2.  [cite_start]Admin nhập các thông tin cơ bản và lưu lại. [cite: 556, 557]
* **Luồng Ngoại lệ:**
    * **3a. [cite_start]Cố gắng xóa dự án còn tin đăng hoạt động:** Hệ thống ngăn chặn và báo lỗi. [cite: 560]

#### **UC-ADMIN-03: Quản lý Danh sách Khu vực**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống [cite: 564]
* [cite_start]**Mô tả:** Quản lý các đơn vị hành chính để sử dụng trong bộ lọc tìm kiếm. [cite: 565]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin truy cập "Quản lý Khu vực". [cite: 571]
    2.  [cite_start]Hệ thống hiển thị cây cấu trúc, Admin có thể thêm, sửa, hoặc xóa một đơn vị. [cite: 572, 573]

#### **UC-ADMIN-04: Xem Báo cáo Thu nhập Toàn hệ thống**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống [cite: 578]
* [cite_start]**Mô tả:** Xem báo cáo tài chính tổng hợp của toàn bộ nền tảng. [cite: 579]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin truy cập "Báo cáo tài chính". [cite: 585]
    2.  [cite_start]Hệ thống hiển thị trang tổng quan với các số liệu chính: tổng doanh thu, doanh thu theo nguồn, chi phí, lợi nhuận. [cite: 586, 587, 588, 589, 590]

#### **UC-ADMIN-05: Quản lý Chính sách**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống [cite: 595]
* [cite_start]**Mô tả:** Cập nhật các nội dung văn bản pháp lý như Điều khoản Dịch vụ, Chính sách Bảo mật. [cite: 596]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin truy cập "Quản lý Chính sách", chọn một chính sách để chỉnh sửa. [cite: 602, 604]
    2.  [cite_start]Hệ thống mở trình soạn thảo, Admin cập nhật nội dung và lưu lại. [cite: 605, 606]

#### **UC-ADMIN-06 & UC-ADMIN-06A: Quản lý Biểu mẫu Hợp đồng**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống [cite: 610, 623]
* [cite_start]**Mô tả:** Cho phép admin upload, quản lý phiên bản, kích hoạt/lưu trữ mẫu hợp đồng và sinh hợp đồng từ mẫu đó. [cite: 611, 623]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin truy cập "Quản lý Biểu mẫu Hợp đồng". [cite: 617, 629]
    2.  [cite_start]Admin chọn "Tạo mẫu mới" hoặc "Chỉnh sửa". [cite: 619, 631]
    3.  [cite_start]Admin điền thông tin, tải file hoặc soạn nội dung với các biến (placeholder). [cite: 620, 632]
    4.  [cite_start]Admin lưu lại, hệ thống tạo bản ghi mới với số phiên bản. [cite: 633]
    5.  [cite_start]Khi cần, hệ thống cho phép chọn mẫu và điền các biến để sinh hợp đồng. [cite: 635]
* [cite_start]**Quy tắc Nghiệp vụ:** Không xóa mẫu vật lý, chỉ lưu trữ. [cite: 640] [cite_start]Mỗi lần sửa lớn phải tăng phiên bản. [cite: 641] [cite_start]Hợp đồng đã sinh sẽ giữ bản sao nội dung. [cite: 642]

#### **UC-ADMIN-07: Xem Sổ cái Giao dịch (Transaction Ledger)**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống, Kế toán [cite: 644]
* [cite_start]**Mô tả:** Cung cấp chế độ xem, lọc, tra cứu và xuất sổ cái giao dịch không thể thay đổi để phục vụ kiểm toán. [cite: 644, 645]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin truy cập "Sổ cái giao dịch". [cite: 650]
    2.  [cite_start]Hệ thống hiển thị danh sách và cho phép áp dụng bộ lọc. [cite: 651, 652]
    3.  [cite_start]Nếu cần đảo ngược giao dịch, Admin chọn “Create Reversal” để tạo một dòng bù trừ. [cite: 655]
* [cite_start]**Quy tắc Nghiệp vụ:** Sổ cái chỉ cho phép chèn (INSERT), không cập nhật/xóa. [cite: 661] [cite_start]Mọi sự điều chỉnh phải được ghi bằng một dòng đối ứng. [cite: 662]

#### **UC-ADMIN-08: Quản lý Quyền và Phân quyền (RBAC)**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống [cite: 685]
* [cite_start]**Mô tả:** Quản lý vai trò (role), quyền (permission) và gán chúng cho người dùng. [cite: 685, 686]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin vào menu "Quản lý Vai trò & Quyền". [cite: 690]
    2.  [cite_start]Admin có thể: Tạo/sửa/xóa Vai trò; [cite: 693] [cite_start]Tạo/sửa/xóa Quyền; [cite: 694] [cite_start]Gán Quyền cho Vai trò; [cite: 695] [cite_start]Gán Vai trò cho Người dùng. [cite: 696]
* [cite_start]**Quy tắc Nghiệp vụ:** Mọi thay đổi về vai trò/quyền đều phải được ghi lại trong Audit Log. [cite: 703]

#### **UC-ADMIN-09: Xem Audit Log (Audit Log Viewer)**
* [cite_start]**Tác nhân:** Quản trị viên Hệ thống, Security Officer [cite: 705]
* [cite_start]**Mô tả:** Cho phép tra cứu lịch sử các hành động quan trọng (ai làm gì, khi nào, trên đối tượng nào). [cite: 705]
* **Luồng Sự kiện Chính:**
    1.  [cite_start]Admin truy cập "Audit Log". [cite: 709]
    2.  [cite_start]Hệ thống cho phép lọc theo nhiều tiêu chí. [cite: 710]
    3.  [cite_start]Admin có thể mở một bản ghi để xem chi tiết hoặc export kết quả. [cite: 711, 712]
* [cite_start]**Quy tắc Nghiệp vụ:** Audit log là dạng append-only. [cite: 716] [cite_start]Các hành động tối thiểu phải được ghi lại bao gồm: duyệt/từ chối tin đăng, thay đổi vai trò người dùng, tạo/xóa hợp đồng, chuyển tiền, các sự kiện đăng nhập thất bại.... [cite: 717]

---

## 4. Các Yêu cầu Phi chức năng và Quy tắc Nghiệp vụ Toàn cục

### 4.1. Yêu cầu về Hiệu năng (Performance)
* [cite_start]Thời gian phản hồi cho các truy vấn tìm kiếm cơ bản phải dưới 2 giây. [cite: 721]
* [cite_start]Thời gian tải trang trung bình không được vượt quá 3 giây. [cite: 722]
* [cite_start]Hệ thống phải có khả năng xử lý đồng thời ít nhất 500 người dùng hoạt động. [cite: 723]

### 4.2. Yêu cầu về Bảo mật (Security)
* [cite_start]Tất cả mật khẩu phải được băm (hashed) và muối (salted). [cite: 725]
* [cite_start]Tất cả giao tiếp phải được mã hóa bằng HTTPS. [cite: 726]
* [cite_start]Hệ thống phải được bảo vệ chống lại các lỗ hổng phổ biến như SQL Injection và XSS. [cite: 727]
* [cite_start]Phân quyền truy cập dựa trên vai trò (RBAC) phải được thực thi nghiêm ngặt. [cite: 728]

### 4.3. Yêu cầu về Tính khả dụng (Usability)
* [cite_start]Giao diện người dùng phải có thiết kế đáp ứng (responsive), hoạt động tốt trên cả máy tính và di động. [cite: 730]
* [cite_start]Luồng người dùng phải trực quan, dễ hiểu. [cite: 731]
* [cite_start]Các thông báo lỗi phải rõ ràng và thân thiện. [cite: 732]

### 4.4. Các Quy tắc Nghiệp vụ Cốt lõi (Global Business Rules)
* [cite_start]**Tài khoản đa vai trò:** Một tài khoản người dùng có thể đồng thời sở hữu cả vai trò Khách hàng và Chủ dự án. [cite: 734] [cite_start]Hệ thống phải hỗ trợ chuyển đổi vai trò. [cite: 735]
* [cite_start]**Sổ cái giao dịch:** Tất cả các hoạt động tài chính phải được ghi lại trong một sổ cái giao dịch không thể thay đổi để đảm bảo tính minh bạch và kiểm toán. [cite: 736]
* [cite_start]**Hệ thống thông báo tự động:** Hệ thống sẽ tự động gửi thông báo qua email và/hoặc push notification cho các sự kiện quan trọng. [cite: 737]
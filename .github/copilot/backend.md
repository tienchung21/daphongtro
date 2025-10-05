---
applyTo: ["server/**/*.js"]
---

# HƯỚNG DẪN COPILOT CHO BACKEND (NODE.JS + JAVASCRIPT) - PHIÊN BẢN 2.0

> Phiên bản này được cập nhật để bám sát đặc tả nghiệp vụ v1.2, đặc biệt là các logic phức tạp về Cọc, Chính sách, Phân quyền và Sổ cái.

## Ngôn ngữ trả lời mặc định
- **Bắt buộc:** Luôn trả lời, đề xuất và sinh code comment bằng **tiếng Việt**.

---

## 1. Kiến trúc & Thư mục

| Thư mục | Vai trò |
|---|---|
| `server/api/` | Định nghĩa route + controller nhẹ (HTTP layer). Chỉ chịu trách nhiệm validate input và gọi Service. |
| `server/services/` | **Nơi chứa toàn bộ logic nghiệp vụ.** Không phụ thuộc vào Express. Phải tái sử dụng được. |
| `server/models/` | Truy cập dữ liệu qua `mysql2` (pool). Không dùng ORM trong giai đoạn dev; viết SQL thuần bám sát `thue_tro.sql`. |
| `server/utils/` | Các hàm tiện ích thuần túy, không chứa nghiệp vụ (ví dụ: format tiền tệ, xử lý chuỗi). |
| `server/constants/` | Enum, hằng số (`trangThai.js`, `loaiCoc.js`, …), bám sát "Từ điển khái niệm". |
| `server/jobs/` | Cron/worker (ví dụ: xử lý `CocGiuCho` hết hạn TTL, gửi thông báo định kỳ). |
| `server/middlewares/`| Middleware của Express (xác thực, phân quyền, idempotency, logging). |

### 1.1. Kết nối DB (mysql2 + ENV)

- Sử dụng `server/config/db.js` với `mysql2` (pool + `.promise()`).
- Đọc cấu hình từ biến môi trường: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
- Trong dev, KHÔNG dùng ORM; tất cả truy vấn dùng SQL parameterized (`?`).

Ví dụ transaction (mysql2):

```js
// services/_exampleTransaction.js
const db = require('../config/db');

async function thucHienGiaoDich(data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Ví dụ INSERT có tham số
    await conn.query(
      'INSERT INTO buttoansocai (GiaoDichID, ViID, SoTien, LoaiButToan) VALUES (?, ?, ?, ?)',
      [data.giaoDichId, data.viId, data.soTien, 'GhiCo']
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
```

---

## 2. Enum & Hằng số

- Luôn import và sử dụng hằng số từ `server/constants/` để đảm bảo tính nhất quán và tránh lỗi chính tả.
- Các hằng số phải ánh xạ chính xác với các trạng thái trong mô hình trạng thái của đặc tả.

```js
// server/constants/trangThai.js
export const TRANG_THAI_TIN_DANG = Object.freeze({
  NHAP: 'Nhap',
  CHO_DUYET: 'ChoDuyet',
  DA_DUYET: 'DaDuyet',
  DA_DANG: 'DaDang',
  TAM_NGUNG: 'TamNgung',
  TU_CHOI: 'TuChoi',
  LUU_TRU: 'LuuTru'
});

export const TRANG_THAI_PHONG = Object.freeze({
  TRONG: 'Trong',
  GIU_CHO: 'GiuCho',
  DA_THUE: 'DaThue',
  DON_DEP: 'DonDep'
});

export const LOAI_COC = Object.freeze({
  COC_GIU_CHO: 'CocGiuCho',
  COC_AN_NINH: 'CocAnNinh'
});
````

-----

## 3\. Idempotency & Rate-Limit

  - **Quy tắc:** Mọi request `POST`/`PUT`/`DELETE` thay đổi trạng thái dữ liệu quan trọng (đặt cọc, tạo hẹn, bàn giao, hủy giao dịch) **bắt buộc** phải có header `Idempotency-Key`.
  - **Middleware (`idempotency.js`):**
      - Sinh cache key theo format: `${userId}:${httpMethod}:${path}:${idempotencyKey}`.
      - Lưu vào Redis với TTL = 24 giờ.
      - Nếu request trùng lặp (key đã tồn tại), trả về ngay lập tức phản hồi đã được lưu trữ. Nếu body khác, trả về lỗi HTTP 409 Conflict.

-----

## 4\. Nghiệp vụ Cọc & Giao dịch (Quan trọng)

Hệ thống có hai luồng cọc riêng biệt. Logic xử lý phải phân tách rõ ràng.

### 4.1. Cọc Giữ Chỗ (`CocGiuCho`) - Dựa trên TTL

  - **Transaction:** Khi đặt cọc, toàn bộ quy trình (trừ tiền/giữ tiền PG, tạo bản ghi `Coc`, cập nhật trạng thái `Phong` sang `GiuCho`) phải nằm trong một transaction của database.
  - **Cron Job (`jobs/releaseExpiredDeposits.js`):**
      - Chạy định kỳ (ví dụ: 5 phút/lần) để quét các bản ghi `Coc` loại `CocGiuCho` đã hết `HetHanLuc`.
      - **Quan trọng:** Với mỗi cọc hết hạn, job phải gọi `CocService` để xử lý hoàn/phạt **dựa trên `ChinhSachCoc` của TinĐăng liên quan.**
      - Ghi log và gửi thông báo cho người dùng.

### 4.2. Cọc An Ninh (`CocAnNinh`) - Dựa trên Sự kiện Bàn Giao

  - **Luồng sống:** Loại cọc này không có TTL. Nó chỉ được giải tỏa khi có một `BiênBảnBànGiao` được xác nhận.
  - **Trigger:** Logic giải tỏa **không nằm trong cron job**. Thay vào đó, nó phải được kích hoạt từ một service khác (ví dụ: `BienBanBanGiaoService`).

<!-- end list -->

```js
// Gợi ý cho services/bienBanBanGiaoService.js
/**
 * Hoàn tất biên bản bàn giao và kích hoạt luồng giải tỏa/đối trừ Cọc An Ninh.
 * Luồng này được kích hoạt khi UC-OPER-06 hoàn thành.
 * @param {number} bienBanId ID của biên bản bàn giao
 * @param {number} nguoiThucHienId ID người dùng đang thực hiện (để ghi log)
 * @returns {Promise<void>}
 */
async function hoanTatBanGiao(bienBanId, nguoiThucHienId) {
  // 1. Dùng transaction
  // 2. Cập nhật trạng thái BiênBảnBànGiao -> 'DaBanGiao'
  // 3. Lấy thông tin HopDong và CocAnNinh liên quan
  const cocAnNinh = await Coc.findOne({ where: { BienBanBanGiaoID: bienBanId, Loai: LOAI_COC.COC_AN_NINH } });
  
  // 4. Gọi service khác để xử lý nghiệp vụ giải tỏa cọc
  await cocService.giaiToaCocAnNinh(cocAnNinh.id, {
    lyDo: 'HoanTatBanGiao',
    nguoiThucHienId: nguoiThucHienId
  });

  // 5. Ghi Nhật Ký Hệ Thống
  await auditLogService.log(...);
}
```

-----

## 5\. Logic động theo Chính sách (Policy-based)

  - **Quy tắc vàng:** **KHÔNG hard-code** các quy tắc nghiệp vụ như thời gian TTL, tỷ lệ phạt, số tiền cọc...
  - **Cách làm:** Trước khi thực hiện một hành động (đặt cọc, hủy cọc), service phải truy vấn `TinDang` để lấy `ChinhSachCocID`, sau đó đọc các quy tắc từ bản ghi `ChinhSachCoc` tương ứng và áp dụng.

<!-- end list -->

```js
// Gợi ý cho services/cocService.js
/**
 * Xử lý hủy một khoản Cọc Giữ Chỗ bởi khách hàng.
 * @param {object} coc - Đối tượng cọc từ DB.
 * @param {string} thoiDiemHuy - Thời điểm yêu cầu hủy.
 */
async function huyCocGiuCho(coc, thoiDiemHuy) {
  // 1. Lấy TinDang và ChinhSachCoc liên quan
  const tinDang = await TinDang.findByPk(coc.TinDangID, { include: 'ChinhSachCoc' });
  const chinhSach = tinDang.ChinhSachCoc;

  // 2. Áp dụng logic từ chính sách
  // Ví dụ: kiểm tra xem thời điểm hủy có nằm trong khoảng được hoàn tiền không
  const tiLePhat = tinhToanTiLePhatTheoChinhSach(chinhSach, thoiDiemHuy);
  const soTienHoan = coc.soTien * (1 - tiLePhat / 100);
  
  // 3. Tiến hành tạo giao dịch hoàn tiền...
}
```

-----

## 6\. Hạch toán & Sổ Cái (Ledger Accounting)

  - **Quy tắc:** Theo đặc tả (UC-4.1), **phí nền tảng không được trừ trực tiếp từ tiền cọc**. Nó phải là một giao dịch riêng.
  - **Cách làm:** Mọi giao dịch tài chính phải được ghi vào `ButToanSoCai` dưới dạng Ghi Nợ / Ghi Có. Một hành động của người dùng (như thanh toán) có thể sinh ra nhiều bút toán.

<!-- end list -->

```js
// Gợi ý cho services/thanhToanService.js (mysql2 + transaction)
const db = require('../config/db');

/**
 * Xử lý thanh toán đặt cọc thành công từ cổng thanh toán.
 * @param {object} dataThanhToan - Dữ liệu từ PG (số tiền, mã giao dịch, tinDangId,...)
 */
async function xuLyThanhToanCocThanhCong(dataThanhToan) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { soTienCoc, soTienPhiNenTang, tinDangId, userId } = dataThanhToan;

    // Bút toán 1: Ghi nhận tiền cọc vào tài khoản tạm giữ (Escrow)
    await conn.query(
      'INSERT INTO buttoansocai (GiaoDichID, ViID, SoTien, LoaiButToan) VALUES (?, ?, ?, ?)',
      [/* GiaoDichID */ 0, /* VI_TAM_GIU_HE_THONG */ 1, soTienCoc, 'GhiCo']
    );

    // Bút toán 2: Ghi nhận phí nền tảng vào tài khoản doanh thu
    if (soTienPhiNenTang > 0) {
      await conn.query(
        'INSERT INTO buttoansocai (GiaoDichID, ViID, SoTien, LoaiButToan) VALUES (?, ?, ?, ?)',
        [/* GiaoDichID */ 0, /* VI_DOANH_THU_HE_THONG */ 2, soTienPhiNenTang, 'GhiCo']
      );
    }

    // TODO: Các bút toán Ghi Nợ (Debit) tương ứng, cập nhật Phòng, tạo Cọc...

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    // Xử lý lỗi / ném tiếp
    throw error;
  } finally {
    conn.release();
  }
}
```

-----

## 7\. Phân quyền (RBAC) & Luồng "Act-as"

  - **Middleware Phân quyền:** Tạo middleware `authorize(permission)` hoặc `authorize(role)` để kiểm tra quyền truy cập vào các endpoint. Dữ liệu quyền được đọc từ session/JWT của người dùng.
  - **Xử lý "Act-as":**
      - Khi `NhanVienDieuHanh` thực hiện chức năng này, session/JWT phải lưu cả hai thông tin: `realUserId` (ID của nhân viên) và `effectiveUserId` (ID của người dùng đang được đại diện).
      - Mọi `service` khi thực hiện truy vấn dữ liệu (SELECT, INSERT, UPDATE) phải dựa trên `effectiveUserId`.
      - **Quan trọng:** Khi gọi `AuditLogService`, phải truyền cả `realUserId` và `effectiveUserId` để ghi lại chính xác ai đã thực hiện hành động thay mặt cho ai.

-----

## 8\. Ghi Nhật Ký Hệ Thống (Audit Logging)

  - **Quy tắc:** Mọi hành động quan trọng làm thay đổi dữ liệu (`create`, `update`, `delete`) hoặc các hành động nhạy cảm (`login`, `view_report`) đều **BẮT BUỘC** phải được ghi lại.
  - **Cách làm:**
      - Tạo một `AuditLogService` chuyên dụng.
      - Các service khác (ví dụ `TinDangService`, `UserService`) sẽ gọi `auditLogService.log(...)` sau khi thực hiện thành công một thao tác.
      - Log phải chứa đầy đủ thông tin: `NguoiDungID` (người thực hiện), `HanhDong`, `DoiTuong`, `DoiTuongID`, `GiaTriTruoc`, `GiaTriSau`, `DiaChiIP`, `TrinhDuyet`. Với luồng "act-as", phải có thêm `realUserId`.

-----

## 9\. Validation & JSDoc

  - Sử dụng Joi (hoặc thư viện tương tự) để validate body/query param ngay tại lớp Controller/API.
  - Viết JSDoc đầy đủ cho tất cả các hàm trong `service` để Copilot có thể gợi ý chính xác kiểu dữ liệu và mục đích của hàm.

<!-- end list -->

```js
/**
 * @typedef {object} CocRequestBody
 * @property {number} soTien - Số tiền đặt cọc.
 * @property {'CocGiuCho'|'CocAnNinh'} loaiCoc - Loại cọc, phải là một trong các giá trị của LOAI_COC.
 * @property {string} idempotencyKey - UUID v4 để chống request trùng lặp.
 */

/**
 * Tạo một giao dịch đặt cọc mới cho một tin đăng.
 * @param {number} tinDangId - ID của tin đăng cần đặt cọc.
 * @param {number} userId - ID của khách hàng thực hiện.
 * @param {CocRequestBody} cocData - Dữ liệu đặt cọc.
 * @returns {Promise<object>} Bản ghi cọc vừa được tạo.
 */
async function datCoc(tinDangId, userId, cocData) {
  // ...
}
```

-----

## 10\. Testing & Commit Message

  - **Testing:**
      - Coverage mục tiêu ≥ 80%.
      - Phải có unit test cho các logic phức tạp trong service (tính toán theo chính sách, tạo bút toán sổ cái).
      - Phải có integration test cho các luồng quan trọng (đặt cọc và rollback, cron job giải tỏa cọc, luồng bàn giao kích hoạt giải tỏa cọc).
  - **Commit Message:**
      - Tuân thủ convention (ví dụ: Conventional Commits).
      - `feat(coc): trien khai luong dat coc an ninh`
      - `fix(jobs): xu ly dung chinh sach coc khi het han`
      - `refactor(service): tach logic tinh phi nen tang`

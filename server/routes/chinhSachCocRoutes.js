/**
 * Routes: Chính sách Cọc
 * Mô tả: Định nghĩa các endpoints cho CRUD Chính sách Cọc
 * Tác giả: GitHub Copilot
 * Ngày tạo: 2025-10-16
 */

const express = require('express');
const router = express.Router();
const ChinhSachCocController = require('../controllers/ChinhSachCocController');
// const { auth } = require('../middleware/auth');
// const { requireRoles } = require('../middleware/role');

// === DEV MODE: Sử dụng authSimple và roleSimple cho mock user ===
const { authSimple } = require('../middleware/authSimple');
const { roleSimple } = require('../middleware/roleSimple');

/**
 * GET /api/chu-du-an/chinh-sach-coc
 * Lấy danh sách chính sách cọc của Chủ dự án
 * Auth: Required
 * Role: Chủ dự án
 * Query params:
 *   - chiLayHieuLuc: boolean (default: true) - Chỉ lấy chính sách còn hiệu lực
 */
router.get(
  '/',
  authSimple,
  roleSimple(['ChuDuAn']),
  ChinhSachCocController.layDanhSach
);

/**
 * GET /api/chu-du-an/chinh-sach-coc/:id
 * Lấy chi tiết một chính sách cọc
 * Auth: Required
 * Role: Chủ dự án
 */
router.get(
  '/:id',
  authSimple,
  roleSimple(['ChuDuAn']),
  ChinhSachCocController.layChiTiet
);

/**
 * POST /api/chu-du-an/chinh-sach-coc
 * Tạo chính sách cọc mới
 * Auth: Required
 * Role: Chủ dự án
 * Body: {
 *   TenChinhSach: string (required),
 *   MoTa: string (optional),
 *   ChoPhepCocGiuCho: boolean (default: true),
 *   TTL_CocGiuCho_Gio: number (default: 48, min: 1, max: 168),
 *   TyLePhat_CocGiuCho: number (default: 0, min: 0, max: 100),
 *   ChoPhepCocAnNinh: boolean (default: true),
 *   SoTienCocAnNinhMacDinh: number (optional),
 *   QuyTacGiaiToa: 'BanGiao'|'TheoNgay'|'Khac' (default: 'BanGiao'),
 *   HieuLuc: boolean (default: true)
 * }
 */
router.post(
  '/',
  authSimple,
  roleSimple(['ChuDuAn']),
  ChinhSachCocController.taoMoi
);

/**
 * PUT /api/chu-du-an/chinh-sach-coc/:id
 * Cập nhật chính sách cọc
 * Auth: Required
 * Role: Chủ dự án
 * Body: (tất cả các fields đều optional, chỉ cập nhật fields có trong request)
 *   TenChinhSach, MoTa, ChoPhepCocGiuCho, TTL_CocGiuCho_Gio,
 *   TyLePhat_CocGiuCho, ChoPhepCocAnNinh, SoTienCocAnNinhMacDinh,
 *   QuyTacGiaiToa, HieuLuc
 */
router.put(
  '/:id',
  authSimple,
  roleSimple(['ChuDuAn']),
  ChinhSachCocController.capNhat
);

/**
 * DELETE /api/chu-du-an/chinh-sach-coc/:id
 * Vô hiệu hóa chính sách cọc (soft delete)
 * Auth: Required
 * Role: Chủ dự án
 * Note: Không thể xóa chính sách đang được sử dụng bởi tin đăng
 */
router.delete(
  '/:id',
  authSimple,
  roleSimple(['ChuDuAn']),
  ChinhSachCocController.voHieuHoa
);

module.exports = router;

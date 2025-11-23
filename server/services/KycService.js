const KycModel = require('../models/KycModel');
const db = require('../config/db');

class KycService {
  static async createVerification(data) {
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Create KYC record
      const kycId = await KycModel.create(data);

      // 2. If successful or pending review, update user profile
      if (data.TrangThai !== 'ThatBai') {
        const updateSql = `
          UPDATE nguoidung 
          SET 
            TenDayDu = COALESCE(?, TenDayDu),
            NgaySinh = COALESCE(?, NgaySinh),
            DiaChi = COALESCE(?, DiaChi),
            SoCCCD = COALESCE(?, SoCCCD),
            NgayCapCCCD = COALESCE(?, NgayCapCCCD),
            NoiCapCCCD = COALESCE(?, NoiCapCCCD),
            AnhCCCDMatTruoc = ?,
            AnhCCCDMatSau = ?,
            AnhSelfie = ?,
            TrangThaiXacMinh = 'ChoDuyet'
          WHERE NguoiDungID = ?
        `;
        const params = [
          data.TenDayDu, data.NgaySinh, data.DiaChi, data.SoCCCD, 
          data.NgayCapCCCD, data.NoiCapCCCD,
          data.AnhCCCDMatTruoc, data.AnhCCCDMatSau, data.AnhSelfie,
          data.NguoiDungID
        ];
        await connection.execute(updateSql, params);
      }

      await connection.commit();
      return kycId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getHistory(userId) {
    return await KycModel.getByUserId(userId);
  }
}

module.exports = KycService;

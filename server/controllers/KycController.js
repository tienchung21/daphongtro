const KycService = require('../services/KycService');

class KycController {
  static async xacThucKYC(req, res) {
    try {
      console.log('📝 [KYC] Request body:', req.body);
      console.log('📁 [KYC] Files:', req.files);
      
      const { 
        soCCCD, tenDayDu, ngaySinh, diaChi, ngayCapCCCD, 
        faceSimilarity 
      } = req.body;
      
      const userId = req.user.id; // Assuming auth middleware adds user to req
      console.log('👤 [KYC] User ID:', userId);
      
      // Validation: Kiểm tra các trường bắt buộc
      if (!soCCCD || !tenDayDu || !faceSimilarity) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc: Số CCCD, Họ tên, Độ tương đồng' 
        });
      }
      
      // Get file paths
      const cccdFront = req.files['cccdFront'] ? req.files['cccdFront'][0].path : null;
      const cccdBack = req.files['cccdBack'] ? req.files['cccdBack'][0].path : null;
      const selfie = req.files['selfie'] ? req.files['selfie'][0].path : null;

      if (!cccdFront || !cccdBack || !selfie) {
        return res.status(400).json({ message: 'Thiếu ảnh xác thực' });
      }
      
      console.log('🖼️ [KYC] Image paths:', { cccdFront, cccdBack, selfie });

      // Determine status based on similarity
      let trangThai = 'CanXemLai';
      let lyDo = null;
      const similarity = parseFloat(faceSimilarity);
      
      if (similarity >= 0.85) {
        trangThai = 'ThanhCong';
      } else if (similarity < 0.6) {
        trangThai = 'ThatBai';
        lyDo = 'Độ khớp khuôn mặt thấp (' + (similarity * 100).toFixed(2) + '%)';
      }

      const kycData = {
        NguoiDungID: userId,
        SoCCCD: soCCCD || null,
        TenDayDu: tenDayDu || null,
        NgaySinh: ngaySinh || null,
        DiaChi: diaChi || null,
        NgayCapCCCD: ngayCapCCCD || null,
        FaceSimilarity: similarity || null,
        TrangThai: trangThai,
        LyDoThatBai: lyDo,
        AnhCCCDMatTruoc: cccdFront,
        AnhCCCDMatSau: cccdBack,
        AnhSelfie: selfie
      };

      console.log('💾 [KYC] Data to save:', kycData);
      const kycId = await KycService.createVerification(kycData);
      console.log('✅ [KYC] Saved with ID:', kycId);

      res.status(200).json({ 
        message: 'Gửi yêu cầu xác thực thành công', 
        kycId,
        trangThai 
      });

    } catch (error) {
      console.error('KYC Error:', error);
      res.status(500).json({ message: 'Lỗi server khi xử lý KYC' });
    }
  }

  static async getLichSu(req, res) {
    try {
      const userId = req.user.id;
      const history = await KycService.getHistory(userId);
      res.status(200).json(history);
    } catch (error) {
      console.error('KYC History Error:', error);
      res.status(500).json({ message: 'Lỗi khi lấy lịch sử KYC' });
    }
  }
}

module.exports = KycController;

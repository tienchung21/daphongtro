/**
 * QRCodeService - Xử lý QR Code trên CCCD Việt Nam
 * Format QR: "soCCCD|maQR|hoTen|ngaySinh|gioiTinh|diaChi|ngayCap"
 * Ví dụ: "060203002124|261426123|Võ Nguyễn Hoành Hợp|11112003|Nam|15, Đường Hà Huy Tập, Chợ Lầu, Bắc Bình, Bình Thuận|19042021"
 */

const QRCodeService = {
  /**
   * Crop vùng QR code từ ảnh CCCD với tọa độ cụ thể
   * @param {string} imageDataUrl - Data URL của ảnh
   * @param {Object} region - {x, y, width, height} theo % (0-1)
   * @returns {Promise<string>} - Data URL của vùng QR đã crop
   */
  cropQRRegion: async (imageDataUrl, region = { x: 0.65, y: 0, width: 0.35, height: 0.30 }) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Tính tọa độ pixel thực tế từ region %
        const qrX = Math.floor(img.width * region.x);
        const qrY = Math.floor(img.height * region.y);
        const qrWidth = Math.floor(img.width * region.width);
        const qrHeight = Math.floor(img.height * region.height);
        
        canvas.width = qrWidth;
        canvas.height = qrHeight;
        
        // Crop vùng QR
        ctx.drawImage(img, qrX, qrY, qrWidth, qrHeight, 0, 0, qrWidth, qrHeight);
        
        // Tăng contrast để QR rõ hơn
        const imageData = ctx.getImageData(0, 0, qrWidth, qrHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Tăng contrast
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const factor = 1.5;
          data[i] = Math.min(255, (data[i] - 128) * factor + 128);
          data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128);
          data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128);
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        console.log(`📐 QR region cropped: ${qrWidth}x${qrHeight} from (${qrX}, ${qrY})`);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = imageDataUrl;
    });
  },

  /**
   * Scan QR code từ ảnh CCCD với retry và cropping
   * @param {File|string} imageSource - File object hoặc data URL
   * @returns {Promise<Object>} - Parsed CCCD data
   */
  scanFromImage: async (imageSource) => {
    try {
      console.log('🔍 Bắt đầu quét QR code từ ảnh CCCD...');
      
      // Convert to data URL nếu cần
      let imageDataUrl = imageSource;
      if (imageSource instanceof File) {
        imageDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(imageSource);
        });
      }
      
      // Lazy import html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');
      
      const html5QrCode = new Html5Qrcode("qr-reader-hidden", {
        formatsToSupport: [0], // 0 = QR_CODE
        verbose: false
      });
      
      let qrData = null;
      let attempts = [];
      
      // Attempt 1: Scan toàn bộ ảnh
      try {
        console.log('   Attempt 1: Scan full image...');
        const blob = await fetch(imageDataUrl).then(r => r.blob());
        const file = new File([blob], "cccd-full.jpg", { type: "image/jpeg" });
        const result = await html5QrCode.scanFile(file, false);
        qrData = result;
        console.log('✅ QR found on full image');
      } catch (err) {
        attempts.push({ method: 'full', error: err.message });
        console.warn('   ❌ Full image scan failed:', err.message);
      }
      
      // Attempt 2-5: Thử nhiều vùng crop khác nhau
      if (!qrData) {
        const regions = [
          { name: 'top-right-large', x: 0.60, y: 0, width: 0.40, height: 0.35 },
          { name: 'top-right-medium', x: 0.65, y: 0, width: 0.35, height: 0.30 },
          { name: 'top-right-small', x: 0.70, y: 0.05, width: 0.28, height: 0.25 },
          { name: 'top-center', x: 0.35, y: 0, width: 0.30, height: 0.30 },
        ];
        
        for (const region of regions) {
          try {
            console.log(`   Attempt (${region.name}): Scan cropped region...`);
            const croppedQR = await QRCodeService.cropQRRegion(imageDataUrl, region);
            const blob = await fetch(croppedQR).then(r => r.blob());
            const file = new File([blob], `cccd-qr-${region.name}.jpg`, { type: "image/jpeg" });
            const result = await html5QrCode.scanFile(file, false);
            qrData = result;
            console.log(`✅ QR found on cropped region: ${region.name}`);
            break; // Tìm thấy thì dừng
          } catch (err) {
            attempts.push({ method: region.name, error: err.message });
            console.warn(`   ❌ ${region.name} scan failed:`, err.message);
          }
        }
      }
      
      if (!qrData) {
        throw new Error(`Không tìm thấy QR code sau ${attempts.length} lần thử: ${JSON.stringify(attempts)}`);
      }
      
      console.log('✅ QR Code raw data:', qrData);
      
      // Parse QR data
      const parsedData = QRCodeService.parseQRData(qrData);
      
      console.log('📊 Thông tin từ QR code:', parsedData);
      
      return {
        success: true,
        source: 'QR_CODE',
        raw: qrData,
        data: parsedData,
        attempts: attempts.length + 1
      };
      
    } catch (error) {
      console.error('❌ QR scan failed completely:', error.message);
      return {
        success: false,
        source: 'QR_CODE',
        error: error.message,
        data: null
      };
    }
  },

  /**
   * Parse QR code data theo format CCCD Việt Nam
   * Format: "soCCCD|soCMND|hoTen|ngaySinh|gioiTinh|diaChi|ngayCap"
   * Ví dụ: "060203002124|261426123|Võ Nguyễn Hoành Hợp|11112003|Nam|15, Đường Hà Huy Tập, Chợ Lầu, Bắc Bình, Bình Thuận|19042021"
   * @param {string} qrString - Raw QR string
   * @returns {Object} - Parsed data
   */
  parseQRData: (qrString) => {
    console.log('🔧 Parsing QR string:', qrString);
    
    const parts = qrString.split('|');
    
    if (parts.length < 7) {
      throw new Error(`Invalid QR format. Expected 7 parts, got ${parts.length}`);
    }
    
    // Parse ngày sinh từ DDMMYYYY
    const ngaySinhRaw = parts[3]; // "11112003"
    const ngaySinh = ngaySinhRaw.length === 8 
      ? `${ngaySinhRaw.substring(0, 2)}/${ngaySinhRaw.substring(2, 4)}/${ngaySinhRaw.substring(4, 8)}`
      : ngaySinhRaw;
    
    // Parse ngày cấp từ DDMMYYYY
    const ngayCapRaw = parts[6]; // "19042021"
    const ngayCap = ngayCapRaw.length === 8
      ? `${ngayCapRaw.substring(0, 2)}/${ngayCapRaw.substring(2, 4)}/${ngayCapRaw.substring(4, 8)}`
      : ngayCapRaw;
    
    const result = {
      soCCCD: parts[0].trim(),           // "060203002124" - Số CCCD 12 số
      soCMND: parts[1].trim(),           // "261426123" - Số CMND cũ (9 số) hoặc rỗng
      tenDayDu: parts[2].trim(),         // "Võ Nguyễn Hoành Hợp"
      ngaySinh: ngaySinh,                // "11/11/2003"
      gioiTinh: parts[4].trim(),         // "Nam" / "Nữ"
      diaChi: parts[5].trim(),           // "15, Đường Hà Huy Tập, Chợ Lầu, Bắc Bình, Bình Thuận"
      ngayCap: ngayCap,                  // "19/04/2021"
      noiCap: null                       // Không có trong QR, cần OCR
    };
    
    // Validate CCCD (12 số)
    if (!result.soCCCD || result.soCCCD.length !== 12) {
      throw new Error('Invalid CCCD number in QR code');
    }
    
    // Validate CMND (9 số hoặc rỗng)
    if (result.soCMND && result.soCMND.length > 0 && result.soCMND.length !== 9) {
      console.warn('⚠️ CMND number has unexpected length:', result.soCMND.length);
    }
    
    console.log('✅ Parsed QR data:', result);
    
    return result;
  },

  /**
   * So sánh độ tương đồng giữa 2 strings (Levenshtein distance)
   * @param {string} str1 
   * @param {string} str2 
   * @returns {number} - Similarity score 0-1 (1 = giống hệt)
   */
  calculateSimilarity: (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    // Normalize: lowercase, remove diacritics, trim
    const normalize = (s) => s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .trim();
    
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1;
    
    // Levenshtein distance
    const matrix = [];
    const n = s1.length;
    const m = s2.length;
    
    if (n === 0) return m === 0 ? 1 : 0;
    if (m === 0) return 0;
    
    for (let i = 0; i <= n; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= m; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    const distance = matrix[n][m];
    const maxLength = Math.max(n, m);
    const similarity = 1 - (distance / maxLength);
    
    return similarity;
  },

  /**
   * So sánh và merge dữ liệu từ QR và OCR
   * @param {Object} qrData - Data từ QR code
   * @param {Object} ocrData - Data từ OCR
   * @returns {Object} - Merged data với confidence scores
   */
  mergeAndValidate: (qrData, ocrData) => {
    console.log('🔀 Bắt đầu merge & validate QR + OCR data...');
    
    const result = {
      finalData: {},
      sources: {},
      confidence: {},
      conflicts: []
    };
    
    // Helper: chọn data tốt nhất
    const selectBest = (field, qrValue, ocrValue) => {
      // Nếu chỉ có 1 source
      if (!qrValue && !ocrValue) {
        result.finalData[field] = null;
        result.sources[field] = 'NONE';
        result.confidence[field] = 0;
        return;
      }
      
      if (qrValue && !ocrValue) {
        result.finalData[field] = qrValue;
        result.sources[field] = 'QR_CODE';
        result.confidence[field] = 1.0;
        return;
      }
      
      if (!qrValue && ocrValue) {
        result.finalData[field] = ocrValue;
        result.sources[field] = 'OCR';
        result.confidence[field] = 0.7; // OCR confidence thấp hơn QR
        return;
      }
      
      // Có cả 2 sources - so sánh
      const similarity = QRCodeService.calculateSimilarity(
        String(qrValue), 
        String(ocrValue)
      );
      
      console.log(`   ${field}: QR="${qrValue}" vs OCR="${ocrValue}" → Similarity: ${(similarity * 100).toFixed(1)}%`);
      
      if (similarity >= 0.85) {
        // Trùng khớp cao - ưu tiên QR
        result.finalData[field] = qrValue;
        result.sources[field] = 'QR_CODE (verified by OCR)';
        result.confidence[field] = 1.0;
      } else if (similarity >= 0.6) {
        // Tương đồng vừa phải - conflict warning
        result.finalData[field] = qrValue; // Ưu tiên QR
        result.sources[field] = 'QR_CODE (partial OCR match)';
        result.confidence[field] = 0.85;
        result.conflicts.push({
          field,
          qrValue,
          ocrValue,
          similarity: similarity.toFixed(2)
        });
      } else {
        // Khác nhau nhiều - conflict error
        result.finalData[field] = qrValue; // Vẫn ưu tiên QR
        result.sources[field] = 'QR_CODE (OCR mismatch)';
        result.confidence[field] = 0.7;
        result.conflicts.push({
          field,
          qrValue,
          ocrValue,
          similarity: similarity.toFixed(2),
          severity: 'HIGH'
        });
      }
    };
    
    // So sánh từng field
    const fields = ['soCCCD', 'tenDayDu', 'ngaySinh', 'diaChi', 'ngayCap'];
    
    for (const field of fields) {
      selectBest(field, qrData?.[field], ocrData?.[field]);
    }
    
    // Nơi cấp - chỉ từ OCR (không có trong QR)
    result.finalData.noiCap = ocrData?.noiCap || null;
    result.sources.noiCap = ocrData?.noiCap ? 'OCR' : 'NONE';
    result.confidence.noiCap = ocrData?.noiCap ? 0.7 : 0;
    
    // Giới tính - chỉ từ QR
    result.finalData.gioiTinh = qrData?.gioiTinh || null;
    result.sources.gioiTinh = qrData?.gioiTinh ? 'QR_CODE' : 'NONE';
    result.confidence.gioiTinh = qrData?.gioiTinh ? 1.0 : 0;
    
    // Số CMND cũ - chỉ từ QR
    result.finalData.soCMND = qrData?.soCMND || null;
    result.sources.soCMND = qrData?.soCMND ? 'QR_CODE' : 'NONE';
    result.confidence.soCMND = qrData?.soCMND ? 1.0 : 0;
    
    // Overall confidence
    const avgConfidence = Object.values(result.confidence)
      .reduce((sum, c) => sum + c, 0) / Object.keys(result.confidence).length;
    
    result.overallConfidence = avgConfidence;
    result.hasConflicts = result.conflicts.length > 0;
    
    console.log('✅ Merge completed:', {
      overallConfidence: `${(avgConfidence * 100).toFixed(1)}%`,
      conflicts: result.conflicts.length,
      sources: result.sources
    });
    
    if (result.conflicts.length > 0) {
      console.warn('⚠️ Conflicts detected:', result.conflicts);
    }
    
    return result;
  },

  /**
   * Detect QR code region trên ảnh (optional - để crop trước khi scan)
   * @param {string} imageDataUrl - Data URL của ảnh
   * @returns {Promise<Object|null>} - QR region hoặc null
   */
  detectQRRegion: async (imageDataUrl) => {
    try {
      console.log('🔍 Detecting QR code region...');
      
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageDataUrl;
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR detection: tìm vùng có pattern đen-trắng đặc trưng
      // (Simplified - production nên dùng opencv.js hoặc jsQR để detect chính xác)
      
      // Thường QR code ở góc phải trên của CCCD
      const qrRegion = {
        x: Math.floor(canvas.width * 0.7),
        y: Math.floor(canvas.height * 0.05),
        width: Math.floor(canvas.width * 0.25),
        height: Math.floor(canvas.height * 0.25)
      };
      
      console.log('✅ QR region estimated:', qrRegion);
      
      return qrRegion;
      
    } catch (error) {
      console.warn('⚠️ QR region detection failed:', error.message);
      return null;
    }
  }
};

export default QRCodeService;

/**
 * OCRServiceV2 - Enhanced OCR với ROI-based extraction & OpenCV Warping
 * Đọc từng vùng cụ thể thay vì toàn bộ ảnh
 */

import Tesseract from 'tesseract.js';
import ImageProcessingService from './ImageProcessingService';

const OCRServiceV2 = {
  /**
   * Định nghĩa ROI (Region of Interest) cho từng field trên CCCD
   * Tọa độ tính theo % của kích thước ảnh CHUẨN (1000x630)
  */
  CCCD_ROI: {
    // Số CCCD - Dòng 1 bên phải, màu đen đậm
    soCCCD: {
      x: 0.3646632048404658,
      y: 0.40167174309188105,
      width: 0.45,
      height: 0.1
    },

    // Họ và tên - Dòng 2, chữ IN HOA đen
    tenDayDu: {
      x: 0.27435237337743795,
      y: 0.5376948164845092,
      width: 0.48,
      height: 0.09
    },

    // Ngày sinh - Dòng 3 bên phải "Date of birth:"
    ngaySinh: {
      x: 0.5633160242023292,
      y: 0.6076025229139963,
      width: 0.22,
      height: 0.09
    },

    // Giới tính - Dòng 4 bên trái "Sex:"
    gioiTinh: {
      x: 0.4462691895486178,
      y: 0.6599050917238253,
      width: 0.1,
      height: 0.1
    },

    // Quốc tịch - Dòng 4 bên phải "Nationality:"
    quocTich: {
      x: 0.78,
      y: 0.33,
      width: 0.18,
      height: 0.07
    },

    // Quê quán - Dòng 5 "Place of origin:"
    queQuan: {
      x: 0.28,
      y: 0.41,
      width: 0.65,
      height: 0.09
    },

    // Nơi thường trú - Dòng 6-7 "Place of residence:"
    diaChi: {
      x: 0.2830051927393013,
      y: 0.8499119973852943,
      width: 0.63,
      height: 0.13
    },

    // Có giá trị đến - Dưới cùng bên trái (mặt sau - placeholder if needed)
    ngayCap: {
      x: 0.05,
      y: 0.8,
      width: 0.3,
      height: 0.08
    },

    // Face region for cropping
    faceImage: {
      x: 0.03956871353251068,
      y: 0.3992371061612484,
      width: 0.24,
      height: 0.42
    },

    // QR Code region (if on front)
    qrCode: {
      x: 0.7822892552247601,
      y: 0.0956208542777824,
      width: 0.16,
      height: 0.22
    }
  },

  /**
   * Filter out noisy Tesseract wasm warnings ("Parameter not found") so console is clean
   */
  withFilteredTesseractWarnings: async (fn) => {
    const originalWarn = console.warn;
    const originalError = console.error;
    const shouldFilter = (args) => args.some(a => typeof a === 'string' && a.includes('Parameter not found'));
    console.warn = (...args) => {
      if (shouldFilter(args)) return;
      return originalWarn(...args);
    };
    console.error = (...args) => {
      if (shouldFilter(args)) return;
      return originalError(...args);
    };

    try {
      return await fn();
    } finally {
      console.warn = originalWarn;
      console.error = originalError;
    }
  },

  /**
   * Crop ROI từ ảnh
   * @param {string} imageDataUrl - Data URL của ảnh gốc
   * @param {Object} roi - {x, y, width, height} theo %
   * @returns {Promise<string>} - Data URL của ảnh đã crop
   */
  cropROI: async (imageDataUrl, roi) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const safeRoi = roi && Number.isFinite(roi.x) && Number.isFinite(roi.y) && Number.isFinite(roi.width) && Number.isFinite(roi.height)
          ? roi
          : { x: 0, y: 0, width: 1, height: 1 };
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Tính tọa độ pixel thực tế
        const cropX = Math.floor(img.width * safeRoi.x);
        const cropY = Math.floor(img.height * safeRoi.y);
        const cropWidth = Math.max(1, Math.floor(img.width * safeRoi.width));
        const cropHeight = Math.max(1, Math.floor(img.height * safeRoi.height));

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Crop vùng
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageDataUrl;
    });
  },

  /**
   * OCR một ROI cụ thể
   * @param {string} imageDataUrl - Data URL gốc (đã warp)
   * @param {string} fieldName - Tên field (soCCCD, tenDayDu...)
   * @returns {Promise<string>} - Text đã đọc
   */
  recognizeField: async (imageDataUrl, fieldName, roiMap = OCRServiceV2.CCCD_ROI) => {
    try {
      const roi = roiMap[fieldName];
      if (!roi) {
        throw new Error(`ROI not defined for field: ${fieldName}`);
      }

      // Step 1: Crop ROI
      const croppedROI = await OCRServiceV2.cropROI(imageDataUrl, roi);

      // Step 2: Preprocess (Adaptive Binarization via OpenCV)
      const processedROI = await ImageProcessingService.processROI(croppedROI, {
        targetColor: { r: 9, g: 10, b: 4 }, // CCCD text is near black
        tolerance: 80
      });

      // Step 3: Tesseract OCR
      const { text, confidence } = await OCRServiceV2.withFilteredTesseractWarnings(async () => {
        const worker = await Tesseract.createWorker('vie', 1, {
          logger: () => { } // Silence logger
        });

        try {
          // Config tùy theo field
          const config = OCRServiceV2.getFieldConfig(fieldName);
          await worker.setParameters(config);

          const { data: { text, confidence } } = await worker.recognize(processedROI);
          return { text, confidence };
        } finally {
          await worker.terminate();
        }
      });

      // Clean up text
      let cleanText = text.trim();

      // Basic post-correction
      if (fieldName === 'soCCCD') cleanText = cleanText.replace(/\D/g, '');
      if (fieldName === 'gioiTinh') {
        cleanText = cleanText.replace(/[^a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ]/g, '');
      }

      console.log(`✅ ${fieldName}: "${cleanText}" (conf: ${confidence.toFixed(1)}%)`);
      return cleanText;

    } catch (error) {
      console.error(`❌ OCR field "${fieldName}" failed:`, error.message);
      return null;
    }
  },

  /**
   * Config Tesseract theo từng loại field
   */
  getFieldConfig: (fieldName) => {
    const baseConfig = {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
    };

    switch (fieldName) {
      case 'soCCCD':
        return {
          ...baseConfig,
          tessedit_char_whitelist: '0123456789',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_WORD,
        };

      case 'tenDayDu':
        return {
          ...baseConfig,
          // Allow uppercase Vietnamese + spaces
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ ',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
        };

      case 'ngaySinh':
      case 'ngayCap':
        return {
          ...baseConfig,
          tessedit_char_whitelist: '0123456789/',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_WORD,
        };

      case 'gioiTinh':
        return {
          ...baseConfig,
          tessedit_char_whitelist: 'NamNữNAMNỮ',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_WORD,
        };

      case 'quocTich':
        return {
          ...baseConfig,
          tessedit_char_whitelist: 'VIỆTNAMviệtnam ',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
        };

      case 'diaChi':
      case 'queQuan':
        return {
          ...baseConfig,
          // Allow wider range of chars for address
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ ,.-/',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        };

      default:
        return baseConfig;
    }
  },

  /**
   * Recognize toàn bộ CCCD (all fields)
   * @param {File|string} imageSource - File object hoặc data URL của ảnh CCCD
   * @returns {Promise<Object>} - Parsed CCCD data
   */
  recognizeAll: async (imageSource, roiOverrides = {}) => {
    console.log('🚀 Bắt đầu OCR tất cả fields với Warping & ROI...');

    // Convert to data URL nếu cần
    let imageDataUrl = imageSource;
    if (imageSource instanceof File) {
      imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(imageSource);
      });
    }

    // 1. Warp Perspective (quan trọng nhất)
    console.log('📐 Đang warp ảnh CCCD...');
    const warpedImage = await ImageProcessingService.warpPerspective(imageDataUrl);

    const roiConfig = { ...OCRServiceV2.CCCD_ROI, ...roiOverrides };
    const fields = ['soCCCD', 'tenDayDu', 'ngaySinh', 'gioiTinh', 'diaChi'];
    const results = {};

    for (const field of fields) {
      results[field] = await OCRServiceV2.recognizeField(warpedImage, field, roiConfig);
    }

    // Post-processing
    const parsed = {
      soCCCD: results.soCCCD || null,
      tenDayDu: results.tenDayDu ? results.tenDayDu.toUpperCase().trim() : null,
      ngaySinh: OCRServiceV2.parseDate(results.ngaySinh),
      gioiTinh: OCRServiceV2.normalizeGender(results.gioiTinh),
      diaChi: OCRServiceV2.normalizeDiaChi(results.diaChi),
      ngayCap: null, // Mặt sau
      noiCap: null,   // Mặt sau
      warpedImage: warpedImage, // Return warped image for debugging/display
      usedROI: roiConfig
    };

    console.log('✅ OCR V2 completed:', parsed);
    return parsed;
  },

  /**
   * Parse date từ text OCR
   */
  parseDate: (dateText) => {
    if (!dateText) return null;
    const digits = dateText.replace(/\D/g, '');
    if (digits.length === 8) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
    } else if (digits.length >= 6) {
      const day = digits.substring(0, 2).padStart(2, '0');
      const month = digits.substring(2, 4).padStart(2, '0');
      const year = digits.substring(4);
      return `${day}/${month}/${year}`;
    }
    return null;
  },

  /**
   * Chuẩn hóa địa chỉ từ text nhiều dòng của Tesseract
   * - Bỏ label "Nơi thường trú / Place of residence:"
   * - Ghép các dòng từ trên xuống dưới, giữ dấu phẩy
   */
  normalizeDiaChi: (rawText) => {
    if (!rawText) return null;
    let text = rawText.replace(/\r/g, '').trim();
    if (!text) return null;

    let lines = text
      .split('\n')
      .map(l => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    if (!lines.length) return null;

    // Bỏ label ở dòng đầu (nhiều biến thể)
    lines[0] = lines[0]
      .replace(/Nơi thường trú\s*\/\s*Place of residence\s*:/i, '')
      .replace(/Place of residence\s*:/i, '')
      .replace(/Noi thuong tru\s*:/i, '')
      .trim();

    // Bỏ dấu gạch ở cuối dòng, clean lại
    lines = lines
      .map(l => l.replace(/\s*-\s*$/, '').trim())
      .filter(Boolean);

    if (!lines.length) return null;

    // Ghép các dòng: trên xuống dưới, giữ dấu phẩy gốc
    let address = lines.join(', ');
    address = address
      .replace(/\s+,/g, ',')
      .replace(/,\s+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    return address || null;
  },

  normalizeGender: (text) => {
    if (!text) return null;
    const t = text.toLowerCase();
    if (t.includes('nam')) return 'Nam';
    if (t.includes('nữ') || t.includes('nu')) return 'Nữ';
    return text;
  }
};

export default OCRServiceV2;

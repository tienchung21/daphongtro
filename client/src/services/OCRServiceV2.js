/**
 * OCRServiceV2 - Enhanced OCR với ROI-based extraction
 * Đọc từng vùng cụ thể thay vì toàn bộ ảnh
 */

import Tesseract from 'tesseract.js';

const OCRServiceV2 = {
  /**
   * Định nghĩa ROI (Region of Interest) cho từng field trên CCCD
   * Tọa độ tính theo % của kích thước ảnh
   */
  CCCD_ROI: {
    // Số CCCD - Dòng 1 bên phải, màu đen đậm
    soCCCD: {
      x: 0.40,      // 40% width từ trái
      y: 0.25,      // 25% height từ trên
      width: 0.35,  // 35% width
      height: 0.08  // 8% height
    },
    
    // Họ và tên - Dòng 2, chữ IN HOA đen
    tenDayDu: {
      x: 0.40,
      y: 0.33,
      width: 0.50,
      height: 0.08
    },
    
    // Ngày sinh - Dòng 3 bên phải "Date of birth:"
    ngaySinh: {
      x: 0.40,
      y: 0.41,
      width: 0.30,
      height: 0.06
    },
    
    // Giới tính - Dòng 4 bên trái "Sex:"
    gioiTinh: {
      x: 0.40,
      y: 0.47,
      width: 0.15,
      height: 0.06
    },
    
    // Quốc tịch - Dòng 4 bên phải "Nationality:"
    quocTich: {
      x: 0.55,
      y: 0.47,
      width: 0.30,
      height: 0.06
    },
    
    // Quê quán - Dòng 5 "Place of origin:"
    queQuan: {
      x: 0.40,
      y: 0.53,
      width: 0.50,
      height: 0.06
    },
    
    // Nơi thường trú - Dòng 6-7 "Place of residence:"
    diaChi: {
      x: 0.40,
      y: 0.59,
      width: 0.50,
      height: 0.12  // 2 dòng
    },
    
    // Có giá trị đến - Dưới cùng bên trái (mặt sau)
    ngayCap: {
      x: 0.05,
      y: 0.80,
      width: 0.30,
      height: 0.08
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
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Tính tọa độ pixel thực tế
        const cropX = Math.floor(img.width * roi.x);
        const cropY = Math.floor(img.height * roi.y);
        const cropWidth = Math.floor(img.width * roi.width);
        const cropHeight = Math.floor(img.height * roi.height);
        
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
   * Filter chỉ giữ text màu đen trên nền trắng
   * @param {string} imageDataUrl - Data URL
   * @returns {Promise<string>} - Data URL đã filter
   */
  filterBlackText: async (imageDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Tính brightness (0-255)
          const brightness = (r + g + b) / 3;
          
          // Chỉ giữ text đen (brightness < 100) và nền xanh lá nhạt
          // CCCD có background xanh lá: R:200-255, G:220-255, B:200-240
          const isGreenBackground = (r > 200 && g > 220 && b > 200 && b < 240);
          const isDarkText = brightness < 100;
          
          if (isDarkText) {
            // Giữ nguyên text đen → chuyển thành đen hoàn toàn
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          } else {
            // Background → chuyển thành trắng
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageDataUrl;
    });
  },

  /**
   * Preprocessing cho từng ROI
   * @param {string} roiDataUrl - Data URL của ROI đã crop
   * @returns {Promise<string>} - Data URL đã xử lý
   */
  preprocessROI: async (roiDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale 3x cho text nhỏ
        const scale = 3;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.imageSmoothingEnabled = false; // Giữ text sắc nét
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Sharpen + contrast
        ctx.filter = 'contrast(1.5) brightness(1.0)';
        ctx.drawImage(canvas, 0, 0);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = roiDataUrl;
    });
  },

  /**
   * OCR một ROI cụ thể
   * @param {string} imageDataUrl - Data URL gốc
   * @param {string} fieldName - Tên field (soCCCD, tenDayDu...)
   * @returns {Promise<string>} - Text đã đọc
   */
  recognizeField: async (imageDataUrl, fieldName) => {
    try {
      const roi = OCRServiceV2.CCCD_ROI[fieldName];
      if (!roi) {
        throw new Error(`ROI not defined for field: ${fieldName}`);
      }
      
      console.log(`🔍 OCR field "${fieldName}" at ROI:`, roi);
      
      // Step 1: Crop ROI
      const croppedROI = await OCRServiceV2.cropROI(imageDataUrl, roi);
      
      // Step 2: Filter black text only
      const filteredROI = await OCRServiceV2.filterBlackText(croppedROI);
      
      // Step 3: Preprocess (scale + sharpen)
      const processedROI = await OCRServiceV2.preprocessROI(filteredROI);
      
      // Step 4: Tesseract OCR
      const worker = await Tesseract.createWorker('vie', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`   ${fieldName}: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      // Config tùy theo field
      const config = OCRServiceV2.getFieldConfig(fieldName);
      
      await worker.setParameters(config);
      
      const { data: { text, confidence } } = await worker.recognize(processedROI);
      
      await worker.terminate();
      
      console.log(`✅ ${fieldName}: "${text.trim()}" (confidence: ${confidence.toFixed(1)}%)`);
      
      return text.trim();
      
    } catch (error) {
      console.error(`❌ OCR field "${fieldName}" failed:`, error.message);
      return null;
    }
  },

  /**
   * Config Tesseract theo từng loại field
   * @param {string} fieldName 
   * @returns {Object} - Tesseract parameters
   */
  getFieldConfig: (fieldName) => {
    const baseConfig = {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE, // Single line cho mỗi field
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      load_system_dawg: '0',
      load_freq_dawg: '0',
    };
    
    // Config riêng cho từng field
    switch (fieldName) {
      case 'soCCCD':
        return {
          ...baseConfig,
          tessedit_char_whitelist: '0123456789', // Chỉ số
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_WORD,
        };
      
      case 'tenDayDu':
        return {
          ...baseConfig,
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
          tessedit_char_whitelist: 'NamNữ',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_WORD,
        };
      
      case 'diaChi':
        return {
          ...baseConfig,
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
  recognizeAll: async (imageSource) => {
    console.log('🚀 Bắt đầu OCR tất cả fields với ROI-based extraction...');
    
    // Convert to data URL nếu cần
    let imageDataUrl = imageSource;
    if (imageSource instanceof File) {
      imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(imageSource);
      });
    }
    
    const fields = ['soCCCD', 'tenDayDu', 'ngaySinh', 'gioiTinh', 'diaChi'];
    
    const results = {};
    
    for (const field of fields) {
      results[field] = await OCRServiceV2.recognizeField(imageDataUrl, field);
    }
    
    // Post-processing
    const parsed = {
      soCCCD: results.soCCCD || null,
      tenDayDu: results.tenDayDu ? results.tenDayDu.toUpperCase().trim() : null,
      ngaySinh: OCRServiceV2.parseDate(results.ngaySinh),
      gioiTinh: results.gioiTinh || null,
      diaChi: results.diaChi || null,
      ngayCap: null, // Mặt sau
      noiCap: null   // Mặt sau
    };
    
    console.log('✅ OCR V2 completed:', parsed);
    
    return parsed;
  },

  /**
   * Parse date từ text OCR
   * @param {string} dateText - "11112003" hoặc "11/11/2003"
   * @returns {string|null} - "DD/MM/YYYY"
   */
  parseDate: (dateText) => {
    if (!dateText) return null;
    
    // Remove non-digit chars
    const digits = dateText.replace(/\D/g, '');
    
    if (digits.length === 8) {
      // DDMMYYYY
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
    } else if (digits.length >= 6) {
      // Fallback: try DMYYYY or DDMYYYY
      const day = digits.substring(0, 2).padStart(2, '0');
      const month = digits.substring(2, 4).padStart(2, '0');
      const year = digits.substring(4);
      return `${day}/${month}/${year}`;
    }
    
    return null;
  }
};

export default OCRServiceV2;

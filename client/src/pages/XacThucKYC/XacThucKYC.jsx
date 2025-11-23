import React, { useState, useEffect } from 'react';
import CameraCapture from '../../components/KYC/CameraCapture';
import OCRService from '../../services/OCRService';
import OCRServiceV2 from '../../services/OCRServiceV2';
import QRCodeService from '../../services/QRCodeService';
import FaceMatchingService from '../../services/FaceMatchingService';
import KYCService from '../../services/KYCService';
import { motion, AnimatePresence } from 'framer-motion';
import './XacThucKYC.css';

const STEPS = {
  INTRO: 0,
  CCCD_FRONT: 1,
  CCCD_BACK: 2,
  SELFIE: 3,
  PROCESSING: 4,
  PREVIEW: 5,
  SUCCESS: 6,
  FAILURE: 7
};

const XacThucKYC = () => {
  const [step, setStep] = useState(STEPS.INTRO);
  const [images, setImages] = useState({
    cccdFront: null,
    cccdBack: null,
    selfie: null
  });
  const [ocrData, setOcrData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [mergedData, setMergedData] = useState(null);
  const [similarity, setSimilarity] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load models on mount
    FaceMatchingService.loadModels().catch(console.error);
  }, []);

  const handleCapture = (imageSrc) => {
    if (step === STEPS.CCCD_FRONT) {
      setImages(prev => ({ ...prev, cccdFront: imageSrc }));
      setStep(STEPS.CCCD_BACK);
    } else if (step === STEPS.CCCD_BACK) {
      setImages(prev => ({ ...prev, cccdBack: imageSrc }));
      setStep(STEPS.SELFIE);
    } else if (step === STEPS.SELFIE) {
      setImages(prev => ({ ...prev, selfie: imageSrc }));
      setStep(STEPS.PROCESSING);
      processKYC(imageSrc);
    }
  };

  const processKYC = async (selfieSrc) => {
    try {
      console.log('🚀 Bắt đầu xử lý KYC...');
      
      // BƯỚC 1: QR Code Scanning (ưu tiên cao nhất)
      console.log('📱 BƯỚC 1: Quét QR code trên CCCD...');
      const qrResult = await QRCodeService.scanFromImage(images.cccdFront);
      setQrData(qrResult);
      
      if (qrResult.success) {
        console.log('✅ QR Code đọc thành công:', qrResult.data);
      } else {
        console.warn('⚠️ Không đọc được QR code, sẽ dùng OCR làm backup');
      }
      
      // BƯỚC 2: OCR Processing V2 (ROI-based extraction)
      console.log('🔤 BƯỚC 2: OCR mặt trước CCCD (ROI-based)...');
      const parsedOCRData = await OCRServiceV2.recognizeAll(images.cccdFront);
      setOcrData(parsedOCRData);
      
      console.log('✅ OCR V2 hoàn tất:', parsedOCRData);
      
      // BƯỚC 3: Merge & Validate (QR + OCR)
      console.log('🔀 BƯỚC 3: Merge dữ liệu QR + OCR...');
      const merged = QRCodeService.mergeAndValidate(
        qrResult.success ? qrResult.data : null,
        parsedOCRData
      );
      setMergedData(merged);
      
      console.log('✅ Merge hoàn tất:', {
        confidence: `${(merged.overallConfidence * 100).toFixed(1)}%`,
        conflicts: merged.conflicts.length
      });
      
      // BƯỚC 4: Face Matching
      console.log('👤 BƯỚC 4: So khớp khuôn mặt...');
      const img1 = await createImage(images.cccdFront);
      const img2 = await createImage(selfieSrc);
      
      const score = await FaceMatchingService.compareFaces(img1, img2);
      setSimilarity(score);
      
      console.log(`✅ Face matching: ${(score * 100).toFixed(1)}%`);
      console.log('🎉 Xử lý KYC hoàn tất!');

      setStep(STEPS.PREVIEW);
    } catch (err) {
      console.error('❌ Lỗi xử lý KYC:', err);
      setError(err.message || 'Lỗi xử lý hình ảnh');
      setStep(STEPS.FAILURE);
    }
  };

  const createImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Convert base64 images to blobs
      const frontBlob = await (await fetch(images.cccdFront)).blob();
      const backBlob = await (await fetch(images.cccdBack)).blob();
      const selfieBlob = await (await fetch(images.selfie)).blob();

      formData.append('cccdFront', frontBlob, 'front.jpg');
      formData.append('cccdBack', backBlob, 'back.jpg');
      formData.append('selfie', selfieBlob, 'selfie.jpg');
      
      // Append all OCR data (with fallbacks)
      formData.append('soCCCD', ocrData?.soCCCD || '');
      formData.append('tenDayDu', ocrData?.tenDayDu || '');
      formData.append('ngaySinh', ocrData?.ngaySinh || ''); // Format: DD/MM/YYYY or YYYY-MM-DD
      formData.append('diaChi', ocrData?.diaChi || '');
      formData.append('ngayCapCCCD', ocrData?.ngayCapCCCD || '');
      formData.append('noiCapCCCD', ocrData?.noiCapCCCD || '');
      formData.append('faceSimilarity', similarity.toString());

      console.log('📤 [KYC] Submitting data:', {
        soCCCD: ocrData?.soCCCD,
        tenDayDu: ocrData?.tenDayDu,
        ngaySinh: ocrData?.ngaySinh,
        diaChi: ocrData?.diaChi,
        ngayCapCCCD: ocrData?.ngayCapCCCD,
        noiCapCCCD: ocrData?.noiCapCCCD,
        similarity: similarity
      });

      await KYCService.xacThuc(formData);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      console.error('❌ [KYC] Submit error:', err);
      setError(err.response?.data?.message || 'Gửi dữ liệu thất bại');
      setStep(STEPS.FAILURE);
    }
  };

  return (
    <div className="kyc-page">
      {/* Hidden QR reader element for html5-qrcode */}
      <div id="qr-reader-hidden" style={{ display: 'none' }}></div>
      
      <div className="kyc-container">
        <AnimatePresence mode="wait">
          {step === STEPS.INTRO && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="kyc-step intro"
            >
              <h1>Xác thực danh tính (eKYC)</h1>
              <p>Vui lòng chuẩn bị CCCD và chụp ảnh chân dung để xác thực tài khoản.</p>
              <button className="btn-primary" onClick={() => setStep(STEPS.CCCD_FRONT)}>
                Bắt đầu ngay
              </button>
            </motion.div>
          )}

          {step === STEPS.CCCD_FRONT && (
            <motion.div key="front" className="kyc-step">
              <CameraCapture 
                label="Chụp mặt trước CCCD" 
                onCapture={handleCapture}
                overlayType="card"
                autoCapture={true}
              />
            </motion.div>
          )}

          {step === STEPS.CCCD_BACK && (
            <motion.div key="back" className="kyc-step">
              <CameraCapture 
                label="Chụp mặt sau CCCD" 
                onCapture={handleCapture}
                overlayType="card"
                autoCapture={true}
              />
            </motion.div>
          )}

          {step === STEPS.SELFIE && (
            <motion.div key="selfie" className="kyc-step">
              <CameraCapture 
                label="Chụp ảnh chân dung" 
                onCapture={handleCapture}
                overlayType="face"
                autoCapture={true}
              />
            </motion.div>
          )}

          {step === STEPS.PROCESSING && (
            <motion.div key="processing" className="kyc-step processing">
              <div className="spinner"></div>
              <p>Đang xử lý hình ảnh...</p>
            </motion.div>
          )}

          {step === STEPS.PREVIEW && (
            <motion.div key="preview" className="kyc-step preview">
              <h2>Kiểm tra thông tin</h2>
              
              {/* Overall Confidence Badge */}
              {mergedData && (
                <div className={`confidence-badge ${
                  mergedData.overallConfidence >= 0.9 ? 'high' : 
                  mergedData.overallConfidence >= 0.7 ? 'medium' : 'low'
                }`}>
                  <span className="confidence-icon">
                    {mergedData.overallConfidence >= 0.9 ? '✅' : 
                     mergedData.overallConfidence >= 0.7 ? '⚠️' : '❌'}
                  </span>
                  <span className="confidence-text">
                    Độ chính xác: {(mergedData.overallConfidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              
              {/* QR Detection Warning */}
              {qrData && !qrData.success && (
                <div className="qr-warning">
                  <strong>⚠️ Không phát hiện QR code trên CCCD</strong>
                  <p>Hệ thống đang sử dụng OCR làm nguồn dữ liệu duy nhất. Độ chính xác có thể thấp hơn.</p>
                  {qrData.attempts && qrData.attempts.length > 0 && (
                    <details style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                      <summary>Chi tiết {qrData.attempts.length} lần thử quét QR</summary>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                        {qrData.attempts.map((attempt, idx) => (
                          <li key={idx}>
                            {attempt.method}: {attempt.error}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
              
              {/* Conflicts Warning */}
              {mergedData?.hasConflicts && (
                <div className="conflicts-warning">
                  <strong>⚠️ Phát hiện {mergedData.conflicts.length} xung đột dữ liệu</strong>
                  <ul>
                    {mergedData.conflicts.map((conflict, idx) => (
                      <li key={idx}>
                        <strong>{conflict.field}:</strong> QR="{conflict.qrValue}" vs OCR="{conflict.ocrValue}" 
                        (Similarity: {(conflict.similarity * 100).toFixed(0)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="preview-content">
                <div className="preview-images">
                  <div className="image-preview">
                    <label>Mặt trước CCCD</label>
                    <img src={images.cccdFront} alt="Front" />
                  </div>
                  <div className="image-preview">
                    <label>Mặt sau CCCD</label>
                    <img src={images.cccdBack} alt="Back" />
                  </div>
                  <div className="image-preview">
                    <label>Ảnh chân dung</label>
                    <img src={images.selfie} alt="Selfie" />
                  </div>
                </div>
                
                <div className="preview-data">
                  {/* Merged Data - Data cuối cùng (QR ưu tiên) */}
                  <div className="data-section merged">
                    <h3>✅ Thông tin cuối cùng (Đã xác thực)</h3>
                    <div className="data-row">
                      <span className="label">Số CCCD:</span>
                      <span className="value">{mergedData?.finalData?.soCCCD || 'N/A'}</span>
                      <span className="source">{mergedData?.sources?.soCCCD}</span>
                      <span className={`confidence ${mergedData?.confidence?.soCCCD >= 0.9 ? 'high' : 'medium'}`}>
                        {(mergedData?.confidence?.soCCCD * 100).toFixed(0)}%
                      </span>
                    </div>
                    {mergedData?.finalData?.soCMND && (
                      <div className="data-row">
                        <span className="label">Số CMND cũ:</span>
                        <span className="value">{mergedData.finalData.soCMND}</span>
                        <span className="source">QR_CODE</span>
                      </div>
                    )}
                    <div className="data-row">
                      <span className="label">Họ và tên:</span>
                      <span className="value">{mergedData?.finalData?.tenDayDu || 'N/A'}</span>
                      <span className="source">{mergedData?.sources?.tenDayDu}</span>
                      <span className={`confidence ${mergedData?.confidence?.tenDayDu >= 0.9 ? 'high' : 'medium'}`}>
                        {(mergedData?.confidence?.tenDayDu * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="label">Ngày sinh:</span>
                      <span className="value">{mergedData?.finalData?.ngaySinh || 'N/A'}</span>
                      <span className="source">{mergedData?.sources?.ngaySinh}</span>
                      <span className={`confidence ${mergedData?.confidence?.ngaySinh >= 0.9 ? 'high' : 'medium'}`}>
                        {(mergedData?.confidence?.ngaySinh * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="label">Giới tính:</span>
                      <span className="value">{mergedData?.finalData?.gioiTinh || 'N/A'}</span>
                      <span className="source">{mergedData?.sources?.gioiTinh}</span>
                    </div>
                    <div className="data-row">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">{mergedData?.finalData?.diaChi || 'N/A'}</span>
                      <span className="source">{mergedData?.sources?.diaChi}</span>
                      <span className={`confidence ${mergedData?.confidence?.diaChi >= 0.9 ? 'high' : 'medium'}`}>
                        {(mergedData?.confidence?.diaChi * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="label">Ngày cấp:</span>
                      <span className="value">{mergedData?.finalData?.ngayCap || 'N/A'}</span>
                      <span className="source">{mergedData?.sources?.ngayCap}</span>
                      <span className={`confidence ${mergedData?.confidence?.ngayCap >= 0.9 ? 'high' : 'medium'}`}>
                        {(mergedData?.confidence?.ngayCap * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="label">Nơi cấp:</span>
                      <span className="value">{mergedData?.finalData?.noiCap || 'N/A'}</span>
                      <span className="source">{mergedData?.sources?.noiCap}</span>
                    </div>
                  </div>
                  
                  {/* QR Code Data */}
                  <div className="data-section qr">
                    <h3>📱 Dữ liệu từ QR Code</h3>
                    {qrData?.success ? (
                      <>
                        <div className="data-row">
                          <span className="label">Số CCCD:</span>
                          <span className="value">{qrData.data?.soCCCD || 'N/A'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Số CMND cũ:</span>
                          <span className="value">{qrData.data?.soCMND || 'Không có'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Họ và tên:</span>
                          <span className="value">{qrData.data?.tenDayDu || 'N/A'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Ngày sinh:</span>
                          <span className="value">{qrData.data?.ngaySinh || 'N/A'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Giới tính:</span>
                          <span className="value">{qrData.data?.gioiTinh || 'N/A'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Địa chỉ:</span>
                          <span className="value">{qrData.data?.diaChi || 'N/A'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Ngày cấp:</span>
                          <span className="value">{qrData.data?.ngayCap || 'N/A'}</span>
                        </div>
                      </>
                    ) : (
                      <p className="error-text">❌ {qrData?.error || 'Không đọc được QR code'}</p>
                    )}
                  </div>
                  
                  {/* OCR Data */}
                  <div className="data-section ocr">
                    <h3>🔤 Dữ liệu từ OCR</h3>
                    <div className="data-row">
                      <span className="label">Số CCCD:</span>
                      <span className="value">{ocrData?.soCCCD || 'Không đọc được'}</span>
                    </div>
                    <div className="data-row">
                      <span className="label">Họ và tên:</span>
                      <span className="value">{ocrData?.tenDayDu || 'Không đọc được'}</span>
                    </div>
                    <div className="data-row">
                      <span className="label">Ngày sinh:</span>
                      <span className="value">{ocrData?.ngaySinh || 'Không đọc được'}</span>
                    </div>
                    <div className="data-row">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">{ocrData?.diaChi || 'Không đọc được'}</span>
                    </div>
                    <div className="data-row">
                      <span className="label">Ngày cấp:</span>
                      <span className="value">{ocrData?.ngayCap || 'Không đọc được'}</span>
                    </div>
                    <div className="data-row">
                      <span className="label">Nơi cấp:</span>
                      <span className="value">{ocrData?.noiCapCCCD || 'Không đọc được'}</span>
                    </div>
                  </div>
                  
                  <div className="data-section verification-status">
                    <h3>🔐 Kết quả xác thực</h3>
                    <div className="similarity-meter">
                      <div className="similarity-label">Độ khớp khuôn mặt</div>
                      <div className="similarity-bar">
                        <div 
                          className="similarity-fill" 
                          style={{ 
                            width: `${similarity * 100}%`,
                            backgroundColor: similarity >= 0.85 ? '#10b981' : 
                                           similarity >= 0.6 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                      <div className="similarity-value">
                        {(similarity * 100).toFixed(2)}%
                        {similarity >= 0.85 && <span className="status-badge success">✓ Đạt yêu cầu</span>}
                        {similarity >= 0.6 && similarity < 0.85 && <span className="status-badge warning">⚠ Cần xem xét</span>}
                        {similarity < 0.6 && <span className="status-badge error">✗ Không đạt</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="actions">
                <button className="btn-secondary" onClick={() => setStep(STEPS.INTRO)}>Làm lại</button>
                <button className="btn-primary" onClick={handleSubmit}>Xác nhận gửi</button>
              </div>
            </motion.div>
          )}

          {step === STEPS.SUCCESS && (
            <motion.div key="success" className="kyc-step success">
              <div className="success-icon">✅</div>
              <h2>Xác thực thành công!</h2>
              <p>Thông tin của bạn đã được gửi đi.</p>
            </motion.div>
          )}
          
          {step === STEPS.FAILURE && (
            <motion.div key="failure" className="kyc-step failure">
              <h2>Xác thực thất bại</h2>
              <p>{error}</p>
              <button className="btn-primary" onClick={() => setStep(STEPS.INTRO)}>Thử lại</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default XacThucKYC;

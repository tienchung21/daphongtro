import React, { useMemo, useState } from 'react';
import OCRServiceV2 from '../../services/OCRServiceV2';
import QRCodeService from '../../services/QRCodeService';

// Default QR regions (same as interactive ROI editor)
const DEFAULT_QR_REGIONS = {
  full: { x: 0, y: 0, width: 1, height: 1 },
  trl: { x: 0.6924438618283316, y: 0.0074855560260057, width: 0.3, height: 0.4 },
  trm: { x: 0.7244438618283315, y: 0.02501127822470541, width: 0.26, height: 0.32 },
  trs: { x: 0.7942411152644188, y: 0.09223411162860624, width: 0.14, height: 0.22 },
  tc: { x: 0.7476492301647519, y: 0.04126173970120754, width: 0.22, height: 0.32 }
};

const defaultPayload = {
  ocr: OCRServiceV2.CCCD_ROI,
  qrRegions: DEFAULT_QR_REGIONS
};

const styles = {
  page: { padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' },
  label: { display: 'block', fontWeight: 600, marginBottom: 6 },
  textarea: { width: '100%', minHeight: '260px', fontFamily: 'Consolas, monospace', fontSize: 13, borderRadius: 8, border: '1px solid #d1d5db', padding: 10 },
  btn: { padding: '10px 14px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  btnGhost: { padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' },
  status: { background: '#0f172a', color: '#e2e8f0', padding: '10px 12px', borderRadius: 8, fontFamily: 'Consolas, monospace', fontSize: 12 }
};

const VisionOverlay = ({ image, ocr, qr }) => {
  const boxes = [
    { key: 'soCCCD', label: '1. OCR: Số', roi: ocr?.soCCCD, type: 'ocr' },
    { key: 'tenDayDu', label: '2. OCR: Họ tên', roi: ocr?.tenDayDu, type: 'ocr' },
    { key: 'ngaySinh', label: '3. OCR: Ngày sinh', roi: ocr?.ngaySinh, type: 'ocr' },
    { key: 'gioiTinh', label: '4. OCR: Giới tính', roi: ocr?.gioiTinh, type: 'ocr' },
    { key: 'diaChi', label: '5. OCR: Địa chỉ', roi: ocr?.diaChi, type: 'ocr' },
    { key: 'faceImage', label: '6. OCR: Face ROI', roi: ocr?.faceImage, type: 'ocr' },
    { key: 'qrCode', label: '7. OCR: QR slot', roi: ocr?.qrCode, type: 'ocr' },
    { key: 'qr-full', label: 'A. QR full', roi: qr?.full, type: 'qr' },
    { key: 'qr-trl', label: 'B. QR top-right large', roi: qr?.trl, type: 'qr' },
    { key: 'qr-trm', label: 'C. QR top-right medium', roi: qr?.trm, type: 'qr' },
    { key: 'qr-trs', label: 'D. QR top-right small', roi: qr?.trs, type: 'qr' },
    { key: 'qr-tc', label: 'E. QR top-center', roi: qr?.tc, type: 'qr' }
  ].filter(b => b.roi);

  const boxStyle = (roi, type) => ({
    position: 'absolute',
    left: `${roi.x * 100}%`,
    top: `${roi.y * 100}%`,
    width: `${roi.width * 100}%`,
    height: `${roi.height * 100}%`,
    border: `2px dashed ${type === 'ocr' ? '#0ea5e9' : '#f97316'}`,
    borderRadius: '8px',
    boxSizing: 'border-box'
  });

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '63%', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundImage: `url(${image})`, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      {boxes.map((b, idx) => (
        <div key={b.key} style={{ ...boxStyle(b.roi, b.type), pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute',
            top: -10,
            left: -10,
            background: b.type === 'ocr' ? '#0ea5e9' : '#f97316',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700
          }}>
            {b.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const KycDebugPlayground = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [qrOnlySrc, setQrOnlySrc] = useState(null);
  const [roiText, setRoiText] = useState(JSON.stringify(defaultPayload, null, 2));
  const [status, setStatus] = useState('');
  const [ocrResult, setOcrResult] = useState(null);
  const [qrResult, setQrResult] = useState(null);
  const [qrOnlyResult, setQrOnlyResult] = useState(null);
  const [merged, setMerged] = useState(null);
  const [error, setError] = useState(null);
  const [qrOnlyStatus, setQrOnlyStatus] = useState('');
  const [qrOnlyError, setQrOnlyError] = useState(null);

  const parsedRoi = useMemo(() => {
    try {
      return JSON.parse(roiText);
    } catch (e) {
      return null;
    }
  }, [roiText]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleQrOnlyFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setQrOnlySrc(reader.result);
    reader.readAsDataURL(file);
    setQrOnlyResult(null);
    setQrOnlyError(null);
    setQrOnlyStatus('');
  };

  const runAll = async () => {
    if (!imageSrc) {
      setError('Chưa có ảnh CCCD mặt trước');
      return;
    }
    if (!parsedRoi) {
      setError('ROI JSON không hợp lệ');
      return;
    }
    setError(null);
    setStatus('Warping + OCR...');
    try {
      const ocr = await OCRServiceV2.recognizeAll(imageSrc, parsedRoi.ocr || {});
      setOcrResult(ocr);
      const warped = ocr.warpedImage || imageSrc;
      setStatus('Scanning QR...');

      const baseQrRegions = parsedRoi.qrRegions
        ? Object.entries(parsedRoi.qrRegions).map(([name, roi]) => ({ name, ...roi }))
        : [];
      const qrSlot = parsedRoi.ocr?.qrCode;
      const qrRegions = qrSlot
        ? [{ name: 'slot', ...qrSlot }, ...baseQrRegions]
        : baseQrRegions;
      const qr = await QRCodeService.scanFromImage(warped, qrRegions);
      setQrResult(qr);

      setStatus('Merging...');
      const mergedRes = QRCodeService.mergeAndValidate(qr.success ? qr.data : null, ocr, 0.5);
      setMerged(mergedRes);
      setStatus('Hoàn tất.');
    } catch (e) {
      setError(e.message || 'Lỗi xử lý');
      setStatus('');
    }
  };

  const copyPayload = () => {
    if (!merged?.finalData) return;
    const payload = {
      ...merged.finalData,
      sources: merged.sources,
      confidence: merged.confidence,
      qrSuccess: qrResult?.success,
      qrAttempts: qrResult?.attempts
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setStatus('Đã copy payload trích xuất.');
  };

  const decodeQrOnly = async () => {
    if (!qrOnlySrc) {
      setQrOnlyError('Chưa có ảnh QR');
      return;
    }
    setQrOnlyError(null);
    setQrOnlyStatus('Đang quét QR riêng (jsQR full-image)...');
    try {
      const qr = await QRCodeService.scanRawFromImage(qrOnlySrc);
      setQrOnlyResult(qr);
      setQrOnlyStatus(qr.success ? '✅ Đã quét QR riêng' : '❌ Không tìm thấy QR (raw)');
    } catch (e) {
      setQrOnlyError(e.message || 'Lỗi quét QR');
      setQrOnlyStatus('');
    }
  };

  return (
    <div style={styles.page}>
      <h2>ROI / QR Debug Playground</h2>
      <p>Upload mặt trước CCCD, dán ROI JSON (từ nút Copy ROI JSON), chạy OCR + QR để xem ngay giá trị và payload gửi đi.</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <label style={styles.label}>1) Ảnh CCCD</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {imageSrc && <img src={imageSrc} alt="preview" style={{ width: '100%', marginTop: 12, borderRadius: 10 }} />}
        </div>

        <div style={styles.card}>
          <label style={styles.label}>2) ROI JSON (OCR + qrRegions)</label>
          <textarea
            style={styles.textarea}
            value={roiText}
            onChange={(e) => setRoiText(e.target.value)}
          />
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button style={styles.btn} onClick={runAll}>Chạy OCR + QR</button>
            <button style={styles.btnGhost} onClick={() => setRoiText(JSON.stringify(defaultPayload, null, 2))}>Reset ROI mặc định</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={styles.status}>
              {status || 'Nhấn "Chạy" để bắt đầu.'}
              {error && ` | Lỗi: ${error}`}
            </div>
            {!parsedRoi && <div style={{ color: '#b91c1c', marginTop: 6 }}>JSON không hợp lệ.</div>}
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: 16 }}>
        <h3>🧪 Quét QR riêng (ảnh crop QR hoặc ảnh QR thuần)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          <div>
            <label style={styles.label}>Upload ảnh QR</label>
            <input type="file" accept="image/*" onChange={handleQrOnlyFile} />
            {qrOnlySrc && <img src={qrOnlySrc} alt="qr-preview" style={{ width: '100%', marginTop: 10, borderRadius: 8 }} />}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button style={styles.btn} onClick={decodeQrOnly}>Quét QR riêng</button>
              <div style={styles.status}>{qrOnlyStatus || 'Chưa chạy'}</div>
            </div>
            {qrOnlyError && <div style={{ color: '#b91c1c', marginBottom: 6 }}>{qrOnlyError}</div>}
            {qrOnlyResult && (
              <pre style={{ ...styles.status, background: '#f8fafc', color: '#0f172a' }}>{JSON.stringify(qrOnlyResult, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>

      {ocrResult && (
        <div style={{ ...styles.card, marginTop: 16 }}>
          <h3>🛰️ Vision overlay (warp nếu có)</h3>
          <VisionOverlay image={ocrResult.warpedImage || imageSrc} ocr={parsedRoi?.ocr} qr={parsedRoi?.qrRegions} />
        </div>
      )}

      {(ocrResult || qrResult) && (
        <div style={{ ...styles.card, marginTop: 16 }}>
          <h3>📋 Kết quả thô</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={styles.label}>OCR fields</div>
              <pre style={{ ...styles.status, background: '#f8fafc', color: '#0f172a' }}>{JSON.stringify(ocrResult, null, 2)}</pre>
            </div>
            <div>
              <div style={styles.label}>QR result</div>
              <pre style={{ ...styles.status, background: '#f8fafc', color: '#0f172a' }}>{JSON.stringify(qrResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {merged && (
        <div style={{ ...styles.card, marginTop: 16 }}>
          <h3>✅ Payload gửi đi</h3>
          <pre style={{ ...styles.status, background: '#f8fafc', color: '#0f172a' }}>
{JSON.stringify(merged.finalData, null, 2)}
          </pre>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button style={styles.btn} onClick={copyPayload}>Copy payload</button>
            <div>Risk: {merged.riskLevel} | Score: {merged.riskScore.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycDebugPlayground;

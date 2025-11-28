import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import './CameraCapture.css';
import { motion, AnimatePresence } from 'framer-motion';
import CardDetectionService from '../../services/CardDetectionService';
import FaceAlignmentService from '../../services/FaceAlignmentService';

const CameraCapture = ({ onCapture, label, overlayType = 'card', autoCapture = false }) => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user"); // "user" (front) or "environment" (back)
  const [isAligned, setIsAligned] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [alignmentStatus, setAlignmentStatus] = useState('Đang khởi động...');
  const [confidence, setConfidence] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const alignmentTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const consecutiveAlignedFrames = useRef(0);

  // Cấu hình độ phân giải cao nhất có thể (4K > 1440p > 1080p > 720p)
  const videoConstraints = {
    width: { ideal: 3840, min: 1280 },  // 4K ideal, min 720p
    height: { ideal: 2160, min: 720 },  // 4K ideal, min 720p
    facingMode: facingMode,
    aspectRatio: { ideal: 16 / 9 }
  };

  // Load face detection models nếu là selfie
  useEffect(() => {
    if (overlayType === 'face' && autoCapture) {
      FaceAlignmentService.loadModels('/models')
        .then(loaded => {
          setModelsLoaded(loaded);
          if (loaded) {
            setAlignmentStatus('✓ Sẵn sàng - Nhìn vào camera');
          } else {
            setAlignmentStatus('❌ Lỗi tải models');
          }
        });
    }
  }, [overlayType, autoCapture]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (alignmentTimerRef.current) clearTimeout(alignmentTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, []);

  // Real-time detection loop
  useEffect(() => {
    if (!autoCapture || !webcamRef.current) return;

    const checkAlignment = async () => {
      const video = webcamRef.current?.video;

      // Safety check: Ensure video is ready and has dimensions
      if (!video || video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
        setIsAligned(false);
        setAlignmentStatus('⊙ Đang chờ camera...');
        setConfidence(0);
        return;
      }

      let result;

      try {
        if (overlayType === 'card') {
          // CCCD detection using edge detection
          result = await CardDetectionService.analyzeFrame(video);
        } else if (overlayType === 'face') {
          // Face detection using face-api.js
          if (!modelsLoaded) {
            setAlignmentStatus('⏳ Đang tải AI models...');
            return;
          }
          // Additional safety check for face detection to prevent Box.constructor error
          if (video.videoWidth === 0 || video.videoHeight === 0) return;

          result = await FaceAlignmentService.analyzeFace(video);
        } else {
          // Fallback - simple readiness check
          result = {
            aligned: video.videoWidth > 0 && video.videoHeight > 0,
            confidence: 1,
            reason: 'Sẵn sàng chụp'
          };
        }

        setConfidence(result.confidence);
        setAlignmentStatus(result.reason);

        // Yêu cầu 3 frames liên tiếp aligned để tránh false positive
        if (result.aligned) {
          consecutiveAlignedFrames.current += 1;

          if (consecutiveAlignedFrames.current >= 3) {
            setIsAligned(true);

            // Chỉ start countdown 1 lần
            if (!countdownIntervalRef.current && countdown === null) {
              startCountdown();
            }
          }
        } else {
          consecutiveAlignedFrames.current = 0;
          setIsAligned(false);

          // Cancel countdown nếu user di chuyển
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            setCountdown(null);
          }
        }
      } catch (error) {
        console.error('Detection error:', error);
        // Don't show error to user immediately to avoid flickering, just retry
        setIsAligned(false);
      }
    };

    // Run detection every 200ms (5 FPS - balance between responsiveness and performance)
    detectionIntervalRef.current = setInterval(checkAlignment, 200);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [autoCapture, overlayType, modelsLoaded, countdown]);

  const startCountdown = () => {
    // Clear existing timers
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let count = 3;
    setCountdown(count);

    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownIntervalRef.current);
        setCountdown(null);
        capture();
      }
    }, 1000);
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    // Nếu là card capture, crop ảnh theo vùng overlay (tỷ lệ 1.586:1)
    if (overlayType === 'card') {
      try {
        const img = new Image();
        img.src = imageSrc;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Overlay chiếm 85% width, aspect-ratio 1.586:1
        const overlayWidthRatio = 0.85;
        const cardAspectRatio = 1.586;

        // Tính toán vùng crop từ ảnh gốc
        const cropWidth = img.width * overlayWidthRatio;
        const cropHeight = cropWidth / cardAspectRatio;
        const cropX = (img.width - cropWidth) / 2;
        const cropY = (img.height - cropHeight) / 2;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,  // source
          0, 0, cropWidth, cropHeight            // destination
        );

        const croppedImage = canvas.toDataURL('image/jpeg', 1.0);
        onCapture(croppedImage);
      } catch (e) {
        console.warn('Crop failed, using original:', e);
        onCapture(imageSrc);
      }
    } else {
      // Face capture - giữ nguyên
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture, overlayType]);

  const switchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setIsAligned(false);
    setCountdown(null);
    consecutiveAlignedFrames.current = 0;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  return (
    <div className={`camera-container ${overlayType === 'face' ? 'fullscreen' : ''}`}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        screenshotQuality={1.0}
        videoConstraints={videoConstraints}
        className="webcam-video"
        forceScreenshotSourceSize={true}
      />

      {/* Overlay Frame */}
      <div className={`overlay-frame ${overlayType} ${isAligned ? 'aligned' : ''}`}>
        <motion.div
          className="scanning-border"
          animate={{
            scale: [1, 1.02, 1],
            opacity: isAligned ? [0.9, 1, 0.9] : [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Corner guides */}
        {overlayType === 'card' && (
          <>
            <div className="corner-guide top-left"></div>
            <div className="corner-guide top-right"></div>
            <div className="corner-guide bottom-left"></div>
            <div className="corner-guide bottom-right"></div>
          </>
        )}
      </div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            className="countdown-overlay"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            key={countdown}
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      {autoCapture && (
        <div className={`alignment-status ${isAligned ? 'aligned' : 'searching'}`}>
          <div className="status-text">{alignmentStatus}</div>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{
                width: `${confidence * 100}%`,
                backgroundColor: confidence >= 0.75 ? '#10b981' : confidence >= 0.5 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="camera-controls">
        <p className="camera-instruction">{label}</p>
        <div className="controls-row">
          {/* Nút chuyển camera - Luôn hiển thị */}
          <button
            onClick={switchCamera}
            className="switch-camera-btn"
            title={`Đổi sang camera ${facingMode === 'user' ? 'sau' : 'trước'}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Camera body */}
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              {/* Rotating arrows */}
              <path d="M14.5 10.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2" className="arrow-path" />
              <path d="M9.5 13.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h2" className="arrow-path" />
              {/* Arrow tips */}
              <path d="M12 15l1.5-1.5L12 12" className="arrow-tip" />
              <path d="M12 9l-1.5 1.5L12 12" className="arrow-tip" />
            </svg>
            <span className="switch-label">{facingMode === 'user' ? 'Trước' : 'Sau'}</span>
          </button>

          {/* Nút chụp - Chỉ hiện khi không auto-capture */}
          {!autoCapture && (
            <button onClick={capture} className="capture-btn">
              <div className="capture-btn-inner"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;

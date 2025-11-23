// Using face-api.js for face detection and matching
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

const FaceMatchingService = {
  loadModels: async () => {
    console.log('[FaceMatchingService] 🔄 Loading models from:', MODEL_URL);
    
    // Check if models already loaded
    if (faceapi.nets.ssdMobilenetv1.isLoaded) {
      console.log('[FaceMatchingService] ✅ Models already loaded, skipping');
      return;
    }
    
    try {
      // Load models sequentially to avoid race conditions
      console.log('[FaceMatchingService] Loading SSD MobileNet V1...');
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      console.log('[FaceMatchingService] ✅ SSD MobileNet V1 loaded');
      
      console.log('[FaceMatchingService] Loading Face Landmark 68...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log('[FaceMatchingService] ✅ Face Landmark 68 loaded');
      
      console.log('[FaceMatchingService] Loading Face Recognition...');
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log('[FaceMatchingService] ✅ Face Recognition loaded');
      
      console.log('[FaceMatchingService] Loading Tiny Face Detector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log('[FaceMatchingService] ✅ Tiny Face Detector loaded');
      
      console.log('[FaceMatchingService] 🎉 All models loaded successfully!');
    } catch (error) {
      console.error('[FaceMatchingService] ❌ Model loading error:', error);
      console.error('[FaceMatchingService] Error details:', {
        message: error.message,
        stack: error.stack,
        modelUrl: MODEL_URL
      });
      throw new Error(`Failed to load face detection models: ${error.message}`);
    }
  },

  detectFace: async (imageElement) => {
    const detection = await faceapi.detectSingleFace(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection;
  },

  compareFaces: async (imageElement1, imageElement2) => {
    const detection1 = await FaceMatchingService.detectFace(imageElement1);
    const detection2 = await FaceMatchingService.detectFace(imageElement2);

    if (!detection1 || !detection2) {
      throw new Error('Không tìm thấy khuôn mặt trong một hoặc cả hai ảnh');
    }

    const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);
    // Distance: 0.0 is same face, > 0.6 is different
    // Similarity = 1 - distance (roughly)
    return 1 - distance;
  }
};

export default FaceMatchingService;

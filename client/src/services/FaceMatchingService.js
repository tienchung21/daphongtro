// Using face-api.js for face detection and matching
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

const FaceMatchingService = {
  loadModels: async () => {
    console.log('[FaceMatchingService] 🔄 Loading models from:', MODEL_URL);

    if (faceapi.nets.ssdMobilenetv1.isLoaded) {
      return;
    }

    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      ]);
      console.log('[FaceMatchingService] 🎉 All models loaded successfully!');
    } catch (error) {
      console.error('[FaceMatchingService] ❌ Model loading error:', error);
      throw new Error(`Failed to load face detection models: ${error.message}`);
    }
  },

  detectFace: async (imageElement) => {
    if (
      !imageElement ||
      !Number.isFinite(imageElement.width) ||
      !Number.isFinite(imageElement.height) ||
      imageElement.width <= 1 ||
      imageElement.height <= 1
    ) {
      return null;
    }

    // Resize if too large (max 800px width for detection)
    let input = imageElement;
    if (imageElement.width > 800) {
      const canvas = document.createElement('canvas');
      const scale = 800 / imageElement.width;
      canvas.width = 800;
      canvas.height = Math.floor(imageElement.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
      input = canvas;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      // Guard against invalid boxes returned from upstream
      const b = detection?.detection?.box || detection?.box;
      const dims = detection?.detection?.imageDims || detection?.imageDims;
      const isBoxValid = b && [b.x, b.y, b.width, b.height].every(Number.isFinite);
      const isDimsValid = dims && [dims.width, dims.height].every(Number.isFinite);
      if (!isBoxValid || !isDimsValid) {
        return null;
      }
      return detection;
    } catch (error) {
      console.error('[FaceMatchingService] ❌ Detection error:', error);
      return null;
    }
  },

  /**
   * Compare faces and return distance + similarity
   * @param {HTMLImageElement} imageElement1 - Card image (or cropped face)
   * @param {HTMLImageElement} imageElement2 - Selfie image
   */
  compareFaces: async (imageElement1, imageElement2) => {
    const detection1 = await FaceMatchingService.detectFace(imageElement1);
    const detection2 = await FaceMatchingService.detectFace(imageElement2);

    if (!detection1 || !detection2) {
      throw new Error('Không tìm thấy khuôn mặt trong một hoặc cả hai ảnh');
    }

    const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);

    // Map distance to similarity (0-1) for UI
    // Distance 0.0 -> Sim 1.0
    // Distance 0.6 -> Sim 0.4 (approx)
    // Formula: Sim = 1 / (1 + distance) or just 1 - distance
    // Let's use 1 - distance but clamped
    const similarity = Math.max(0, 1 - distance);

    return {
      distance: distance,
      similarity: similarity,
      match: distance < 0.6
    };
  }
};

export default FaceMatchingService;

const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, '../client/public/models');
const tessDir = path.join(__dirname, '../client/public/tessdata');

// ⚠️ FIX: Sử dụng jsdelivr CDN thay vì GitHub raw để tránh file bị truncate
const filesToDownload = [
  // SSD Mobilenet V1 (Expected size: ~5.4 MB)
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/ssd_mobilenetv1_model.bin',
    dest: path.join(modelsDir, 'ssd_mobilenetv1_model.bin'),
    expectedSize: 5400000 // ~5.4 MB
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/ssd_mobilenetv1_model-weights_manifest.json',
    dest: path.join(modelsDir, 'ssd_mobilenetv1_model-weights_manifest.json')
  },
  // Face Landmark 68 (Expected size: ~350 KB)
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/face_landmark_68_model.bin',
    dest: path.join(modelsDir, 'face_landmark_68_model.bin'),
    expectedSize: 350000 // ~350 KB
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/face_landmark_68_model-weights_manifest.json',
    dest: path.join(modelsDir, 'face_landmark_68_model-weights_manifest.json')
  },
  // Face Recognition (Expected size: ~6.2 MB)
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/face_recognition_model.bin',
    dest: path.join(modelsDir, 'face_recognition_model.bin'),
    expectedSize: 6200000 // ~6.2 MB
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/face_recognition_model-weights_manifest.json',
    dest: path.join(modelsDir, 'face_recognition_model-weights_manifest.json')
  },
  // Tiny Face Detector (Expected size: ~190 KB)
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/tiny_face_detector_model.bin',
    dest: path.join(modelsDir, 'tiny_face_detector_model.bin'),
    expectedSize: 190000 // ~190 KB
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/tiny_face_detector_model-weights_manifest.json',
    dest: path.join(modelsDir, 'tiny_face_detector_model-weights_manifest.json')
  },
  // Tesseract Data (Expected size: ~11.2 MB)
  {
    url: 'https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/vie.traineddata.gz',
    dest: path.join(tessDir, 'vie.traineddata.gz'),
    expectedSize: 11200000 // ~11.2 MB
  }
];

const downloadFile = (url, dest, expectedSize) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    let downloadedBytes = 0;

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      }
    }, (response) => {
      // Follow redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlink(dest, () => { });
        downloadFile(response.headers.location, dest, expectedSize).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => { });
        reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
        return;
      }

      // Track download progress
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          const fileSizeKB = (stats.size / 1024).toFixed(2);

          // Validate file size if expected size is provided
          if (expectedSize && stats.size < expectedSize * 0.9) { // Allow 10% tolerance
            console.log(`⚠️  Warning: ${path.basename(dest)} might be incomplete (${fileSizeKB} KB)`);
            console.log(`   Expected: ~${(expectedSize / 1024).toFixed(0)} KB, Got: ${fileSizeKB} KB`);
          } else {
            console.log(`✅ Downloaded: ${path.basename(dest)} (${fileSizeKB} KB)`);
          }

          resolve();
        });
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
};

const main = async () => {
  console.log('🚀 Starting re-download of KYC model files...');
  console.log('📦 Source: @vladmandic/face-api (fork with proper CDN support)');
  console.log('');

  // Xóa các file cũ bị corrupt
  console.log('🗑️  Cleaning up old corrupted files...');
  const oldFiles = [
    path.join(modelsDir, 'ssd_mobilenetv1_model-shard1'),
    path.join(modelsDir, 'face_recognition_model-shard1'),
    path.join(modelsDir, 'face_landmark_68_model-shard1'),
    path.join(modelsDir, 'tiny_face_detector_model-shard1')
  ];

  for (const file of oldFiles) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`   Deleted: ${path.basename(file)}`);
    }
  }
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const file of filesToDownload) {
    try {
      await downloadFile(file.url, file.dest, file.expectedSize);
      successCount++;
    } catch (error) {
      console.error(`❌ Error downloading ${path.basename(file.dest)}:`, error.message);
      errorCount++;
    }
  }

  console.log('');
  console.log('✨ Download Summary:');
  console.log(`   ✅ Success: ${successCount}/${filesToDownload.length}`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount}`);
  }
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Restart dev servers (client & server)');
  console.log('   2. Navigate to /xac-thuc-kyc');
  console.log('   3. Check browser console for model loading status');
};

main();

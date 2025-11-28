/**
 * ImageProcessingService - Xử lý ảnh nâng cao dùng OpenCV.js
 * Hỗ trợ: Warping (Perspective Transform), Deskewing, Adaptive Thresholding
 */

const ImageProcessingService = {
    isLoaded: false,

    /**
     * Kiểm tra và đợi OpenCV load xong
     */
    loadOpenCV: async () => {
        if (ImageProcessingService.isLoaded) return true;

        return new Promise((resolve, reject) => {
            const check = () => {
                if (window.cv && window.cv.imread) {
                    console.log('✅ OpenCV.js loaded successfully');
                    ImageProcessingService.isLoaded = true;
                    resolve(true);
                } else {
                    // Check again in 50ms
                    setTimeout(check, 50);
                }
            };

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!ImageProcessingService.isLoaded) {
                    console.warn('⚠️ OpenCV load timeout, some features may be disabled');
                    // Don't reject, just resolve false to allow fallback
                    resolve(false);
                }
            }, 10000);

            check();
        });
    },

    /**
     * Warp ảnh CCCD về góc nhìn thẳng (canonical view)
     * @param {string} imageDataUrl - Ảnh gốc
     * @returns {Promise<string>} - Ảnh đã warp (1000x630)
     */
    /**
     * Warp ảnh CCCD về góc nhìn thẳng (canonical view)
     * @param {string} imageDataUrl - Ảnh gốc
     * @returns {Promise<string>} - Ảnh đã warp (1000x630)
     */
    warpPerspective: async (imageDataUrl) => {
        if (!await ImageProcessingService.loadOpenCV()) {
            console.warn('⚠️ OpenCV not available, skipping warp');
            return imageDataUrl;
        }

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const cv = window.cv;
                    const src = cv.imread(img);

                    // 1. Preprocessing
                    const gray = new cv.Mat();
                    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

                    const blurred = new cv.Mat();
                    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

                    const edges = new cv.Mat();
                    cv.Canny(blurred, edges, 75, 200);

                    // 2. Find Contours
                    const contours = new cv.MatVector();
                    const hierarchy = new cv.Mat();
                    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                    // 3. Find best quadrilateral
                    let maxArea = 0;
                    let bestContour = null;
                    let foundQuad = false;

                    // Strategy 1: Look for exact 4-point poly
                    for (let i = 0; i < contours.size(); ++i) {
                        let cnt = contours.get(i);
                        let area = cv.contourArea(cnt);

                        if (area > 5000) {
                            let peri = cv.arcLength(cnt, true);
                            let tmp = new cv.Mat();
                            cv.approxPolyDP(cnt, tmp, 0.02 * peri, true);

                            if (tmp.rows === 4 && area > maxArea) {
                                maxArea = area;
                                if (bestContour) bestContour.delete();
                                bestContour = tmp.clone();
                                foundQuad = true;
                            }
                            tmp.delete();
                        }
                        cnt.delete();
                    }

                    // Strategy 2: If no quad found, use the largest contour's bounding rect (rotated)
                    if (!foundQuad) {
                        console.log('⚠️ No exact 4-point contour found, trying largest contour...');
                        maxArea = 0;
                        for (let i = 0; i < contours.size(); ++i) {
                            let cnt = contours.get(i);
                            let area = cv.contourArea(cnt);
                            if (area > maxArea && area > 5000) {
                                maxArea = area;
                                if (bestContour) bestContour.delete();
                                bestContour = cnt.clone();
                            }
                            cnt.delete();
                        }

                        if (bestContour) {
                            // Get rotated rect for the largest contour
                            let rotRect = cv.minAreaRect(bestContour);
                            let vertices = cv.RotatedRect.points(rotRect);

                            // Create a Mat from these 4 points
                            let tmp = new cv.Mat(4, 1, cv.CV_32SC2);
                            for (let i = 0; i < 4; i++) {
                                tmp.data32S[i * 2] = vertices[i].x;
                                tmp.data32S[i * 2 + 1] = vertices[i].y;
                            }
                            bestContour.delete();
                            bestContour = tmp;
                            foundQuad = true;
                        }
                    }

                    // Cleanup intermediate mats
                    gray.delete(); blurred.delete(); edges.delete(); contours.delete(); hierarchy.delete();

                    if (foundQuad && bestContour) {
                        // 4. Order points: TL, TR, BR, BL
                        const points = [];
                        for (let i = 0; i < 4; i++) {
                            points.push({
                                x: bestContour.data32S[i * 2],
                                y: bestContour.data32S[i * 2 + 1]
                            });
                        }

                        // Sort by Y to separate top and bottom
                        points.sort((a, b) => a.y - b.y);
                        const top = points.slice(0, 2).sort((a, b) => a.x - b.x); // TL, TR
                        const bottom = points.slice(2, 4).sort((a, b) => a.x - b.x); // BL, BR

                        const tl = top[0];
                        const tr = top[1];
                        const bl = bottom[0];
                        const br = bottom[1];

                        // 5. Warp
                        const width = 1000;
                        const height = 630;

                        const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                            tl.x, tl.y,
                            tr.x, tr.y,
                            br.x, br.y,
                            bl.x, bl.y
                        ]);

                        const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                            0, 0,
                            width, 0,
                            width, height,
                            0, height
                        ]);

                        const M = cv.getPerspectiveTransform(srcTri, dstTri);
                        const warped = new cv.Mat();
                        cv.warpPerspective(src, warped, M, new cv.Size(width, height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

                        const canvas = document.createElement('canvas');
                        cv.imshow(canvas, warped);

                        console.log('✅ Warped CCCD successfully');
                        resolve(canvas.toDataURL('image/jpeg', 0.9));

                        // Cleanup
                        src.delete(); bestContour.delete(); srcTri.delete(); dstTri.delete(); M.delete(); warped.delete();
                    } else {
                        console.warn('⚠️ No suitable contour found, using original image');
                        src.delete(); if (bestContour) bestContour.delete();
                        resolve(imageDataUrl);
                    }
                } catch (err) {
                    console.error('❌ Warp error:', err);
                    resolve(imageDataUrl);
                }
            };
            img.src = imageDataUrl;
        });
    },

    /**
     * Deskew (xoay ảnh) dựa trên góc nghiêng của contour hoặc text lines
     * (Simplified version: rotate by fixed angle if provided, or auto-detect)
     */
    deskew: async (imageDataUrl, angle = 0) => {
        if (!await ImageProcessingService.loadOpenCV()) return imageDataUrl;

        // Nếu angle = 0, có thể implement auto-detect sau.
        // Hiện tại hỗ trợ xoay thủ công nếu QR scan fail.
        if (angle === 0) return imageDataUrl;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const cv = window.cv;
                    const src = cv.imread(img);
                    const dst = new cv.Mat();

                    const center = new cv.Point(src.cols / 2, src.rows / 2);
                    const M = cv.getRotationMatrix2D(center, angle, 1);
                    cv.warpAffine(src, dst, M, new cv.Size(src.cols, src.rows), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

                    const canvas = document.createElement('canvas');
                    cv.imshow(canvas, dst);
                    resolve(canvas.toDataURL('image/jpeg'));

                    src.delete(); dst.delete(); M.delete();
                } catch (e) {
                    resolve(imageDataUrl);
                }
            };
            img.src = imageDataUrl;
        });
    },

    /**
     * Adaptive Thresholding cho ROI
     */
    processROI: async (imageDataUrl, options = {}) => {
        if (!await ImageProcessingService.loadOpenCV()) return imageDataUrl;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const target = options.targetColor || { r: 9, g: 10, b: 4 };
                    const tolerance = options.tolerance || 80; // color distance tolerance

                    // Step 1: filter out blue-ish regions + bright background on canvas
                    const canvasPre = document.createElement('canvas');
                    canvasPre.width = img.width;
                    canvasPre.height = img.height;
                    const ctxPre = canvasPre.getContext('2d', { willReadFrequently: true });
                    ctxPre.drawImage(img, 0, 0);
                    const imageData = ctxPre.getImageData(0, 0, canvasPre.width, canvasPre.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const brightness = (r + g + b) / 3;
                        const colorDist = Math.sqrt(
                          Math.pow(r - target.r, 2) +
                          Math.pow(g - target.g, 2) +
                          Math.pow(b - target.b, 2)
                        );
                        
                        // ENHANCED: Remove blue AND green watermarks (CCCD has green watermark)
                        const blueDominant = b > r + 25 && b > g + 25;
                        const greenDominant = g > r + 20 && g > b + 20;  // ✅ NEW: Detect green watermark
                        const isWatermark = greenDominant || blueDominant || 
                                          (g > 150 && r > 100 && r < 200 && b > 100 && b < 200); // Light green/teal
                        
                        // Hard mask: keep only pixels close to target (black text), discard the rest
                        if (colorDist > tolerance) {
                            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
                            continue;
                        }

                        if (isWatermark || brightness > 200) {
                            // Remove watermark và bright background → force to WHITE
                            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
                        } else if (brightness < 100) {
                            // Keep dark text (black) → force to BLACK
                            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
                        } else {
                            // Middle range: amplify contrast
                            const factor = 1.5;
                            const newVal = brightness < 150 ? 0 : 255;  // Binary decision
                            data[i] = newVal; data[i + 1] = newVal; data[i + 2] = newVal;
                        }
                    }
                    ctxPre.putImageData(imageData, 0, 0);

                    const cv = window.cv;
                    const src = cv.imread(canvasPre);
                    const gray = new cv.Mat();
                    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

                    // Step 2: Adaptive threshold
                    const binary = new cv.Mat();
                    cv.adaptiveThreshold(gray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 2);

                    const canvas = document.createElement('canvas');
                    cv.imshow(canvas, binary);
                    resolve(canvas.toDataURL('image/png'));

                    src.delete(); gray.delete(); binary.delete();
                } catch (e) {
                    resolve(imageDataUrl);
                }
            };
            img.src = imageDataUrl;
        });
    }
};

export default ImageProcessingService;

/**
 * Controller xử lý Geocoding requests
 */

const HybridGeocodingService = require('../services/HybridGeocodingService');
const { body, validationResult } = require('express-validator');

class GeocodingController {
  /**
   * POST /api/geocode
   * Body: { address: string }
   * Response: { lat, lng, displayName, address }
   */
  static async geocodeAddress(req, res) {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { address } = req.body;

      console.log(`[GeocodingController] Processing geocode request: ${address}`);

      // Call hybrid service (auto-fallback Google → Nominatim)
      const result = await HybridGeocodingService.geocodeAddress(address);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy địa chỉ này trên bản đồ. Vui lòng kiểm tra lại.',
        });
      }

      // Success
      return res.status(200).json({
        success: true,
        data: {
          lat: result.lat,
          lng: result.lng,
          displayName: result.displayName,
          address: result.address,
          placeId: result.placeId,
          source: result.source, // 'google' hoặc 'nominatim'
          accuracy: result.accuracy, // Chỉ có khi dùng Google
        },
        message: `Tìm thấy vị trí thành công (${result.source})`,
      });

    } catch (error) {
      console.error('[GeocodingController] Error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tra cứu địa chỉ. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Middleware validation cho geocoding request
   */
  static validateGeocodeRequest = [
    body('address')
      .trim()
      .notEmpty().withMessage('Địa chỉ không được để trống')
      .isLength({ min: 5, max: 500 }).withMessage('Địa chỉ phải từ 5-500 ký tự')
      .matches(/[a-zA-ZÀ-ỹ]/).withMessage('Địa chỉ phải chứa chữ cái'),
  ];
}

module.exports = GeocodingController;

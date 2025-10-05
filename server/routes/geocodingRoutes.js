/**
 * Routes cho Geocoding API
 * Endpoint: POST /api/geocode
 */

const express = require('express');
const router = express.Router();
const GeocodingController = require('../controllers/GeocodingController');
const authSimple = require('../middleware/authSimple'); // Simple auth for development

/**
 * @route   POST /api/geocode
 * @desc    Forward Geocoding - Chuyển địa chỉ thành tọa độ
 * @access  Private (Requires authentication)
 * @body    { address: string }
 * @returns { success: boolean, data: { lat, lng, displayName, address } }
 */
router.post(
  '/',
  authSimple, // Simple auth for development (bypass JWT)
  GeocodingController.validateGeocodeRequest,
  GeocodingController.geocodeAddress
);

module.exports = router;

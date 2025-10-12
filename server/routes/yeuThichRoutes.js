const express = require('express');
const router = express.Router();
const yt = require('../controllers/yeuThichController');

router.post('/', yt.add);                          // thêm yêu thích (body: NguoiDungID, TinDangID)
router.delete('/:userId/:tinId', yt.remove);       // xoá yêu thích
router.get('/user/:userId', yt.listByUser);        // lấy danh sách yêu thích theo user
router.get('/user/:userId/details', yt.listWithTinDetails); // Thêm: lấy danh sách yêu thích kèm thông tin tin đăng (title + img)
router.get('/check', yt.check);                    // kiểm tra ?userId=..&tinId=..

module.exports = router;
-- ================================
-- TẠO TEST DATA CHO USER 6
-- hopboy553@gmail.com
-- ================================

-- Bước 1: Tạo DỰ ÁN cho user 6
INSERT INTO duan (
    TenDuAn, 
    DiaChi, 
    ChuDuAnID, 
    YeuCauPheDuyetChu, 
    TrangThai, 
    TaoLuc, 
    CapNhatLuc
) VALUES 
(
    'Nhà trọ Nguyễn Văn Linh - User 6',
    '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    6,  -- ChuDuAnID = 6
    0,  -- Không yêu cầu phê duyệt
    'HoatDong',
    NOW(),
    NOW()
);

-- Lấy DuAnID vừa tạo
SET @duAnId = LAST_INSERT_ID();

-- Bước 2: Tạo PHÒNG cho dự án
INSERT INTO phong (
    DuAnID,
    TenPhong,
    GiaChuan,
    DienTichChuan,
    TrangThai,
    MoTaPhong,
    TaoLuc,
    CapNhatLuc
) VALUES 
(@duAnId, 'Phòng 101', 3500000, 20, 'Trong', 'Phòng 1 người, đầy đủ tiện nghi', NOW(), NOW()),
(@duAnId, 'Phòng 102', 3500000, 20, 'Trong', 'Phòng 1 người, có ban công', NOW(), NOW()),
(@duAnId, 'Phòng 201', 4000000, 25, 'Trong', 'Phòng 2 người, rộng rãi', NOW(), NOW()),
(@duAnId, 'Phòng 202', 4000000, 25, 'DaThue', 'Phòng 2 người, đã có người thuê', NOW(), NOW());

-- Bước 3: Tạo TIN ĐĂNG
INSERT INTO tindang (
    DuAnID,
    KhuVucID,
    TieuDe,
    MoTa,
    TrangThai,
    URL,
    TienIch,
    GiaDien,
    GiaNuoc,
    TaoLuc,
    CapNhatLuc
) VALUES (
    @duAnId,
    944,  -- Quận 7, TP.HCM (từ screenshot của bạn)
    'Cho thuê phòng trọ Quận 7 - Giá rẻ, tiện nghi đầy đủ',
    'Phòng trọ sạch sẽ, an ninh, gần trường học, siêu thị. Diện tích 20-25m2, giá từ 3.5tr-4tr/tháng.',
    'DaDang',  -- Đã đăng để test
    '[]',
    '["Wifi miễn phí", "Điều hòa", "Máy nước nóng", "Giường tủ", "Ban công"]',
    3500,
    20000,
    NOW(),
    NOW()
);

SET @tinDangId = LAST_INSERT_ID();

-- Bước 4: Gắn PHÒNG vào TIN ĐĂNG
INSERT INTO phong_tindang (TinDangID, PhongID, ThuTuHienThi)
SELECT @tinDangId, PhongID, 
    CASE TenPhong
        WHEN 'Phòng 101' THEN 1
        WHEN 'Phòng 102' THEN 2
        WHEN 'Phòng 201' THEN 3
        WHEN 'Phòng 202' THEN 4
    END as ThuTuHienThi
FROM phong 
WHERE DuAnID = @duAnId;

-- Bước 5: Tạo thêm 1 tin đăng NÁP (để test trang Quản lý tin đăng)
INSERT INTO tindang (
    DuAnID,
    KhuVucID,
    TieuDe,
    MoTa,
    TrangThai,
    URL,
    TienIch,
    TaoLuc,
    CapNhatLuc
) VALUES (
    @duAnId,
    944,
    'Phòng trọ cao cấp Quận 7 - Nội thất đầy đủ',
    'Phòng trọ mới xây, hiện đại, full nội thất. Đang soạn tin...',
    'Nhap',  -- Nháp
    '[]',
    '["Wifi", "Thang máy", "Bảo vệ 24/7"]',
    NOW(),
    NOW()
);

-- ================================
-- KẾT QUẢ
-- ================================
SELECT 
    '✅ Đã tạo test data cho User 6!' as Status,
    @duAnId as DuAnID_Moi,
    @tinDangId as TinDangID_Moi;

-- Kiểm tra kết quả
SELECT 
    td.TinDangID,
    td.TieuDe,
    td.TrangThai,
    da.TenDuAn,
    COUNT(pt.PhongID) as SoPhong
FROM tindang td
JOIN duan da ON td.DuAnID = da.DuAnID
LEFT JOIN phong_tindang pt ON td.TinDangID = pt.TinDangID
WHERE da.ChuDuAnID = 6
GROUP BY td.TinDangID, td.TieuDe, td.TrangThai, da.TenDuAn;


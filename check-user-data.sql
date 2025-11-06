-- ================================
-- KIỂM TRA DỮ LIỆU USER ID 6
-- ================================

-- 1️⃣ Kiểm tra thông tin user
SELECT 
    NguoiDungID,
    Email,
    TenDayDu,
    VaiTroHoatDongID
FROM nguoidung 
WHERE NguoiDungID = 6;

-- 2️⃣ Kiểm tra vai trò của user
SELECT 
    nvt.NguoiDungID,
    vt.VaiTroID,
    vt.TenVaiTro
FROM nguoidung_vaitro nvt
JOIN vaitro vt ON nvt.VaiTroID = vt.VaiTroID
WHERE nvt.NguoiDungID = 6;

-- 3️⃣ Kiểm tra DỰ ÁN của user 6
SELECT 
    DuAnID,
    TenDuAn,
    ChuDuAnID,
    TrangThai,
    DiaChi
FROM duan 
WHERE ChuDuAnID = 6;

-- 4️⃣ Kiểm tra TIN ĐĂNG của user 6 (qua dự án)
SELECT 
    td.TinDangID,
    td.TieuDe,
    td.TrangThai,
    td.DuAnID,
    da.TenDuAn,
    da.ChuDuAnID
FROM tindang td
JOIN duan da ON td.DuAnID = da.DuAnID
WHERE da.ChuDuAnID = 6
AND td.TrangThai != 'LuuTru';

-- 5️⃣ Xem TẤT CẢ tin đăng trong database (để biết ai sở hữu)
SELECT 
    td.TinDangID,
    td.TieuDe,
    td.DuAnID,
    da.TenDuAn,
    da.ChuDuAnID,
    nd.Email AS EmailChuDuAn
FROM tindang td
JOIN duan da ON td.DuAnID = da.DuAnID
LEFT JOIN nguoidung nd ON da.ChuDuAnID = nd.NguoiDungID
ORDER BY td.TinDangID;

-- 6️⃣ Đếm số lượng theo chủ dự án
SELECT 
    da.ChuDuAnID,
    nd.Email,
    COUNT(td.TinDangID) as SoTinDang
FROM duan da
LEFT JOIN tindang td ON da.DuAnID = td.DuAnID
LEFT JOIN nguoidung nd ON da.ChuDuAnID = nd.NguoiDungID
GROUP BY da.ChuDuAnID, nd.Email
ORDER BY SoTinDang DESC;


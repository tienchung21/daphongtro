-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th9 16, 2025 lúc 10:47 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `thue_tro`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cuochen`
--

CREATE TABLE `cuochen` (
  `CuocHenID` int(11) NOT NULL,
  `KhachHangID` int(11) DEFAULT NULL,
  `NhanVienBanHangID` int(11) DEFAULT NULL,
  `TinDangID` int(11) DEFAULT NULL,
  `ThoiGianHen` datetime DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `GhiChuKetQua` text DEFAULT NULL,
  `TaoLuc` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cuochoithoai`
--

CREATE TABLE `cuochoithoai` (
  `CuocHoiThoaiID` int(11) NOT NULL,
  `NguCanhID` int(11) DEFAULT NULL,
  `NguCanhLoai` varchar(50) DEFAULT NULL,
  `TieuDe` varchar(255) DEFAULT NULL,
  `ThoiDiemTinNhanCuoi` datetime DEFAULT NULL,
  `DangHoatDong` tinyint(1) DEFAULT 1,
  `TaoLuc` datetime DEFAULT current_timestamp(),
  `CapNhatLuc` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `duan`
--

CREATE TABLE `duan` (
  `DuAnID` int(11) NOT NULL,
  `TenDuAn` varchar(255) NOT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `ChuDuAnID` int(11) DEFAULT NULL,
  `YeuCauPheDuyetChu` tinyint(1) DEFAULT 0,
  `TrangThai` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giaodich`
--

CREATE TABLE `giaodich` (
  `GiaoDichID` int(11) NOT NULL,
  `ViID` int(11) DEFAULT NULL,
  `SoTien` decimal(15,2) DEFAULT NULL,
  `Loai` varchar(50) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `TinDangLienQuanID` int(11) DEFAULT NULL,
  `ThoiGian` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hopdong`
--

CREATE TABLE `hopdong` (
  `HopDongID` int(11) NOT NULL,
  `TinDangID` int(11) DEFAULT NULL,
  `KhachHangID` int(11) DEFAULT NULL,
  `NgayBatDau` date DEFAULT NULL,
  `NgayKetThuc` date DEFAULT NULL,
  `GiaThueCuoiCung` decimal(15,2) DEFAULT NULL,
  `BaoCaoLuc` datetime DEFAULT NULL,
  `MauHopDongID` int(11) DEFAULT NULL,
  `NoiDungSnapshot` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hosonhanvien`
--

CREATE TABLE `hosonhanvien` (
  `HoSoID` int(11) NOT NULL,
  `NguoiDungID` int(11) DEFAULT NULL,
  `MaNhanVien` varchar(100) DEFAULT NULL,
  `KhuVucChinhID` int(11) DEFAULT NULL,
  `KhuVucPhuTrach` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`KhuVucPhuTrach`)),
  `TyLeHoaHong` decimal(5,2) DEFAULT NULL,
  `TrangThaiLamViec` varchar(50) DEFAULT NULL,
  `NgayBatDau` date DEFAULT NULL,
  `NgayKetThuc` date DEFAULT NULL,
  `GhiChu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khuvuc`
--

CREATE TABLE `khuvuc` (
  `KhuVucID` int(11) NOT NULL,
  `TenKhuVuc` varchar(255) NOT NULL,
  `ParentKhuVucID` int(11) DEFAULT NULL,
  `ViDo` decimal(10,6) DEFAULT NULL,
  `KinhDo` decimal(10,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khuvuc`
--

INSERT INTO `khuvuc` (`KhuVucID`, `TenKhuVuc`, `ParentKhuVucID`, `ViDo`, `KinhDo`) VALUES
(1, 'gò vấp ', NULL, NULL, NULL),
(2, 'phường 11', 1, NULL, NULL),
(3, 'bình thạnh', NULL, NULL, NULL),
(4, 'nguyễn văn lượng', 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichlamviec`
--

CREATE TABLE `lichlamviec` (
  `LichID` int(11) NOT NULL,
  `NhanVienBanHangID` int(11) DEFAULT NULL,
  `BatDau` datetime DEFAULT NULL,
  `KetThuc` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mauhopdong`
--

CREATE TABLE `mauhopdong` (
  `MauHopDongID` int(11) NOT NULL,
  `TieuDe` varchar(255) DEFAULT NULL,
  `NoiDungMau` text DEFAULT NULL,
  `FileURL` varchar(255) DEFAULT NULL,
  `PhienBan` varchar(50) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `TaoBoiAdminID` int(11) DEFAULT NULL,
  `TaoLuc` datetime DEFAULT current_timestamp(),
  `CapNhatLuc` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `NguoiDungID` int(11) NOT NULL,
  `TenDayDu` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `MatKhauHash` varchar(255) NOT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `TaoLuc` datetime DEFAULT current_timestamp(),
  `CapNhatLuc` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `noidunghethong`
--

CREATE TABLE `noidunghethong` (
  `NoiDungID` int(11) NOT NULL,
  `LoaiNoiDung` varchar(50) DEFAULT NULL,
  `TieuDe` varchar(255) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `PhienBan` varchar(50) DEFAULT NULL,
  `CapNhatBoiID` int(11) DEFAULT NULL,
  `CapNhatLuc` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quyen`
--

CREATE TABLE `quyen` (
  `QuyenID` int(11) NOT NULL,
  `MaQuyen` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thanhviencuochoithoai`
--

CREATE TABLE `thanhviencuochoithoai` (
  `CuocHoiThoaiID` int(11) NOT NULL,
  `NguoiDungID` int(11) NOT NULL,
  `ThamGiaLuc` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongbao`
--

CREATE TABLE `thongbao` (
  `ThongBaoID` int(11) NOT NULL,
  `NguoiNhanID` int(11) DEFAULT NULL,
  `Kenh` varchar(50) DEFAULT NULL,
  `TieuDe` varchar(255) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `Payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Payload`)),
  `TrangThai` varchar(50) DEFAULT NULL,
  `SoLanThu` int(11) DEFAULT 0,
  `TaoLuc` datetime DEFAULT current_timestamp(),
  `GuiLuc` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongketindang`
--

CREATE TABLE `thongketindang` (
  `ThongKeID` int(11) NOT NULL,
  `TinDangID` int(11) DEFAULT NULL,
  `Ky` date DEFAULT NULL,
  `SoLuotXem` int(11) DEFAULT 0,
  `SoYeuThich` int(11) DEFAULT 0,
  `SoCuocHen` int(11) DEFAULT 0,
  `SoHopDong` int(11) DEFAULT 0,
  `CapNhatLuc` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tindang`
--

CREATE TABLE `tindang` (
  `TinDangID` int(11) NOT NULL,
  `DuAnID` int(11) DEFAULT NULL,
  `KhuVucID` int(11) DEFAULT NULL,
  `TieuDe` varchar(255) DEFAULT NULL,
  `URL` varchar(255) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `Gia` decimal(15,2) DEFAULT NULL,
  `DienTich` float DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `LyDoTuChoi` text DEFAULT NULL,
  `DuyetBoiNhanVienID` int(11) DEFAULT NULL,
  `TaoLuc` datetime DEFAULT current_timestamp(),
  `CapNhatLuc` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `DuyetLuc` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tinnhan`
--

CREATE TABLE `tinnhan` (
  `TinNhanID` int(11) NOT NULL,
  `CuocHoiThoaiID` int(11) DEFAULT NULL,
  `NguoiGuiID` int(11) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `ThoiGian` datetime DEFAULT current_timestamp(),
  `DaXoa` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vaitro`
--

CREATE TABLE `vaitro` (
  `VaiTroID` int(11) NOT NULL,
  `TenVaiTro` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vi`
--

CREATE TABLE `vi` (
  `ViID` int(11) NOT NULL,
  `NguoiDungID` int(11) DEFAULT NULL,
  `SoDu` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeuthich`
--

CREATE TABLE `yeuthich` (
  `NguoiDungID` int(11) NOT NULL,
  `TinDangID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `cuochen`
--
ALTER TABLE `cuochen`
  ADD PRIMARY KEY (`CuocHenID`),
  ADD KEY `KhachHangID` (`KhachHangID`),
  ADD KEY `NhanVienBanHangID` (`NhanVienBanHangID`),
  ADD KEY `TinDangID` (`TinDangID`);

--
-- Chỉ mục cho bảng `cuochoithoai`
--
ALTER TABLE `cuochoithoai`
  ADD PRIMARY KEY (`CuocHoiThoaiID`);

--
-- Chỉ mục cho bảng `duan`
--
ALTER TABLE `duan`
  ADD PRIMARY KEY (`DuAnID`),
  ADD KEY `ChuDuAnID` (`ChuDuAnID`);

--
-- Chỉ mục cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  ADD PRIMARY KEY (`GiaoDichID`),
  ADD KEY `ViID` (`ViID`),
  ADD KEY `TinDangLienQuanID` (`TinDangLienQuanID`);

--
-- Chỉ mục cho bảng `hopdong`
--
ALTER TABLE `hopdong`
  ADD PRIMARY KEY (`HopDongID`),
  ADD KEY `TinDangID` (`TinDangID`),
  ADD KEY `KhachHangID` (`KhachHangID`),
  ADD KEY `MauHopDongID` (`MauHopDongID`);

--
-- Chỉ mục cho bảng `hosonhanvien`
--
ALTER TABLE `hosonhanvien`
  ADD PRIMARY KEY (`HoSoID`),
  ADD KEY `NguoiDungID` (`NguoiDungID`),
  ADD KEY `KhuVucChinhID` (`KhuVucChinhID`);

--
-- Chỉ mục cho bảng `khuvuc`
--
ALTER TABLE `khuvuc`
  ADD PRIMARY KEY (`KhuVucID`),
  ADD KEY `ParentKhuVucID` (`ParentKhuVucID`);

--
-- Chỉ mục cho bảng `lichlamviec`
--
ALTER TABLE `lichlamviec`
  ADD PRIMARY KEY (`LichID`),
  ADD KEY `NhanVienBanHangID` (`NhanVienBanHangID`);

--
-- Chỉ mục cho bảng `mauhopdong`
--
ALTER TABLE `mauhopdong`
  ADD PRIMARY KEY (`MauHopDongID`),
  ADD KEY `TaoBoiAdminID` (`TaoBoiAdminID`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`NguoiDungID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `SoDienThoai` (`SoDienThoai`);

--
-- Chỉ mục cho bảng `noidunghethong`
--
ALTER TABLE `noidunghethong`
  ADD PRIMARY KEY (`NoiDungID`),
  ADD KEY `CapNhatBoiID` (`CapNhatBoiID`);

--
-- Chỉ mục cho bảng `quyen`
--
ALTER TABLE `quyen`
  ADD PRIMARY KEY (`QuyenID`),
  ADD UNIQUE KEY `MaQuyen` (`MaQuyen`);

--
-- Chỉ mục cho bảng `thanhviencuochoithoai`
--
ALTER TABLE `thanhviencuochoithoai`
  ADD PRIMARY KEY (`CuocHoiThoaiID`,`NguoiDungID`),
  ADD KEY `NguoiDungID` (`NguoiDungID`);

--
-- Chỉ mục cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD PRIMARY KEY (`ThongBaoID`),
  ADD KEY `NguoiNhanID` (`NguoiNhanID`);

--
-- Chỉ mục cho bảng `thongketindang`
--
ALTER TABLE `thongketindang`
  ADD PRIMARY KEY (`ThongKeID`),
  ADD KEY `TinDangID` (`TinDangID`);

--
-- Chỉ mục cho bảng `tindang`
--
ALTER TABLE `tindang`
  ADD PRIMARY KEY (`TinDangID`),
  ADD KEY `DuAnID` (`DuAnID`),
  ADD KEY `KhuVucID` (`KhuVucID`),
  ADD KEY `DuyetBoiNhanVienID` (`DuyetBoiNhanVienID`);

--
-- Chỉ mục cho bảng `tinnhan`
--
ALTER TABLE `tinnhan`
  ADD PRIMARY KEY (`TinNhanID`),
  ADD KEY `CuocHoiThoaiID` (`CuocHoiThoaiID`),
  ADD KEY `NguoiGuiID` (`NguoiGuiID`);

--
-- Chỉ mục cho bảng `vaitro`
--
ALTER TABLE `vaitro`
  ADD PRIMARY KEY (`VaiTroID`);

--
-- Chỉ mục cho bảng `vi`
--
ALTER TABLE `vi`
  ADD PRIMARY KEY (`ViID`),
  ADD UNIQUE KEY `NguoiDungID` (`NguoiDungID`);

--
-- Chỉ mục cho bảng `yeuthich`
--
ALTER TABLE `yeuthich`
  ADD PRIMARY KEY (`NguoiDungID`,`TinDangID`),
  ADD KEY `TinDangID` (`TinDangID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `cuochen`
--
ALTER TABLE `cuochen`
  MODIFY `CuocHenID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cuochoithoai`
--
ALTER TABLE `cuochoithoai`
  MODIFY `CuocHoiThoaiID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `duan`
--
ALTER TABLE `duan`
  MODIFY `DuAnID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  MODIFY `GiaoDichID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hopdong`
--
ALTER TABLE `hopdong`
  MODIFY `HopDongID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hosonhanvien`
--
ALTER TABLE `hosonhanvien`
  MODIFY `HoSoID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `khuvuc`
--
ALTER TABLE `khuvuc`
  MODIFY `KhuVucID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `lichlamviec`
--
ALTER TABLE `lichlamviec`
  MODIFY `LichID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `mauhopdong`
--
ALTER TABLE `mauhopdong`
  MODIFY `MauHopDongID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `NguoiDungID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `noidunghethong`
--
ALTER TABLE `noidunghethong`
  MODIFY `NoiDungID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `quyen`
--
ALTER TABLE `quyen`
  MODIFY `QuyenID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `ThongBaoID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thongketindang`
--
ALTER TABLE `thongketindang`
  MODIFY `ThongKeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tindang`
--
ALTER TABLE `tindang`
  MODIFY `TinDangID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tinnhan`
--
ALTER TABLE `tinnhan`
  MODIFY `TinNhanID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `vaitro`
--
ALTER TABLE `vaitro`
  MODIFY `VaiTroID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `vi`
--
ALTER TABLE `vi`
  MODIFY `ViID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `cuochen`
--
ALTER TABLE `cuochen`
  ADD CONSTRAINT `cuochen_ibfk_1` FOREIGN KEY (`KhachHangID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `cuochen_ibfk_2` FOREIGN KEY (`NhanVienBanHangID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `cuochen_ibfk_3` FOREIGN KEY (`TinDangID`) REFERENCES `tindang` (`TinDangID`);

--
-- Các ràng buộc cho bảng `duan`
--
ALTER TABLE `duan`
  ADD CONSTRAINT `duan_ibfk_1` FOREIGN KEY (`ChuDuAnID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  ADD CONSTRAINT `giaodich_ibfk_1` FOREIGN KEY (`ViID`) REFERENCES `vi` (`ViID`),
  ADD CONSTRAINT `giaodich_ibfk_2` FOREIGN KEY (`TinDangLienQuanID`) REFERENCES `tindang` (`TinDangID`);

--
-- Các ràng buộc cho bảng `hopdong`
--
ALTER TABLE `hopdong`
  ADD CONSTRAINT `hopdong_ibfk_1` FOREIGN KEY (`TinDangID`) REFERENCES `tindang` (`TinDangID`),
  ADD CONSTRAINT `hopdong_ibfk_2` FOREIGN KEY (`KhachHangID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `hopdong_ibfk_3` FOREIGN KEY (`MauHopDongID`) REFERENCES `mauhopdong` (`MauHopDongID`);

--
-- Các ràng buộc cho bảng `hosonhanvien`
--
ALTER TABLE `hosonhanvien`
  ADD CONSTRAINT `hosonhanvien_ibfk_1` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `hosonhanvien_ibfk_2` FOREIGN KEY (`KhuVucChinhID`) REFERENCES `khuvuc` (`KhuVucID`);

--
-- Các ràng buộc cho bảng `khuvuc`
--
ALTER TABLE `khuvuc`
  ADD CONSTRAINT `khuvuc_ibfk_1` FOREIGN KEY (`ParentKhuVucID`) REFERENCES `khuvuc` (`KhuVucID`);

--
-- Các ràng buộc cho bảng `lichlamviec`
--
ALTER TABLE `lichlamviec`
  ADD CONSTRAINT `lichlamviec_ibfk_1` FOREIGN KEY (`NhanVienBanHangID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `mauhopdong`
--
ALTER TABLE `mauhopdong`
  ADD CONSTRAINT `mauhopdong_ibfk_1` FOREIGN KEY (`TaoBoiAdminID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `noidunghethong`
--
ALTER TABLE `noidunghethong`
  ADD CONSTRAINT `noidunghethong_ibfk_1` FOREIGN KEY (`CapNhatBoiID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `thanhviencuochoithoai`
--
ALTER TABLE `thanhviencuochoithoai`
  ADD CONSTRAINT `thanhviencuochoithoai_ibfk_1` FOREIGN KEY (`CuocHoiThoaiID`) REFERENCES `cuochoithoai` (`CuocHoiThoaiID`),
  ADD CONSTRAINT `thanhviencuochoithoai_ibfk_2` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD CONSTRAINT `thongbao_ibfk_1` FOREIGN KEY (`NguoiNhanID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `thongketindang`
--
ALTER TABLE `thongketindang`
  ADD CONSTRAINT `thongketindang_ibfk_1` FOREIGN KEY (`TinDangID`) REFERENCES `tindang` (`TinDangID`);

--
-- Các ràng buộc cho bảng `tindang`
--
ALTER TABLE `tindang`
  ADD CONSTRAINT `tindang_ibfk_1` FOREIGN KEY (`DuAnID`) REFERENCES `duan` (`DuAnID`),
  ADD CONSTRAINT `tindang_ibfk_2` FOREIGN KEY (`KhuVucID`) REFERENCES `khuvuc` (`KhuVucID`),
  ADD CONSTRAINT `tindang_ibfk_3` FOREIGN KEY (`DuyetBoiNhanVienID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `tinnhan`
--
ALTER TABLE `tinnhan`
  ADD CONSTRAINT `tinnhan_ibfk_1` FOREIGN KEY (`CuocHoiThoaiID`) REFERENCES `cuochoithoai` (`CuocHoiThoaiID`),
  ADD CONSTRAINT `tinnhan_ibfk_2` FOREIGN KEY (`NguoiGuiID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `vi`
--
ALTER TABLE `vi`
  ADD CONSTRAINT `vi_ibfk_1` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`NguoiDungID`);

--
-- Các ràng buộc cho bảng `yeuthich`
--
ALTER TABLE `yeuthich`
  ADD CONSTRAINT `yeuthich_ibfk_1` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`NguoiDungID`),
  ADD CONSTRAINT `yeuthich_ibfk_2` FOREIGN KEY (`TinDangID`) REFERENCES `tindang` (`TinDangID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

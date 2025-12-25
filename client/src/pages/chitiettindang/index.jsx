import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineHeart,
  HiOutlineShare,
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineHome,
  HiOutlineSquare3Stack3D,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineClock,
} from "react-icons/hi2";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { PublicTinDangService } from "../../services/PublicService"; // Đổi sang PublicService
import cuocHenApi from "../../api/cuocHenApi"; // ✅ Dùng API mới thay vì PublicCuocHenService
import MapViTriPhong from "../../components/MapViTriPhong/MapViTriPhong";
import yeuThichApi from "../../api/yeuThichApi";
import nguoiPhuTrachDuAnApi from "../../api/nguoiPhuTrachDuAnApi"; // Thêm import
import viApi from "../../api/viApi";
import hopDongApi from "../../api/hopDongApi";
import lichSuViApi from "../../api/lichSuViApi";
import { useToast, ToastContainer } from "../../components/Toast/Toast";
import "./chitiettindang.css";
import { getStaticUrl } from "../../config/api";

/**
 * Helper: Chuyển datetime-local input hoặc ISO string sang MySQL datetime format
 * @param {string} input - 'YYYY-MM-DDTHH:MM' (từ datetime-local) hoặc ISO string
 * @returns {string|null} 'YYYY-MM-DD HH:MM:SS' hoặc null nếu invalid
 */
const toMySqlDateTime = (input) => {
  if (!input) return null;

  // 1) datetime-local từ input: 'YYYY-MM-DDTHH:MM' -> format sang MySQL
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
    return input.replace("T", " ") + ":00";
  }

  // 2) ISO string có Z/timezone -> parse Date object -> format local time
  try {
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, "0");
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const h = pad(d.getHours());
      const mi = pad(d.getMinutes());
      const s = pad(d.getSeconds());
      return `${y}-${m}-${day} ${h}:${mi}:${s}`;
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Component: Chi tiết Tin Đăng cho Khách hàng (Public View)
 * Route: /tin-dang/:id
 *
 * Design: Soft Tech Theme (Customer-centric)
 * - Neutral slate colors (#334155 primary)
 * - Trust-building indigo accents (#6366F1)
 * - Fresh cyan highlights (#06B6D4)
 * - Clean, modern, customer-friendly interface
 * - Mobile-first responsive design
 *
 * Features:
 * - Public viewing (không cần đăng nhập để xem)
 * - Yêu thích (cần đăng nhập)
 * - Đặt lịch xem phòng (cần đăng nhập)
 * - Liên hệ chủ nhà
 * - Image gallery với lightbox
 * - Multiple rooms display
 * - Share functionality
 * - Scroll progress bar
 */
const DEFAULT_MAU_HOP_DONG_ID = 1;

const ChiTietTinDang = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tinDang, setTinDang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [tinTuongTu] = useState([]); // Placeholder for future use
  const [daLuu, setDaLuu] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [henSubmitting, setHenSubmitting] = useState(false);

  // Thêm state (đặt dưới các useState hiện có)
  const [henModalOpen, setHenModalOpen] = useState(false);
  const [henPhongId, setHenPhongId] = useState(null);
  const [henThoiGian, setHenThoiGian] = useState("");
  const [henGhiChu, setHenGhiChu] = useState("");

  // State cho modal chọn phòng để đặt cọc
  const [cocModalOpen, setCocModalOpen] = useState(false);
  const [cocPhongId, setCocPhongId] = useState(null);
  const [soDuVi, setSoDuVi] = useState(null);
  const [checkingCoc, setCheckingCoc] = useState(false);
  const [bangHoaHongOptions, setBangHoaHongOptions] = useState([]);
  const [soThangKy, setSoThangKy] = useState(1);
  const [hopDongModalOpen, setHopDongModalOpen] = useState(false);
  const [hopDongData, setHopDongData] = useState(null);
  const [hopDongLoading, setHopDongLoading] = useState(false);
  const [hopDongError, setHopDongError] = useState(null);
  const [hopDongPhong, setHopDongPhong] = useState(null);
  const [ngayChuyenVao, setNgayChuyenVao] = useState(""); // Ngày muốn chuyển vào

  // Toast notification
  const { toasts, showToast, removeToast } = useToast();

  // Chuẩn bị giá trị PheDuyetChuDuAn từ tin đăng (1 => ChoPheDuyet, 0 => DaPheDuyet)
  const getPheDuyetChuValue = () => {
    const raw = tinDang?.YeuCauPheDuyetChu;
    // Backend expect: "ChoPheDuyet" hoặc "DaPheDuyet"
    if (raw === 1 || raw === "1" || raw === true) {
      return "ChoPheDuyet";
    }
    return "DaPheDuyet";
  };

  // Mở modal hẹn (nút tổng quát)
  const openHenModal = (phongId = null) => {
    const userId = getCurrentUserId();
    if (!userId) {
      alert("📢 Cần đăng nhập để đặt lịch.\nChuyển đến trang đăng nhập?");
      navigate("/login");
      return;
    }
    if (!phongId && tinDang?.DanhSachPhong?.length === 1) {
      phongId = tinDang.DanhSachPhong[0].PhongID;
    }
    setHenPhongId(phongId);
    // Giá trị mặc định: hiện tại + 30 phút (đảm bảo >= hiện tại)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const localValue = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // yyyy-MM-ddTHH:mm
    setHenThoiGian(localValue);
    setHenGhiChu("");
    setHenModalOpen(true);
  };

  // UC-CUST-03: Gửi tạo cuộc hẹn
  const submitHen = async (e) => {
    e.preventDefault();
    const userId = getCurrentUserId();
    if (!userId) {
      showToast("Chưa đăng nhập", "error");
      return;
    }
    if (!henThoiGian) {
      showToast("Chưa chọn thời gian", "error");
      return;
    }
    if (!henPhongId) {
      showToast("Vui lòng chọn phòng cần xem", "error");
      return;
    }

    const mysqlTime = toMySqlDateTime(henThoiGian);
    if (!mysqlTime) {
      showToast("Thời gian không hợp lệ", "error");
      return;
    }

    // Lấy KhuVucID từ tin đăng
    const khuVucId = tinDang?.KhuVucID;
    let nhanVienId = 8; // Mặc định nếu không tìm thấy nhân viên phù hợp

    console.log("[ChiTietTinDang] 🔍 Bắt đầu tìm nhân viên phụ trách");
    console.log("[ChiTietTinDang] KhuVucID:", khuVucId);
    console.log("[ChiTietTinDang] Thời gian hẹn (MySQL):", mysqlTime);

    if (khuVucId) {
      try {
        // Gọi API lấy danh sách nhân viên phụ trách khu vực
        console.log("[ChiTietTinDang] 📞 Gọi API lấy nhân viên phụ trách...");
        const res = await nguoiPhuTrachDuAnApi.getByDuAnId(khuVucId);
        console.log("[ChiTietTinDang] 📥 API response:", res);
        console.log("[ChiTietTinDang] 📥 API response.data:", res.data);

        // Axios trả về {data: {...}, status: 200, ...}
        // Server trả về {success: true, data: [...]}
        // Vậy cần truy cập: res.data.success và res.data.data
        const responseData = res.data;
        const danhSachNhanVien = responseData?.data || responseData; // Fallback nếu không có nested data

        if (
          responseData?.success &&
          Array.isArray(danhSachNhanVien) &&
          danhSachNhanVien.length > 0
        ) {
          console.log(
            "[ChiTietTinDang] ✅ Tìm thấy",
            danhSachNhanVien.length,
            "nhân viên"
          );

          // Duyệt từng nhân viên và từng ca làm việc
          console.log("--- DEBUG TÌM NHÂN VIÊN ---");
          console.log("Giờ hẹn khách chọn:", mysqlTime);

          danhSachNhanVien.forEach((nv) => {
            console.log(
              `Nhân viên ID ${nv.NguoiDungID}, có ${
                nv.lichLamViec?.length || 0
              } ca làm việc`
            );
            if (Array.isArray(nv.lichLamViec)) {
              nv.lichLamViec.forEach((ca) => {
                console.log("  Ca:", ca.BatDau, "→", ca.KetThuc);
                // So sánh trực tiếp string MySQL datetime (YYYY-MM-DD HH:mm:ss)
                const isInRange =
                  mysqlTime >= ca.BatDau && mysqlTime <= ca.KetThuc;
                console.log(
                  "  So sánh:",
                  mysqlTime,
                  "trong khoảng",
                  ca.BatDau,
                  "-",
                  ca.KetThuc,
                  "→",
                  isInRange
                );
              });
            }
          });

          // Tìm nhân viên có ca làm việc chứa thời gian hẹn
          // So sánh trực tiếp string MySQL datetime (YYYY-MM-DD HH:mm:ss)
          const found = danhSachNhanVien.find(
            (nv) =>
              Array.isArray(nv.lichLamViec) &&
              nv.lichLamViec.some((ca) => {
                // So sánh trực tiếp string MySQL datetime format
                return mysqlTime >= ca.BatDau && mysqlTime <= ca.KetThuc;
              })
          );

          if (found) {
            nhanVienId = found.NguoiDungID;
            console.log(
              "[ChiTietTinDang] ✅ Tìm thấy nhân viên phù hợp:",
              nhanVienId
            );
          } else {
            console.log(
              "[ChiTietTinDang] ⚠️ Không tìm thấy nhân viên phù hợp, dùng mặc định:",
              nhanVienId
            );
          }
        } else {
          console.log(
            "[ChiTietTinDang] ⚠️ Không có nhân viên nào hoặc response không hợp lệ"
          );
          console.log("[ChiTietTinDang] responseData:", responseData);
          console.log("[ChiTietTinDang] danhSachNhanVien:", danhSachNhanVien);
        }
      } catch (err) {
        console.error("[ChiTietTinDang] ❌ Lỗi lấy nhân viên phụ trách:", err);
        console.error(
          "[ChiTietTinDang] Error details:",
          err.response?.data || err.message
        );
        // Giữ mặc định nhanVienId = 1
      }
    } else {
      console.log(
        "[ChiTietTinDang] ⚠️ Không có KhuVucID, dùng nhân viên mặc định:",
        nhanVienId
      );
    }

    const yeuCauPheDuyet = tinDang?.YeuCauPheDuyetChu;
    let pheDuyetValue = "ChoPheDuyet";
    if (
      yeuCauPheDuyet === 0 ||
      yeuCauPheDuyet === "0" ||
      yeuCauPheDuyet === false
    ) {
      pheDuyetValue = "DaPheDuyet";
    }

    if (!tinDang?.TinDangID) {
      showToast(
        "❌ Không tìm thấy thông tin tin đăng. Vui lòng tải lại trang."
      );
      return;
    }

    const payload = {
      TinDangID: tinDang.TinDangID,
      ChuDuAnID: tinDang.ChuDuAnID,
      PhongID: henPhongId ? parseInt(henPhongId) : null,
      KhachHangID: parseInt(userId),
      NhanVienBanHangID: nhanVienId,
      ThoiGianHen: mysqlTime,
      TrangThai: "ChoXacNhan",
      PheDuyetChuDuAn: pheDuyetValue,
      GhiChu: henGhiChu.trim() || null,
      GhiChuKetQua: null,
      PhuongThucVao: tinDang.PhuongThucVao,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    setHenSubmitting(true);
    try {
      const response = await cuocHenApi.create(payload);
      if (
        response?.success ||
        response?.status === 201 ||
        response?.data?.success
      ) {
        showToast("Đặt lịch thành công! Người quản lý sẽ liên hệ bạn sớm.", "success");
        setHenModalOpen(false);
        setHenPhongId(null);
        setHenThoiGian("");
        setHenGhiChu("");
      } else {
        showToast(
          `❌ ${
            response?.message || response?.data?.message || "Lỗi không xác định"
          }`
        );
      }
    } catch (error) {
      console.error("[ChiTietTinDang] Lỗi tạo cuộc hẹn:", error);
      if (error?.response?.status === 201) {
        showToast("Đặt lịch thành công!", "success");
        setHenModalOpen(false);
        setHenPhongId(null);
        setHenThoiGian("");
        setHenGhiChu("");
      } else {
        showToast(
          `❌ ${
            error?.response?.data?.message ||
            error.message ||
            "Không thể đặt lịch. Vui lòng thử lại."
          }`
        );
      }
    } finally {
      setHenSubmitting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await layChiTietTinDang();
      await layTinTuongTu();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "Escape") setLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, currentImageIndex]);

  const layChiTietTinDang = async () => {
    try {
      setLoading(true);
      // Đổi sang dùng PublicTinDangService (không cần auth)
      const response = await PublicTinDangService.layChiTietTinDang(id);
      if (response && response.success) {
        setTinDang(response.data);

        // Parse danh sách ảnh
        const urls = parseImages(response.data.URL);
        setDanhSachAnh(urls);

        // Parse bảng hoa hồng để tạo danh sách số tháng hợp đồng hợp lệ
        const parsedBangHoaHong = parseBangHoaHong(response.data?.BangHoaHong);
        setBangHoaHongOptions(parsedBangHoaHong);
        if (parsedBangHoaHong.length > 0) {
          setSoThangKy(parsedBangHoaHong[0].soThang);
        } else {
          setSoThangKy(1);
        }
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết tin đăng:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHopDongPreview = async (phong, soThangOverride) => {
    if (!tinDang?.TinDangID) {
      showToast("Không tìm thấy thông tin tin đăng", "error");
      return;
    }

    const phongMucTieu = phong || hopDongPhong;
    if (!phongMucTieu) {
      showToast("Vui lòng chọn phòng trước khi xem hợp đồng", "error");
      return;
    }

    setHopDongLoading(true);
    setHopDongError(null);

    try {
      const giaPhong = phongMucTieu?.Gia || tinDang?.Gia || 0;
      const soThangHopDong = soThangOverride || soThangKy || 1;
      const soThangCocToiThieu = Number(tinDang?.SoThangCocToiThieu) || 1;
      const soTienCoc = (Number(giaPhong) || 0) * soThangCocToiThieu;

      const overrides = {
        chiPhi: {
          giaThue: giaPhong,
          giaDien: tinDang?.GiaDien || null,
          giaNuoc: tinDang?.GiaNuoc || null,
          giaDichVu: tinDang?.GiaDichVu || null,
          moTaDichVu: tinDang?.MoTaGiaDichVu || "",
          soTienCoc,
          soThangKy: soThangHopDong,
        },
        batDongSan: {
          diaChi: tinDang?.DiaChi || "",
          dienTich: phongMucTieu?.DienTich || tinDang?.DienTich,
          tenPhong: phongMucTieu?.TenPhong || null,
        },
      };

      const response = await hopDongApi.generate({
        tinDangId: tinDang.TinDangID,
        mauHopDongId: DEFAULT_MAU_HOP_DONG_ID,
        overrides,
      });

      const payload = response?.data || response;
      if (!payload?.success) {
        throw new Error(payload?.message || "Không thể tải hợp đồng");
      }

      setHopDongData(payload.data);
    } catch (error) {
      console.error("[ChiTietTinDang] Lỗi dựng hợp đồng:", error);
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Không thể tải hợp đồng";
      setHopDongError(msg);
    } finally {
      setHopDongLoading(false);
    }
  };

  const openHopDongPreview = async (phong) => {
    if (!tinDang?.TinDangID) {
      showToast("Không tìm thấy thông tin tin đăng", "error");
      return;
    }

    setHopDongModalOpen(true);
    setHopDongError(null);
    setHopDongData(null);
    setHopDongPhong(phong || null);
    
    // Set ngày chuyển vào mặc định là ngày mai
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNgayChuyenVao(tomorrow.toISOString().split("T")[0]);

    await fetchHopDongPreview(phong);
  };

  const handleChangeSoThangKy = async (value) => {
    const months = Number(value) || 1;
    setSoThangKy(months);
    if (hopDongModalOpen && hopDongPhong) {
      await fetchHopDongPreview(hopDongPhong, months);
    }
  };

  const closeHopDongModal = () => {
    setHopDongModalOpen(false);
    setHopDongData(null);
    setHopDongError(null);
    setHopDongLoading(false);
    setHopDongPhong(null);
    setNgayChuyenVao("");
    setSoThangKy(bangHoaHongOptions[0]?.soThang || 1);
  };

  const handlePreDepositCheck = async (phong) => {
    if (!phong) {
      showToast("Vui lòng chọn phòng", "error");
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      alert("📢 Yêu cầu đăng nhập\n\nBạn cần đăng nhập để đặt cọc.");
      navigate("/login");
      return;
    }

    setCheckingCoc(true);
    try {
      const viRes = await viApi.getByUser(userId);
      let soDu = 0;
      
      // Handle response structure (Array or Object)
      const viData = viRes?.data?.data;
      if (Array.isArray(viData) && viData.length > 0) {
          soDu = Number(viData[0].SoDu);
      } else if (viData && typeof viData === 'object') {
          soDu = Number(viData.SoDu);
      }

      setSoDuVi(soDu);
      
      // Số tiền cọc tối thiểu cần có = giá phòng * SoThangCocToiThieu
      const giaPhong = Number(phong.Gia || 0);
      const soThangCocToiThieu = Number(tinDang?.SoThangCocToiThieu) || 1;
      const soTienCocToiThieu = giaPhong * soThangCocToiThieu;

      if (soDu < soTienCocToiThieu) {
        showToast("Số dư ví không đủ để đặt cọc phòng này!", "error");
        setCheckingCoc(false);
        // Có thể điều hướng người dùng đi nạp tiền nếu muốn
        // navigate("/vi"); 
        return;
      }
      
      // Nếu đủ tiền -> Mở modal hợp đồng
      setCheckingCoc(false);
      setCocModalOpen(false); // Đóng modal chọn phòng nếu đang mở
      await openHopDongPreview(phong);
      
    } catch (err) {
      console.error("Lỗi kiểm tra ví:", err);
      showToast("Lỗi kiểm tra số dư ví", "error");
      setCheckingCoc(false);
    }
  };

  const handleHopDongAgree = async () => {
    if (!tinDang?.TinDangID || !hopDongData || !hopDongPhong?.PhongID) {
      showToast("Vui lòng chọn phòng trước khi đặt cọc", "error");
      closeHopDongModal();
      return;
    }

    try {
      // Tính số tiền cọc theo quy tắc: SoThangCocToiThieu * Giá phòng
      const soTienCoc =
        hopDongData?.payload?.chiPhi?.soTienCoc ||
        ((hopDongPhong?.Gia || hopDongData?.payload?.chiPhi?.giaThue || 0) *
          (Number(tinDang?.SoThangCocToiThieu) || 1));

      // Kiểm tra số dư ví trước khi trừ tiền
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.NguoiDungID || user._id;

      if (userId) {
        const viRes = await viApi.getByUser(userId);
        let soDu = 0;
        if (viRes?.data?.data?.SoDu) {
          soDu = Number(viRes.data.data.SoDu);
        } else if (Array.isArray(viRes?.data?.data) && viRes.data.data.length > 0) {
          soDu = Number(viRes.data.data[0].SoDu || 0);
        }

        if (soDu < Number(soTienCoc)) {
          showToast("Số dư ví không đủ để đặt cọc!", "error");
          closeHopDongModal();
          return;
        }

        // Tạo giao dịch trừ tiền (rút tiền để đặt cọc)
        const maGiaoDich = `COC_${tinDang.TinDangID}_${hopDongPhong.PhongID}_${Date.now()}`;
        await lichSuViApi.create({
          user_id: userId,
          ma_giao_dich: maGiaoDich,
          so_tien: Number(soTienCoc),
          trang_thai: "THANH_CONG",
          LoaiGiaoDich: "rut", // Rút tiền để đặt cọc
        });

        // Hiển thị thông báo trừ tiền
        showToast(
          `Đã trừ ${Number(soTienCoc).toLocaleString("vi-VN")} ₫ từ ví để đặt cọc`,
          "success"
        );
      }

      // Validate ngày chuyển vào
      if (!ngayChuyenVao) {
        showToast("Vui lòng chọn ngày muốn chuyển vào", "error");
        return;
      }

      // Xác nhận đặt cọc
      await hopDongApi.confirmDeposit(tinDang.TinDangID, {
        giaoDichId: `tmp-${Date.now()}`,
        soTien: soTienCoc,
        noiDungSnapshot:
          hopDongData?.renderedHtml || hopDongData?.noiDungSnapshot || "",
        phongId: hopDongPhong?.PhongID,
        ngayBatDau: ngayChuyenVao,
        soThangKy,
      });

      showToast("Đặt cọc thành công!", "success");
      closeHopDongModal();
      setCocPhongId(null);
      await layChiTietTinDang();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("[ChiTietTinDang] Lỗi xác nhận hợp đồng:", error);
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Không thể xác nhận đặt cọc";
      showToast(msg, "error");
    }
  };

  const layTinTuongTu = async () => {
    try {
      // placeholder
    } catch (error) {
      console.error("Lỗi tải tin tương tự:", error);
    }
  };

  const parseImages = (urlJson) => {
    const normalizeValues = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [trimmed];
      }
      return [];
    };

    return normalizeValues(urlJson)
      .map((url) => getStaticUrl(url))
      .filter(Boolean);
  };

  const parseTienIch = (tienIchJson) => {
    try {
      return JSON.parse(tienIchJson || "[]");
    } catch {
      return [];
    }
  };

  const parseBangHoaHong = (bangHoaHongRaw) => {
    try {
      if (!bangHoaHongRaw) return [];
      const parsed =
        typeof bangHoaHongRaw === "string"
          ? JSON.parse(bangHoaHongRaw)
          : bangHoaHongRaw;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item?.soThang)
        .map((item) => ({
          soThang: Number(item.soThang),
          tyLe: item.tyLe ?? null,
        }))
        .filter((item) => !Number.isNaN(item.soThang) && item.soThang > 0)
        .sort((a, b) => a.soThang - b.soThang);
    } catch (error) {
      console.warn("[ChiTietTinDang] Không parse được BangHoaHong", error);
      return [];
    }
  };

  const formatCurrency = (value) => {
    return parseInt(value || 0).toLocaleString("vi-VN") + " ₫";
  };

  const getSoTienCocHienTai = () => {
    const gia = hopDongPhong?.Gia || tinDang?.Gia || 0;
    const soThangCocToiThieu = Number(tinDang?.SoThangCocToiThieu) || 1;
    return (Number(gia) || 0) * soThangCocToiThieu;
  };

  /**
   * 🔢 Tính số phòng trống động từ DanhSachPhong
   * @returns {number} Số phòng có TrangThaiPhong === "Trong"
   */
  const getSoPhongTrong = () => {
    if (!tinDang?.DanhSachPhong || tinDang.DanhSachPhong.length === 0) {
      return 0;
    }
    return tinDang.DanhSachPhong.filter((p) => p.TrangThaiPhong === "Trong")
      .length;
  };

  /**
   * 💰 Tính giá hiển thị thông minh dựa trên loại tin đăng
   * - Phòng đơn: Lấy từ tinDang.Gia
   * - Nhiều phòng: Hiển thị khoảng giá min-max từ DanhSachPhong
   */
  const getGiaHienThi = () => {
    // Case 1: Không có DanhSachPhong -> lấy giá từ TinDang
    if (!tinDang.DanhSachPhong || tinDang.DanhSachPhong.length === 0) {
      return tinDang.Gia ? formatCurrency(tinDang.Gia) : "Liên hệ";
    }

    // Case 2: Có DanhSachPhong -> tính khoảng giá
    const gias = tinDang.DanhSachPhong.map((p) => parseFloat(p.Gia)).filter(
      (g) => !isNaN(g) && g > 0
    );

    if (gias.length === 0) return "Liên hệ";

    const minGia = Math.min(...gias);
    const maxGia = Math.max(...gias);

    if (minGia === maxGia) {
      return formatCurrency(minGia);
    }

    return `${formatCurrency(minGia)} - ${formatCurrency(maxGia)}`;
  };

  /**
   * 📐 Tính diện tích hiển thị thông minh
   * - Phòng đơn: Lấy từ tinDang.DienTich
   * - Nhiều phòng: Hiển thị khoảng diện tích min-max
   */
  const getDienTichHienThi = () => {
    // Case 1: Phòng đơn
    if (!tinDang.TongSoPhong || tinDang.TongSoPhong <= 1) {
      return tinDang.DienTich ? `${tinDang.DienTich} m²` : "N/A";
    }

    // Case 2: Nhiều phòng
    if (tinDang.DanhSachPhong && tinDang.DanhSachPhong.length > 0) {
      const dienTichs = tinDang.DanhSachPhong.map((p) =>
        parseFloat(p.DienTich)
      ).filter((dt) => !isNaN(dt) && dt > 0);

      if (dienTichs.length === 0) {
        return "N/A";
      }

      const minDT = Math.min(...dienTichs);
      const maxDT = Math.max(...dienTichs);

      if (minDT === maxDT) {
        return `${minDT} m²`;
      }

      return `${minDT} - ${maxDT} m²`;
    }

    return "N/A";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === danhSachAnh.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? danhSachAnh.length - 1 : prev - 1
    );
  };

  const getCurrentUserId = () => {
    try {
      const raw =
        localStorage.getItem("user") || localStorage.getItem("currentUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        const actual = parsed.user ?? parsed;
        const id = actual?.NguoiDungID ?? actual?.id ?? actual?.userId;
        if (id) return Number(id);
      }
    } catch {
      /* ignore */
    }
    const idKey = localStorage.getItem("userId");
    if (idKey && !isNaN(Number(idKey))) return Number(idKey);
    return null;
  };

  const handleLuuTin = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      alert(
        "📢 Yêu cầu đăng nhập\n\nBạn cần đăng nhập để lưu tin yêu thích.\nClick OK để chuyển đến trang đăng nhập."
      );
      navigate("/login");
      return;
    }

    try {
      if (daLuu) {
        setDaLuu(false);
        showToast("Đã bỏ lưu tin", "success");
      } else {
        await yeuThichApi.add({
          NguoiDungID: userId,
          TinDangID: tinDang.TinDangID,
        });
        setDaLuu(true);
        showToast("Đã lưu tin thành công!", "success");
      }
    } catch (error) {
      console.error("Lỗi lưu tin:", error);
      const errorMsg = error?.response?.data?.message || "Có lỗi xảy ra";
      showToast(`❌ ${errorMsg}`);
    }
  };

  const handleChiaSeHu = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        showToast("Đã sao chép link chia sẻ!", "success");
      })
      .catch(() => {
        showToast("Không thể sao chép. Vui lòng thử lại.", "error");
      });
  };

  // showToast đã được thay thế bằng useToast hook

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scroll
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="chi-tiet-tin-dang-wrapper">
      <Header />
      <div className="chi-tiet-tin-dang">
        {/* Scroll Progress Bar */}
        <div
          className="ctd-scroll-progress"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Skeleton Header */}
        <div className="ctd-header">
          <div
            className="ctd-skeleton ctd-skeleton-button"
            style={{ width: "120px" }}
          />
          <div
            className="ctd-skeleton ctd-skeleton-text"
            style={{ width: "300px" }}
          />
        </div>

        {/* Skeleton Grid */}
        <div className="ctd-grid">
          <div className="ctd-left">
            {/* Skeleton Gallery */}
            <div
              className="ctd-skeleton ctd-skeleton-gallery"
              style={{ height: "500px" }}
            />

            {/* Skeleton Specs */}
            <div className="ctd-section">
              <div
                className="ctd-skeleton ctd-skeleton-title"
                style={{ width: "200px" }}
              />
              <div className="ctd-specs-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="ctd-skeleton ctd-skeleton-spec" />
                ))}
              </div>
            </div>

            {/* Skeleton Description */}
            <div className="ctd-section">
              <div
                className="ctd-skeleton ctd-skeleton-title"
                style={{ width: "150px" }}
              />
              <div
                className="ctd-skeleton ctd-skeleton-text"
                style={{ height: "100px" }}
              />
            </div>
          </div>

          {/* Skeleton Info Card */}
          <div className="ctd-right">
            <div className="ctd-info-card">
              <div
                className="ctd-skeleton ctd-skeleton-title"
                style={{ width: "100%", height: "30px" }}
              />
              <div
                className="ctd-skeleton ctd-skeleton-text"
                style={{ width: "150px", height: "40px", marginTop: "16px" }}
              />
              <div
                className="ctd-skeleton ctd-skeleton-button"
                style={{ width: "100%", marginTop: "24px" }}
              />
              <div
                className="ctd-skeleton ctd-skeleton-button"
                style={{ width: "100%", marginTop: "12px" }}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!tinDang) {
    return (
      <div className="chi-tiet-tin-dang-wrapper">
        <Header />
        <div className="chi-tiet-tin-dang">
          <div className="ctd-error">
            <HiOutlineXCircle className="ctd-error-icon" />
            <h3>Không tìm thấy tin đăng</h3>
            <button onClick={() => navigate("/")} className="ctd-btn-primary">
              Về trang chủ
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tienIch = parseTienIch(tinDang.TienIch);

  return (
    <div className="chi-tiet-tin-dang-wrapper">
      <Header />

      <div className="chi-tiet-tin-dang">
        {/* Header với Breadcrumb */}
        <div className="ctd-header">
          <button onClick={() => navigate(-1)} className="ctd-back-btn">
            <HiOutlineArrowLeft />
            <span>Quay lại</span>
          </button>

          <div className="ctd-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Chi tiết tin đăng</span>
          </div>

          <div className="ctd-header-actions">
            <button
              onClick={handleLuuTin}
              className={`ctd-btn-icon ${daLuu ? "active" : ""}`}
              title="Lưu tin yêu thích"
            >
              <HiOutlineHeart
                style={{
                  width: "24px",
                  height: "24px",
                  color: daLuu ? "#ef4444" : "#334155",
                }}
              />
            </button>
            <button
              onClick={handleChiaSeHu}
              className="ctd-btn-icon"
              title="Chia sẻ"
            >
              <HiOutlineShare
                style={{ width: "24px", height: "24px", color: "#111827" }}
              />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="ctd-grid">
          {/* Left Column - Gallery & Details */}
          <div className="ctd-left">
            {/* Image Gallery */}
            {danhSachAnh.length > 0 && (
              <div className="ctd-gallery">
                <div
                  className="ctd-gallery-main"
                  onClick={() => openLightbox(currentImageIndex)}
                  style={{ cursor: "zoom-in" }}
                  role="button"
                  tabIndex={0}
                  aria-label="Click to view full size"
                >
                  <img
                    src={danhSachAnh[currentImageIndex]}
                    alt={`${tinDang.TieuDe} - ${currentImageIndex + 1}`}
                    className="ctd-gallery-image"
                  />

                  {danhSachAnh.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="ctd-gallery-nav ctd-gallery-prev"
                        aria-label="Previous image"
                      >
                        <HiOutlineChevronLeft />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="ctd-gallery-nav ctd-gallery-next"
                        aria-label="Next image"
                      >
                        <HiOutlineChevronRight />
                      </button>
                      <div className="ctd-gallery-counter">
                        {currentImageIndex + 1} / {danhSachAnh.length}
                      </div>
                    </>
                  )}

                  {/* 🎨 NEW: Zoom hint */}
                  <div className="ctd-zoom-hint">
                    <span>🔍 Click để xem kích thước đầy đủ</span>
                  </div>
                </div>

                {/* Thumbnails */}
                {danhSachAnh.length > 1 && (
                  <div className="ctd-gallery-thumbs">
                    {danhSachAnh.map((url, index) => (
                      <div
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`ctd-thumb ${
                          index === currentImageIndex ? "active" : ""
                        }`}
                        role="button"
                        tabIndex={0}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img src={url} alt={`Thumb ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Thông số chi tiết */}
            <div className="ctd-section">
              <h2 className="ctd-section-title">Thông số chi tiết</h2>
              <div className="ctd-specs-grid">
                <div className="ctd-spec-item">
                  <HiOutlineCurrencyDollar className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Giá thuê</span>
                    <span className="ctd-spec-value">
                      {getGiaHienThi()}/tháng
                    </span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineSquare3Stack3D className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Diện tích</span>
                    <span className="ctd-spec-value">
                      {getDienTichHienThi()}
                    </span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineHome className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Loại phòng</span>
                    <span className="ctd-spec-value">
                      {tinDang.LoaiPhong || "Phòng trọ"}
                    </span>
                  </div>
                </div>

                {tinDang.TongSoPhong > 0 && (
                  <>
                    <div className="ctd-spec-item">
                      <HiOutlineHome className="ctd-spec-icon" />
                      <div className="ctd-spec-content">
                        <span className="ctd-spec-label">Tổng số phòng</span>
                        <span className="ctd-spec-value">
                          {tinDang.TongSoPhong}
                        </span>
                      </div>
                    </div>

                    <div className="ctd-spec-item">
                      <HiOutlineCheckCircle className="ctd-spec-icon" />
                      <div className="ctd-spec-content">
                        <span className="ctd-spec-label">Phòng trống</span>
                        <span className="ctd-spec-value">
                          {getSoPhongTrong()}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="ctd-spec-item">
                  <HiOutlineCalendar className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Đăng lúc</span>
                    <span className="ctd-spec-value">
                      {formatDate(tinDang.TaoLuc)}
                    </span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineEye className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Lượt xem</span>
                    <span className="ctd-spec-value">
                      {tinDang.LuotXem || 0}
                    </span>
                  </div>
                </div>

                {/* Thêm vào ctd-specs-grid */}
                <div className="ctd-spec-item">
                  <HiOutlineCurrencyDollar className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Tiền điện</span>
                    <span className="ctd-spec-value">
                      {formatCurrency(tinDang.GiaDien)}/kWh
                    </span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineCurrencyDollar className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Tiền nước</span>
                    <span className="ctd-spec-value">
                      {formatCurrency(tinDang.GiaNuoc)}/m³
                    </span>
                  </div>
                </div>

                {tinDang.MoTaGiaDichVu && (
                  <div className="ctd-spec-item ctd-spec-full">
                    <HiOutlineDocumentText className="ctd-spec-icon" />
                    <div className="ctd-spec-content">
                      <span className="ctd-spec-label">Dịch vụ khác</span>
                      <span className="ctd-spec-value">
                        {tinDang.MoTaGiaDichVu}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="ctd-section">
              <h2 className="ctd-section-title">Mô tả chi tiết</h2>
              <div className="ctd-description">
                {tinDang.MoTa ? (
                  <p>{tinDang.MoTa}</p>
                ) : (
                  <p className="ctd-description-empty">
                    Chưa có mô tả chi tiết
                  </p>
                )}
              </div>
            </div>

            {/* Tiện ích */}
            {tienIch.length > 0 && (
              <div className="ctd-section">
                <h2 className="ctd-section-title">Tiện ích</h2>
                <div className="ctd-tienich-grid">
                  {tienIch.map((item, index) => (
                    <div key={index} className="ctd-tienich-item">
                      <HiOutlineCheckCircle className="ctd-tienich-icon" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🏢 NEW: Danh sách phòng (REDESIGN 09/10/2025 - Luôn hiển thị) */}
            {tinDang.DanhSachPhong && tinDang.DanhSachPhong.length > 0 && (
              <div className="ctd-section ctd-rooms-section">
                <div className="ctd-section-header">
                  <h2 className="ctd-section-title">
                    <HiOutlineBuildingOffice2 />
                    <span>
                      Danh sách phòng ({tinDang.DanhSachPhong.length} phòng)
                    </span>
                  </h2>
                  <div className="ctd-rooms-summary">
                    <span className="ctd-rooms-available">
                      <HiOutlineCheckCircle /> {getSoPhongTrong()} còn trống
                    </span>
                    <span className="ctd-rooms-rented">
                      {tinDang.DanhSachPhong.length - getSoPhongTrong()} đã thuê
                    </span>
                  </div>
                </div>

                <div className="ctd-rooms-grid">
                  {tinDang.DanhSachPhong.map((phong) => {
                    const phongImage = phong.AnhPhong
                      ? getStaticUrl(phong.AnhPhong)
                      : null;
                    const isAvailable = phong.TrangThaiPhong === "Trong";

                    return (
                      <div
                        key={phong.PhongID}
                        className={`ctd-room-card ${
                          !isAvailable ? "ctd-room-card-rented" : ""
                        }`}
                      >
                        <div className="ctd-room-image-wrapper">
                          {phongImage ? (
                            <img
                              src={phongImage}
                              alt={phong.TenPhong}
                              className="ctd-room-image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="ctd-room-image-placeholder">
                              <HiOutlineHome />
                            </div>
                          )}

                          {/* Status Badge */}
                          <div
                            className={`ctd-room-status ${
                              isAvailable ? "available" : "rented"
                            }`}
                          >
                            {isAvailable ? (
                              <>
                                <HiOutlineCheckCircle />
                                <span>Còn trống</span>
                              </>
                            ) : (
                              <>
                                <HiOutlineXCircle />
                                <span>Đã thuê</span>
                              </>
                            )}
                          </div>

                          {/* Image Count - Removed vì AnhPhong là single string, không phải array */}
                        </div>

                        {/* Room Info */}
                        <div className="ctd-room-info">
                          <h3 className="ctd-room-name">{phong.TenPhong}</h3>

                          <div className="ctd-room-specs">
                            <div className="ctd-room-spec">
                              <HiOutlineCurrencyDollar className="ctd-room-spec-icon" />
                              <span className="ctd-room-spec-value">
                                {formatCurrency(phong.Gia)}
                              </span>
                              <span className="ctd-room-spec-unit">/tháng</span>
                            </div>
                            <div className="ctd-room-spec">
                              <HiOutlineSquare3Stack3D className="ctd-room-spec-icon" />
                              <span className="ctd-room-spec-value">
                                {phong.DienTich}
                              </span>
                              <span className="ctd-room-spec-unit">m²</span>
                            </div>
                          </div>

                          {/* Room Description */}
                          {phong.MoTa && (
                            <p className="ctd-room-description">
                              {phong.MoTa.length > 80
                                ? `${phong.MoTa.substring(0, 80)}...`
                                : phong.MoTa}
                            </p>
                          )}

                          {/* CTA Button */}
                          {isAvailable && (
                            <button
                              className="ctd-room-cta"
                              onClick={() => openHenModal(phong.PhongID)}
                            >
                              <HiOutlineCalendar />
                              <span>Đặt lịch xem phòng</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vị trí */}
            {tinDang.ViDo && tinDang.KinhDo ? (
              <MapViTriPhong
                lat={parseFloat(tinDang.ViDo)}
                lng={parseFloat(tinDang.KinhDo)}
                tenDuAn={tinDang.TenDuAn || tinDang.TieuDe}
                diaChi={tinDang.DiaChiDuAn || tinDang.DiaChi}
                zoom={15}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            ) : (
              <div className="ctd-section">
                <h2 className="ctd-section-title">
                  <HiOutlineMapPin />
                  <span>Vị trí</span>
                </h2>
                <div className="ctd-location">
                  <div className="ctd-location-item">
                    <HiOutlineMapPin className="ctd-location-icon" />
                    <div>
                      <span className="ctd-location-label">Địa chỉ</span>
                      <p className="ctd-location-address">{tinDang.DiaChi}</p>
                    </div>
                  </div>
                  <div className="ctd-location-item">
                    <HiOutlineMapPin className="ctd-location-icon" />
                    <div>
                      <span className="ctd-location-label">Khu vực</span>
                      <p className="ctd-location-text">{tinDang.TenKhuVuc}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Info Card */}
          <div className="ctd-right">
            <div className="ctd-info-card">
              <div className="ctd-info-header">
                <h1 className="ctd-info-title">{tinDang.TieuDe}</h1>
                <div className="ctd-info-price">
                  <span className="ctd-price-value">{getGiaHienThi()}</span>
                  <span className="ctd-price-unit">/tháng</span>
                </div>
              </div>

              <div className="ctd-info-highlights">
                <div className="ctd-highlight">
                  <HiOutlineSquare3Stack3D />
                  <span>{getDienTichHienThi()}</span>
                </div>
                {tinDang.TongSoPhong > 0 && (
                  <div className="ctd-highlight">
                    <HiOutlineHome />
                    <span>{tinDang.TongSoPhong} phòng</span>
                  </div>
                )}
              </div>

              <div className="ctd-actions">
                <button
                  className="ctd-btn-primary ctd-btn-full"
                  onClick={() => openHenModal(null)}
                  disabled={henSubmitting}
                >
                  <HiOutlineCalendar />
                  <span>Đặt lịch xem phòng</span>
                </button>
                <button
                  className="ctd-btn-secondary ctd-btn-full"
                  onClick={handleChiaSeHu}
                >
                  <HiOutlineShare />
                  <span>Chia sẻ tin đăng</span>
                </button>
                <button
                  className="ctd-btn-secondary ctd-btn-deposit"
                  onClick={() => {
                    // Case 1: Có nhiều phòng (> 1) -> Mở modal chọn phòng
                    if (tinDang?.DanhSachPhong?.length > 1) {
                      setCocModalOpen(true);
                      return;
                    }

                    // Case 2: Có đúng 1 phòng -> Chạy quy trình đặt cọc mới (Check ví -> Hợp đồng)
                    if (tinDang?.DanhSachPhong?.length === 1) {
                      const phong = tinDang.DanhSachPhong[0];
                      handlePreDepositCheck(phong);
                      return;
                    }

                    // Case 3: Fallback (Không có phòng hoặc lỗi data) - Logic cũ chuyển khoản
                    const tinId = tinDang?.TinDangID ?? tinDang?.id ?? "";
                    const acc = tinDang?.BankAccountNumber ?? "80349195777";
                    const bank = tinDang?.BankName ?? "TPBank";
                    let amount = "1000000";

                    if (tinDang?.TienCoc && tinDang.TienCoc > 0) {
                      amount = String(tinDang.TienCoc);
                    } else if (tinDang?.Gia && tinDang.Gia > 0) {
                      amount = String(tinDang.Gia);
                    }

                    const des = `dk${tinId}`;
                    navigate(
                      `/thanhtoancoc?acc=${encodeURIComponent(
                        acc
                      )}&bank=${encodeURIComponent(
                        bank
                      )}&amount=${encodeURIComponent(
                        amount
                      )}&des=${encodeURIComponent(
                        des
                      )}&tinId=${encodeURIComponent(
                        tinId
                      )}&order=${encodeURIComponent(tinId)}`
                    );
                  }}
                  title="Đặt cọc"
                >
                  <HiOutlineCurrencyDollar
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  <span>Đặt cọc</span>
                </button>
              </div>

              {/* Thông tin dự án */}
              {tinDang.TenDuAn && (
                <div className="ctd-info-owner">
                  <div className="ctd-owner-header">
                    <HiOutlineBuildingOffice2 className="ctd-owner-icon" />
                    <div>
                      <h4>Dự án</h4>
                      <p>{tinDang.TenDuAn}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lưu ý an toàn */}
              <div className="ctd-safety-tips">
                <h4 className="ctd-tips-title">
                  <span>⚠️</span>
                  <span>Lưu ý an toàn</span>
                </h4>
                <ul className="ctd-tips-list">
                  <li>Không chuyển tiền trước khi xem phòng</li>
                  <li>Gặp trực tiếp và xem phòng thật</li>
                  <li>Kiểm tra giấy tờ pháp lý</li>
                  <li>Đọc kỹ hợp đồng trước khi ký</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tin đăng tương tự */}
        {tinTuongTu.length > 0 && (
          <div className="ctd-section ctd-similar">
            <h2 className="ctd-section-title">Tin đăng tương tự</h2>
            <div className="ctd-similar-grid">
              {/* TODO: Render danh sách tin tương tự */}
            </div>
          </div>
        )}

        {/* 🎨 NEW: Image Lightbox */}
        {lightboxOpen && (
          <div
            className="ctd-lightbox"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <div
              className="ctd-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="ctd-lightbox-close"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <HiOutlineXCircle />
              </button>

              <img
                src={danhSachAnh[currentImageIndex]}
                alt={`${tinDang.TieuDe} - Full size`}
                className="ctd-lightbox-image"
              />

              {danhSachAnh.length > 1 && (
                <>
                  <button
                    className="ctd-lightbox-nav ctd-lightbox-prev"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <HiOutlineChevronLeft />
                  </button>
                  <button
                    className="ctd-lightbox-nav ctd-lightbox-next"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <HiOutlineChevronRight />
                  </button>

                  <div className="ctd-lightbox-counter">
                    {currentImageIndex + 1} / {danhSachAnh.length}
                  </div>

                  {/* Thumbnail strip */}
                  <div className="ctd-lightbox-thumbs">
                    {danhSachAnh.map((url, index) => (
                      <div
                        key={index}
                        className={`ctd-lightbox-thumb ${
                          index === currentImageIndex ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                      >
                        <img src={url} alt={`Thumb ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 🎨 NEW: Scroll Progress Bar */}
        <div
          className="ctd-scroll-progress"
          style={{ width: `${scrollProgress}%` }}
          role="progressbar"
          aria-valuenow={scrollProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        />

        {/* 💰 Modal chọn phòng để đặt cọc */}
        {cocModalOpen && (
          <div
            className="hen-modal-overlay"
            onClick={() => setCocModalOpen(false)}
          >
            <div
              className="hen-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h3>Chọn phòng để đặt cọc</h3>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
                Vui lòng chọn phòng bạn muốn đặt cọc
              </p>

              <div className="coc-phong-list">
                {tinDang?.DanhSachPhong?.map((phong) => (
                  <div
                    key={phong.PhongID}
                    className={`coc-phong-item ${
                      cocPhongId === phong.PhongID ? "selected" : ""
                    }`}
                    onClick={() => setCocPhongId(phong.PhongID)}
                  >
                    <div className="coc-phong-info">
                      <h4>{phong.TenPhong}</h4>
                      <div className="coc-phong-specs">
                        <span>{phong.DienTich} m²</span>
                        <span>•</span>
                        <span className="coc-phong-price">
                          {formatCurrency(phong.Gia)}/tháng
                        </span>
                      </div>
                      <div className="coc-phong-status">
                        {phong.TrangThaiPhong === "Trong" ? (
                          <>
                            <HiOutlineCheckCircle
                              style={{ color: "#10b981" }}
                            />
                            <span>Còn trống</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineXCircle style={{ color: "#ef4444" }} />
                            <span>Đã thuê</span>
                          </>
                        )}
                      </div>
                    </div>
                    {phong.AnhPhong && (
                      <img
                        src={getStaticUrl(phong.AnhPhong)}
                        alt={phong.TenPhong}
                        className="coc-phong-thumb"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="hen-form-footer">
                <button
                  type="button"
                  className="hen-btn secondary"
                  onClick={() => {
                    setCocModalOpen(false);
                    setCocPhongId(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="hen-btn primary"
                  disabled={!cocPhongId || checkingCoc}
                  onClick={async () => {
                    const phong = tinDang?.DanhSachPhong?.find(
                      (p) => p.PhongID === cocPhongId
                    );
                    if (!phong) {
                      showToast("Vui lòng chọn phòng", "error");
                      return;
                    }
                    await handlePreDepositCheck(phong);
                  }}
                >
                  Xác nhận đặt cọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xem trước hợp đồng đặt cọc */}
        {hopDongModalOpen && (
          <div
            className="hen-modal-overlay"
            onClick={() => !hopDongLoading && closeHopDongModal()}
          >
            <div
              className="hop-dong-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="hop-dong-modal__header">
                <h3>Hợp đồng đặt cọc</h3>
                {hopDongPhong && (
                  <p className="hop-dong-modal__subtitle">
                    Phòng: {hopDongPhong.TenPhong} • {formatCurrency(hopDongPhong.Gia)}/tháng
                  </p>
                )}
              </div>

              {hopDongLoading && (
                <div className="hop-dong-modal__state">Đang tải hợp đồng...</div>
              )}

              {!hopDongLoading && hopDongError && (
                <div className="hop-dong-modal__alert">❌ {hopDongError}</div>
              )}

              {!hopDongLoading && !hopDongError && hopDongData && (
                <>
                  {/* Chọn thời hạn hợp đồng (số tháng) */}
                  <div className="hop-dong-modal__date-picker">
                    <label htmlFor="soThangKy">
                      <span className="date-picker-icon">📄</span>
                      Thời hạn hợp đồng (tháng) <span className="required">*</span>
                    </label>
                    {bangHoaHongOptions.length > 0 ? (
                      <select
                        id="soThangKy"
                        className="hop-dong-select"
                        value={soThangKy}
                        onChange={(e) => handleChangeSoThangKy(e.target.value)}
                      >
                        {bangHoaHongOptions.map((item) => (
                          <option key={item.soThang} value={item.soThang}>
                            {item.soThang} tháng
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        id="soThangKy"
                        className="hop-dong-select"
                        min={1}
                        value={soThangKy}
                        onChange={(e) => handleChangeSoThangKy(e.target.value)}
                      />
                    )}
                    <p className="date-picker-hint">
                      Tiền cọc tạm tính: {formatCurrency(getSoTienCocHienTai())}
                    </p>
                  </div>

                  {/* Input chọn ngày chuyển vào */}
                  <div className="hop-dong-modal__date-picker">
                    <label htmlFor="ngayChuyenVao">
                      <span className="date-picker-icon">📅</span>
                      Ngày muốn chuyển vào <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="ngayChuyenVao"
                      value={ngayChuyenVao}
                      onChange={(e) => setNgayChuyenVao(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="date-picker-hint">
                      Chọn ngày bạn dự kiến chuyển vào ở. Ngày này sẽ được ghi nhận làm ngày bắt đầu hợp đồng.
                    </p>
                  </div>

                  <div
                    className="hop-dong-modal__preview"
                    dangerouslySetInnerHTML={{
                      __html:
                        hopDongData?.renderedHtml ||
                        hopDongData?.noiDungSnapshot ||
                        "",
                    }}
                  />
                </>
              )}

              <div className="hop-dong-modal__actions">
                <button
                  type="button"
                  className="hen-btn secondary"
                  onClick={closeHopDongModal}
                  disabled={hopDongLoading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="hen-btn primary"
                  onClick={handleHopDongAgree}
                  disabled={
                    hopDongLoading || hopDongError !== null || !hopDongData
                  }
                >
                  Đồng ý đặt cọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal đặt lịch (thêm trước Footer) */}
        {henModalOpen && (
          <div
            className="hen-modal-overlay"
            onClick={() => !henSubmitting && setHenModalOpen(false)}
          >
            <div
              className="hen-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h3>Đặt lịch xem phòng</h3>
              <form onSubmit={submitHen} className="hen-form">
                <div className="hen-form-row">
                  <label>Phòng</label>
                  <select
                    value={henPhongId ?? ""}
                    onChange={(e) =>
                      setHenPhongId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">(Không chọn phòng cụ thể)</option>
                    {tinDang?.DanhSachPhong?.map((p) => (
                      <option key={p.PhongID} value={p.PhongID}>
                        {p.TenPhong} - {formatCurrency(p.Gia)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hen-form-row">
                  <label>Thời gian hẹn</label>
                  <input
                    type="datetime-local"
                    value={henThoiGian}
                    onChange={(e) => setHenThoiGian(e.target.value)}
                    required
                    min={new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16)}
                  />
                </div>
                <div className="hen-form-row">
                  <label>Ghi chú (tuỳ chọn)</label>
                  <textarea
                    value={henGhiChu}
                    onChange={(e) => setHenGhiChu(e.target.value)}
                    placeholder="Ví dụ: Muốn xem phòng buổi chiều..."
                    rows={3}
                  />
                </div>
                <div className="hen-form-footer">
                  <button
                    type="button"
                    className="hen-btn secondary"
                    disabled={henSubmitting}
                    onClick={() => setHenModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="hen-btn primary"
                    disabled={henSubmitting}
                  >
                    {henSubmitting ? "Đang gửi..." : "Xác nhận đặt lịch"}
                  </button>
                </div>
                <div className="hen-note">
                  PheDuyetChuDuAn sẽ gửi: {getPheDuyetChuValue()}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ChiTietTinDang;

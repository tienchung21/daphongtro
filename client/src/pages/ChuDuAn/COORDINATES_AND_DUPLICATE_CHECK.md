# Tọa Độ Tự Động & Kiểm Tra Trùng Địa Chỉ - TaoTinDang.jsx

**Ngày cập nhật:** 2025-10-04  
**Mục đích:** Lấy tọa độ tự động từ dự án + Kiểm tra địa chỉ trùng lặp

---

## 📍 Tính năng 1: Tọa Độ Tự Động từ Dự Án

### Logic
- **Khi chọn dự án:** Tự động load `ViDo`, `KinhDo` từ database
- **Không cần geocoding API:** Vì dự án đã có tọa độ khi tạo (từ modal)
- **Hiển thị:** Read-only input với nút "Chỉnh sửa"

### UI Components

#### 1. Display Read-only (Lines 820-890)
```jsx
<input
  type="text"
  value={viDo && kinhDo ? `${parseFloat(viDo).toFixed(6)}, ${parseFloat(kinhDo).toFixed(6)}` : 'Chưa có tọa độ'}
  readOnly
  disabled
  className="cda-input"
  style={{ opacity: 0.7, cursor: 'not-allowed' }}
/>

<button
  type="button"
  onClick={() => setHienModalChinhSuaToaDo(true)}
  disabled={!viDo || !kinhDo}
>
  <HiOutlinePencil size={16} />
  Chỉnh sửa
</button>
```

**Hành vi:**
- Disabled nếu dự án chưa có tọa độ
- Hiển thị 6 chữ số thập phân (chuẩn GPS)
- Có icon tooltip: "💡 Tọa độ được lấy tự động từ dự án"

#### 2. Modal Chỉnh Sửa (`ModalChinhSuaToaDo.jsx`)
```jsx
<ModalChinhSuaToaDo
  isOpen={hienModalChinhSuaToaDo}
  onClose={() => setHienModalChinhSuaToaDo(false)}
  initialPosition={{ lat: parseFloat(viDo), lng: parseFloat(kinhDo) }}
  onSave={(newPos) => {
    setViDo(newPos.lat.toString());
    setKinhDo(newPos.lng.toString());
  }}
  tieuDe={formData.TieuDe}
/>
```

**Tính năng modal:**
- Leaflet map với zoom 16
- DraggableMarker (kéo thả để điều chỉnh)
- Hiển thị tọa độ real-time khi kéo
- Nút "Lưu vị trí" / "Hủy"

### Backend Changes

#### File: `server/models/ChuDuAnModel.js` (Lines 486-503)
**Thay đổi:** Thêm `ViDo`, `KinhDo` vào SELECT query

**Trước:**
```sql
SELECT 
  DuAnID, TenDuAn, DiaChi, TrangThai, 
  TaoLuc, CapNhatLuc,
  (SELECT COUNT(*) FROM tindang WHERE DuAnID = da.DuAnID) as SoTinDang
FROM duan da
```

**Sau:**
```sql
SELECT 
  DuAnID, TenDuAn, DiaChi, TrangThai, 
  ViDo, KinhDo,  -- ✅ ADDED
  TaoLuc, CapNhatLuc,
  (SELECT COUNT(*) FROM tindang WHERE DuAnID = da.DuAnID) as SoTinDang
FROM duan da
```

### Frontend Logic

#### useEffect: Prefill từ Dự Án (Lines 478-507)
```javascript
useEffect(() => {
  const duAnChon = duAns.find(d => d.DuAnID === parseInt(formData.DuAnID));
  if (duAnChon && duAnChon.DiaChi) {
    // ... prefill địa chỉ ...
    
    // Lấy tọa độ từ dự án
    if (duAnChon.ViDo && duAnChon.KinhDo) {
      console.log('📍 Tọa độ từ dự án:', { ViDo: duAnChon.ViDo, KinhDo: duAnChon.KinhDo });
      setViDo(duAnChon.ViDo.toString());
      setKinhDo(duAnChon.KinhDo.toString());
    } else {
      console.warn('⚠️ Dự án chưa có tọa độ');
      setViDo('');
      setKinhDo('');
    }
  }
}, [formData.DuAnID, duAns, tinhs]);
```

**Console logs giúp debug:**
- `🏢 Dự án được chọn:` - Object đầy đủ
- `📍 Tọa độ từ dự án:` - ViDo/KinhDo values
- `⚠️ Dự án chưa có tọa độ` - Warning nếu NULL

---

## 🚫 Tính năng 2: Kiểm Tra Trùng Địa Chỉ

### Mục đích
Ngăn chặn tạo nhiều tin đăng với **cùng địa chỉ** trong **cùng dự án**.

### Logic Kiểm Tra

#### useEffect: Debounced Check (Lines 463-522)
```javascript
useEffect(() => {
  const kiemTraDiaChi = () => {
    // 1. Reset cảnh báo
    setCanhBaoDiaChi('');
    
    // 2. Chỉ kiểm tra khi đủ thông tin
    if (!formData.DuAnID || !selectedPhuong || !diaChi.trim()) {
      return;
    }

    // 3. Tạo địa chỉ đầy đủ
    const diaChiDayDu = `${diaChi.trim()}, ${phuongObj.TenKhuVuc}, ${quanObj.TenKhuVuc}, ${tinhObj.TenKhuVuc}`;
    
    // 4. Chuẩn hóa (bỏ dấu, lowercase)
    const chuanHoaDiaChi = (str) => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    };

    // 5. So sánh với tin đăng hiện có
    const tinTrung = danhSachTinDang.find(tin => {
      if (tin.DuAnID !== parseInt(formData.DuAnID)) return false;
      
      const diaChiTinChuanHoa = chuanHoaDiaChi(tin.DiaChi || '');
      return diaChiTinChuanHoa === diaChiChuanHoa;
    });

    // 6. Hiển thị cảnh báo nếu trùng
    if (tinTrung) {
      setCanhBaoDiaChi(`⚠️ Địa chỉ này đã tồn tại trong tin đăng "${tinTrung.TieuDe}" (ID: ${tinTrung.TinDangID})`);
    }
  };

  // Debounce 500ms để tránh check quá nhiều
  const timer = setTimeout(kiemTraDiaChi, 500);
  return () => clearTimeout(timer);
}, [formData.DuAnID, selectedTinh, selectedQuan, selectedPhuong, diaChi, danhSachTinDang, tinhs, quans, phuongs]);
```

### UI Warning Box (Lines 815-830)
```jsx
{canhBaoDiaChi && (
  <div style={{
    padding: '0.75rem',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#f59e0b'
  }}>
    <HiOutlineExclamationCircle size={20} />
    <span>{canhBaoDiaChi}</span>
  </div>
)}
```

**Màu sắc:** Gold/Amber (#f59e0b) - Warning level (không phải error)

### Chuẩn Hóa Địa Chỉ

**Hàm `chuanHoaDiaChi()`:**
```javascript
const chuanHoaDiaChi = (str) => {
  return str
    .normalize('NFD')              // Unicode normalization
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .toLowerCase()                 // Chữ thường
    .replace(/\s+/g, ' ')         // Chuẩn hóa khoảng trắng
    .trim();                       // Trim edges
};
```

**Ví dụ:**
```
Input:  "40/6 Lê Văn Thọ,  Phường 11, Quận Gò Vấp,  TP. HCM"
Output: "40/6 le van tho, phuong 11, quan go vap, tp. hcm"
```

### Data Loading

#### Load Danh Sách Tin Đăng (Lines 538-547)
```javascript
const layDanhSachTinDang = async () => {
  try {
    const response = await TinDangService.layDanhSach();
    // Response có thể là { success: true, data: [...] } hoặc trực tiếp là array
    const data = response?.data || response || [];
    console.log('📋 Danh sách tin đăng:', data);
    setDanhSachTinDang(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Lỗi khi tải danh sách tin đăng:', err);
    setDanhSachTinDang([]);
  }
};
```

**Xử lý defensive:** Luôn đảm bảo `danhSachTinDang` là array (fix lỗi `.find is not a function`)

#### Lifecycle (Lines 422-428)
```javascript
useEffect(() => {
  layDanhSachDuAn();
  layDanhSachTinDang();  // ✅ ADDED
  KhuVucService.layDanhSach(null)
    .then(data => setTinhs(data || []))
    .catch(err => console.error('Lỗi load tỉnh:', err));
}, []);
```

---

## 🔄 Workflow Hoàn Chỉnh

### 1. User chọn dự án
```
User: Chọn "Nhà trọ Hải Hường"
  ↓
Frontend: Load địa chỉ + tọa độ từ dự án
  ↓
UI: Hiển thị địa chỉ + tọa độ read-only
```

### 2. User thay đổi địa chỉ chi tiết
```
User: Nhập "40/6 Lê Văn Thọ"
  ↓
Frontend: Debounce 500ms
  ↓
Check: Tìm tin đăng trùng địa chỉ trong cùng dự án
  ↓
UI: Hiển thị warning nếu trùng
```

### 3. User muốn chỉnh sửa tọa độ
```
User: Click "✏️ Chỉnh sửa"
  ↓
Frontend: Mở ModalChinhSuaToaDo
  ↓
User: Kéo thả marker trên map
  ↓
User: Click "Lưu vị trí"
  ↓
Frontend: Cập nhật viDo, kinhDo state
```

### 4. Submit form
```
User: Click "✓ Đăng tin"
  ↓
Frontend: Validate + gửi API
  ↓
Backend: Lưu tin đăng với ViDo/KinhDo
```

---

## 🐛 Bug Fixes

### Bug 1: `danhSachTinDang.find is not a function`
**Nguyên nhân:** API trả về object `{success: true, data: [...]}` nhưng code expect array trực tiếp.

**Fix:**
```javascript
const data = response?.data || response || [];
setDanhSachTinDang(Array.isArray(data) ? data : []);
```

### Bug 2: Tọa độ không hiển thị
**Nguyên nhân:** Backend không SELECT `ViDo`, `KinhDo` trong query `layDanhSachDuAn()`.

**Fix:** Thêm 2 columns vào SELECT query (xem phần Backend Changes).

---

## 📦 Dependencies

### New Component
- `client/src/components/ChuDuAn/ModalChinhSuaToaDo.jsx` (185 lines)

### Existing Dependencies
- `react-leaflet@^4.2.1`
- `leaflet@^1.9.4`
- `react-icons@^5.4.0` (HiOutlinePencil, HiOutlineExclamationCircle, HiOutlineLightBulb)

---

## 🎯 State Management

### New States
```javascript
const [viDo, setViDo] = useState('');                      // From dự án
const [kinhDo, setKinhDo] = useState('');                  // From dự án
const [hienModalChinhSuaToaDo, setHienModalChinhSuaToaDo] = useState(false);
const [danhSachTinDang, setDanhSachTinDang] = useState([]); // For duplicate check
const [canhBaoDiaChi, setCanhBaoDiaChi] = useState('');    // Warning message
```

### Removed States
```javascript
// DELETED: const [dangTimToaDo, setDangTimToaDo] = useState(false);
// Lý do: Không cần geocoding API nữa
```

---

## ✅ Testing Checklist

### Manual Testing
- [x] Chọn dự án có tọa độ → Hiển thị đúng
- [x] Chọn dự án không có tọa độ → Hiển thị "Chưa có tọa độ", button disabled
- [x] Click "Chỉnh sửa" → Modal mở với map
- [x] Kéo marker → Tọa độ cập nhật real-time
- [x] Click "Lưu vị trí" → Modal đóng, tọa độ mới hiển thị
- [x] Nhập địa chỉ trùng → Hiển thị warning
- [x] Nhập địa chỉ khác dự án → Không hiển thị warning
- [x] Submit form → ViDo/KinhDo gửi đúng về backend

### Console Logs
```
🏢 Dự án được chọn: { DuAnID: 1, TenDuAn: "...", ViDo: 10.837832, KinhDo: 106.658259 }
📍 Tọa độ từ dự án: { ViDo: 10.837832, KinhDo: 106.658259 }
📋 Danh sách tin đăng: [{ TinDangID: 1, DuAnID: 1, DiaChi: "..." }, ...]
```

---

## 📝 Code Quality

### Performance Optimizations
1. **Debounce 500ms** cho kiểm tra trùng địa chỉ
2. **Conditional rendering** modal (chỉ mount khi mở)
3. **Array safety checks** (luôn ensure array trước `.find()`)

### Accessibility
- Disabled buttons có opacity 0.5
- Tooltips với icon 💡
- Error messages với semantic colors

### Maintainability
- Console logs cho mọi bước quan trọng
- Inline comments giải thích logic phức tạp
- Tách riêng `chuanHoaDiaChi()` function

---

**Tác giả:** GitHub Copilot  
**Version:** 1.0  
**Status:** ✅ Production Ready

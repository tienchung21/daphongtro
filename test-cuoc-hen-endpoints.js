/**
 * Script test các endpoints cuộc hẹn
 * Chạy: node test-cuoc-hen-endpoints.js
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

// Thông tin đăng nhập test (thay đổi theo DB của bạn)
const TEST_LOGIN = {
  email: 'chuduan@test.com', // Thay bằng email ChuDuAn trong DB
  password: '123456' // Thay bằng password
};

let authToken = null;

/**
 * Bước 1: Đăng nhập để lấy token
 */
async function login() {
  try {
    console.log('\n🔐 [1/5] Đăng nhập...');
    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_LOGIN)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    if (data.token) {
      authToken = data.token;
      console.log('✅ Đăng nhập thành công');
      console.log('   Token:', authToken.substring(0, 30) + '...');
      console.log('   User ID:', data.NguoiDungID);
      console.log('   Vai trò:', data.VaiTro);
      return true;
    } else {
      throw new Error('Không nhận được token từ server');
    }
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error.message);
    console.log('\n💡 Hướng dẫn:');
    console.log('   1. Kiểm tra server đang chạy trên cổng 5000');
    console.log('   2. Sửa email/password trong file này');
    console.log('   3. Đảm bảo user có VaiTro = "ChuDuAn" trong DB');
    return false;
  }
}

/**
 * Bước 2: Test GET /api/chu-du-an/cuoc-hen/metrics
 */
async function testGetMetrics() {
  try {
    console.log('\n📊 [2/5] Test GET /cuoc-hen/metrics...');
    const response = await fetch(`${API_BASE}/api/chu-du-an/cuoc-hen/metrics`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    console.log('✅ Metrics loaded thành công:');
    console.log('   Chờ duyệt:', data.data.choDuyet);
    console.log('   Đã xác nhận:', data.data.daXacNhan);
    console.log('   Sắp diễn ra:', data.data.sapDienRa);
    console.log('   Đã hủy:', data.data.daHuy);
    console.log('   Hoàn thành:', data.data.hoanThanh);
    return true;
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return false;
  }
}

/**
 * Bước 3: Test GET /api/chu-du-an/cuoc-hen
 */
async function testGetCuocHenList() {
  try {
    console.log('\n📋 [3/5] Test GET /cuoc-hen (danh sách)...');
    const response = await fetch(`${API_BASE}/api/chu-du-an/cuoc-hen`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    console.log('✅ Danh sách loaded thành công:');
    console.log('   Tổng số cuộc hẹn:', data.data.tongSo);
    console.log('   Số lượng trả về:', data.data.cuocHens?.length || 0);
    
    if (data.data.cuocHens && data.data.cuocHens.length > 0) {
      const firstItem = data.data.cuocHens[0];
      console.log('   Cuộc hẹn đầu tiên:');
      console.log('     - ID:', firstItem.CuocHenID);
      console.log('     - Thời gian:', firstItem.ThoiGianHen);
      console.log('     - Trạng thái:', firstItem.TrangThai);
      console.log('     - Phê duyệt:', firstItem.PheDuyetChuDuAn);
      return firstItem.CuocHenID; // Return ID để test phê duyệt
    } else {
      console.log('   ⚠️  Chưa có cuộc hẹn nào trong DB');
      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return null;
  }
}

/**
 * Bước 4: Test POST /api/chu-du-an/cuoc-hen/:id/phe-duyet
 */
async function testPheDuyet(cuocHenId) {
  if (!cuocHenId) {
    console.log('\n⏭️  [4/5] Skip test phê duyệt (không có cuộc hẹn)');
    return false;
  }

  try {
    console.log(`\n✅ [4/5] Test POST /cuoc-hen/${cuocHenId}/phe-duyet...`);
    const response = await fetch(`${API_BASE}/api/chu-du-an/cuoc-hen/${cuocHenId}/phe-duyet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phuongThucVao: 'Vào cổng chính, gặp bảo vệ trình giấy tờ. Sau đó lên tầng 3 phòng 301.',
        ghiChu: 'Test từ script - Đã xác nhận cuộc hẹn'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Có thể cuộc hẹn không ở trạng thái ChoPheDuyet
      console.log(`⚠️  Không thể phê duyệt: ${data.message}`);
      return false;
    }

    console.log('✅ Phê duyệt thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return false;
  }
}

/**
 * Bước 5: Test POST /api/chu-du-an/cuoc-hen/:id/tu-choi
 */
async function testTuChoi(cuocHenId) {
  if (!cuocHenId) {
    console.log('\n⏭️  [5/5] Skip test từ chối (không có cuộc hẹn)');
    return false;
  }

  try {
    console.log(`\n❌ [5/5] Test POST /cuoc-hen/${cuocHenId}/tu-choi...`);
    const response = await fetch(`${API_BASE}/api/chu-du-an/cuoc-hen/${cuocHenId}/tu-choi`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lyDoTuChoi: 'Thời gian không phù hợp - Test từ script'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.log(`⚠️  Không thể từ chối: ${data.message}`);
      return false;
    }

    console.log('✅ Từ chối thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return false;
  }
}

/**
 * Main test flow
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 TEST CUỘC HẸN ENDPOINTS');
  console.log('═══════════════════════════════════════════════════');

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Test dừng lại do không đăng nhập được');
    process.exit(1);
  }

  // Step 2: Test metrics
  await testGetMetrics();

  // Step 3: Test list
  const cuocHenId = await testGetCuocHenList();

  // Step 4: Test phê duyệt (chỉ test nếu có cuộc hẹn)
  await testPheDuyet(cuocHenId);

  // Step 5: Test từ chối (dùng ID khác hoặc skip)
  // await testTuChoi(cuocHenId); // Comment out để không test 2 lần trên cùng ID

  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎉 HOÀN THÀNH TẤT CẢ TESTS');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run
runTests().catch(error => {
  console.error('💥 Lỗi nghiêm trọng:', error);
  process.exit(1);
});

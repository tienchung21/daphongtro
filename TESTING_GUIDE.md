# 🧪 Hướng Dẫn Test - Messaging Feature & UC-PROJ-04

## 📋 Mục Lục
1. [Chuẩn bị môi trường test](#1-chuẩn-bị-môi-trường-test)
2. [Test UC-PROJ-04: Upload File Scan Hợp Đồng](#2-test-uc-proj-04-upload-file-scan-hợp-đồng)
3. [Test Chat REST API](#3-test-chat-rest-api)
4. [Test Socket.IO Real-time](#4-test-socketio-real-time)
5. [Test Frontend UI](#5-test-frontend-ui)
6. [Test Integration](#6-test-integration)
7. [Test Security & Performance](#7-test-security--performance)

---

## 1. Chuẩn Bị Môi Trường Test

### Bước 1.1: Cài đặt dependencies

```bash
# Backend
cd server
npm install socket.io isomorphic-dompurify

# Frontend
cd client
npm install socket.io-client
```

### Bước 1.2: Chạy migrations

```bash
# Migration 1: Thêm FileScanPath cho hopdong
mysql -u root -p thue_tro < migrations/2025_11_04_add_hopdong_filescan.sql

# Migration 2: Update chat schema
mysql -u root -p thue_tro < migrations/2025_11_04_update_chat_schema.sql
```

**Verify migration:**
```sql
-- Kiểm tra cột FileScanPath đã được thêm
DESCRIBE hopdong;

-- Kiểm tra cột TinNhanCuoiDocLuc
DESCRIBE thanhviencuochoithoai;

-- Kiểm tra indexes
SHOW INDEX FROM cuochoithoai;
SHOW INDEX FROM tinnhan;

-- Kiểm tra trigger
SHOW TRIGGERS LIKE 'tinnhan';
```

### Bước 1.3: Khởi động servers

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

**Expected output (Backend):**
```
✅ Server chạy tại http://localhost:5000
🔌 Socket.IO chạy tại ws://localhost:5000
💬 Chat: GET/POST /api/chat/conversations (Real-time với Socket.IO)
📡 Socket.IO Events:
   - join_conversation, leave_conversation
   - send_message, typing_start, typing_stop
   - mark_as_read
```

### Bước 1.4: Lấy JWT Token

**Đăng nhập để lấy token:**

1. **Qua UI:** Login tại http://localhost:3000/login
2. **Qua API:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Lưu token:**
```bash
# Copy token từ response
export TOKEN="YOUR_JWT_TOKEN_HERE"

# Lấy userId từ localStorage hoặc decode JWT
export USER_ID="123"
```

---

## 2. Test UC-PROJ-04: Upload File Scan Hợp Đồng

### Test 2.1: Báo cáo hợp đồng (Không có file)

**Mục tiêu:** Verify API báo cáo hợp đồng hoạt động

```bash
curl -X POST http://localhost:5000/api/chu-du-an/hop-dong/bao-cao \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "TinDangID": 1,
    "KhachHangID": 2,
    "PhongID": 1,
    "NgayBatDau": "2025-01-01",
    "NgayKetThuc": "2025-12-31",
    "GiaThueCuoiCung": 5000000,
    "DoiTruCocVaoTienThue": false,
    "NoiDungSnapshot": "Test contract"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Báo cáo hợp đồng thành công",
  "data": {
    "HopDongID": 1
  }
}
```

✅ **Kiểm tra DB:**
```sql
SELECT * FROM hopdong WHERE HopDongID = 1;
-- Verify: FileScanPath = NULL (chưa upload)
```

### Test 2.2: Upload file scan

**Chuẩn bị file test:**
- Tạo file PDF hoặc JPG để test (size < 10MB)
- Đặt tên: `test-contract.pdf`

**Upload qua curl:**
```bash
curl -X POST http://localhost:5000/api/chu-du-an/hop-dong/1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test-contract.pdf"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Upload file scan hợp đồng thành công",
  "data": {
    "filePath": "/uploads/hop-dong/1/1730738400000_test-contract.pdf",
    "fileName": "test-contract.pdf"
  }
}
```

✅ **Verify:**
```bash
# Kiểm tra file tồn tại
ls -la public/uploads/hop-dong/1/

# Kiểm tra DB
mysql -u root -p thue_tro -e "SELECT HopDongID, FileScanPath FROM hopdong WHERE HopDongID = 1;"
```

### Test 2.3: UI Test - Form báo cáo hợp đồng

**Steps:**
1. ✅ Login vào hệ thống với role "ChuDuAn"
2. ✅ Navigate đến trang Quản lý Phòng
3. ✅ Tìm phòng có trạng thái "GiuCho"
4. ✅ Click button "Báo cáo hợp đồng"
5. ✅ Điền form:
   - Khách hàng ID
   - Ngày bắt đầu / kết thúc
   - Giá thuê cuối cùng
   - Chọn "Đối trừ cọc" hoặc "Giải tỏa cọc"
   - **Chọn file PDF/JPG** (click vùng upload)
6. ✅ Click "Xác nhận báo cáo"

**Expected:**
- ✅ Form validation hoạt động (required fields)
- ✅ File preview hiển thị tên + size
- ✅ Upload progress hiển thị
- ✅ Success message: "✅ Báo cáo hợp đồng thành công!"
- ✅ File được lưu vào server

### Test 2.4: Edge Cases

**Test invalid file type:**
```bash
# Upload file .exe (should fail)
curl -X POST http://localhost:5000/api/chu-du-an/hop-dong/1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.exe"
```
**Expected:** Error "Chỉ chấp nhận file PDF, JPG, hoặc PNG"

**Test file quá lớn:**
```bash
# Tạo file > 10MB
dd if=/dev/zero of=large-file.pdf bs=1M count=15

# Upload
curl -X POST http://localhost:5000/api/chu-du-an/hop-dong/1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large-file.pdf"
```
**Expected:** Error về size limit

---

## 3. Test Chat REST API

### Test 3.1: Tạo cuộc hội thoại

```bash
curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "NguCanhID": 1,
    "NguCanhLoai": "CuocHen",
    "ThanhVienIDs": [2, 3],
    "TieuDe": "Cuộc hẹn #1 - Test Conversation"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "CuocHoiThoaiID": 1
  }
}
```

✅ **Verify DB:**
```sql
SELECT * FROM cuochoithoai WHERE CuocHoiThoaiID = 1;
SELECT * FROM thanhviencuochoithoai WHERE CuocHoiThoaiID = 1;
```

### Test 3.2: Lấy danh sách cuộc hội thoại

```bash
curl -X GET "http://localhost:5000/api/chat/conversations?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected response:**
```json
{
  "success": true,
  "data": [
    {
      "CuocHoiThoaiID": 1,
      "NguCanhID": 1,
      "NguCanhLoai": "CuocHen",
      "TieuDe": "Cuộc hẹn #1 - Test Conversation",
      "ThoiDiemTinNhanCuoi": "2025-11-04T10:30:00.000Z",
      "SoTinChuaDoc": 5,
      "TinNhanCuoi": "Hello test message",
      "ThanhVienKhac": [
        {
          "NguoiDungID": 2,
          "TenDayDu": "Nguyễn Văn A",
          "AnhDaiDien": null
        }
      ]
    }
  ]
}
```

### Test 3.3: Gửi tin nhắn (REST fallback)

```bash
curl -X POST http://localhost:5000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "NoiDung": "Xin chào! Đây là tin nhắn test."
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "TinNhanID": 1,
    "CuocHoiThoaiID": 1,
    "NguoiGuiID": 123,
    "NoiDung": "Xin chào! Đây là tin nhắn test.",
    "ThoiGian": "2025-11-04T10:30:00.000Z",
    "NguoiGuiTen": "Your Name",
    "NguoiGuiAnh": null
  }
}
```

### Test 3.4: Lấy lịch sử tin nhắn

```bash
curl -X GET "http://localhost:5000/api/chat/conversations/1/messages?limit=50&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3.5: Đánh dấu đã đọc

```bash
curl -X PUT http://localhost:5000/api/chat/conversations/1/mark-read \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** `{"success": true, "message": "Đã đánh dấu đã đọc"}`

✅ **Verify:**
```sql
SELECT TinNhanCuoiDocLuc FROM thanhviencuochoithoai 
WHERE CuocHoiThoaiID = 1 AND NguoiDungID = 123;
-- Should be updated to NOW()
```

### Test 3.6: Xóa tin nhắn

```bash
curl -X DELETE http://localhost:5000/api/chat/messages/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** `{"success": true, "message": "Đã xóa tin nhắn"}`

✅ **Verify:**
```sql
SELECT DaXoa FROM tinnhan WHERE TinNhanID = 1;
-- Should be 1 (soft delete)
```

---

## 4. Test Socket.IO Real-time

### Test 4.1: Socket Connection - Browser Console

**Mở Developer Console (F12) và paste:**

```javascript
// Import socket.io-client (nếu chưa có trong page)
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.6.0/socket.io.min.js';
document.head.appendChild(script);

// Wait 2 seconds, then connect
setTimeout(() => {
  const token = localStorage.getItem('token');
  
  const socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });

  socket.on('error', (err) => {
    console.error('❌ Socket error:', err);
  });

  // Lưu socket vào window để test
  window.testSocket = socket;
}, 2000);
```

**Expected output:**
```
✅ Connected: abc123xyz
```

### Test 4.2: Join Conversation

```javascript
// Join conversation ID 1
window.testSocket.emit('join_conversation', { cuocHoiThoaiID: 1 });

// Listen for confirmation
window.testSocket.on('joined_conversation', (data) => {
  console.log('✅ Joined conversation:', data);
});
```

### Test 4.3: Send Message

```javascript
// Send message
window.testSocket.emit('send_message', {
  cuocHoiThoaiID: 1,
  noiDung: 'Hello from Socket.IO!'
});

// Listen for new messages
window.testSocket.on('new_message', (message) => {
  console.log('📩 New message:', message);
});
```

**Expected:** Message xuất hiện ngay lập tức trong console

### Test 4.4: Typing Indicator

```javascript
// Start typing
window.testSocket.emit('typing_start', { cuocHoiThoaiID: 1 });

// Listen for typing events
window.testSocket.on('user_typing', (data) => {
  console.log('⌨️ User typing:', data);
});

// Stop typing after 2 seconds
setTimeout(() => {
  window.testSocket.emit('typing_stop', { cuocHoiThoaiID: 1 });
}, 2000);
```

### Test 4.5: Mark as Read

```javascript
window.testSocket.emit('mark_as_read', { cuocHoiThoaiID: 1 });

window.testSocket.on('message_read', (data) => {
  console.log('✅ Message read:', data);
});
```

### Test 4.6: Online/Offline Status

**Mở 2 browser tabs:**

**Tab 1:**
```javascript
// Join conversation
window.testSocket.emit('join_conversation', { cuocHoiThoaiID: 1 });

// Listen for online/offline
window.testSocket.on('user_online', (data) => {
  console.log('🟢 User online:', data.nguoiDungID);
});

window.testSocket.on('user_offline', (data) => {
  console.log('🔴 User offline:', data.nguoiDungID);
});
```

**Tab 2:**
```javascript
// Login với user khác, join cùng conversation
window.testSocket.emit('join_conversation', { cuocHoiThoaiID: 1 });
```

**Expected:** Tab 1 nhận event `user_online` với user ID của Tab 2

### Test 4.7: Disconnect & Reconnect

```javascript
// Disconnect
window.testSocket.disconnect();

// Reconnect after 3 seconds
setTimeout(() => {
  window.testSocket.connect();
}, 3000);

// Monitor connection
window.testSocket.on('disconnect', (reason) => {
  console.log('🔴 Disconnected:', reason);
});

window.testSocket.on('connect', () => {
  console.log('🟢 Reconnected:', window.testSocket.id);
});
```

---

## 5. Test Frontend UI

### Test 5.1: Trang Tin Nhắn (/chu-du-an/tin-nhan)

**Steps:**
1. ✅ Navigate to http://localhost:3000/chu-du-an/tin-nhan
2. ✅ Verify ConversationList hiển thị
3. ✅ Check unread badges (số tin chưa đọc)
4. ✅ Click vào một conversation
5. ✅ Verify redirect to `/chu-du-an/tin-nhan/{id}`

**Checklist:**
- [ ] Conversations load correctly
- [ ] Unread count hiển thị
- [ ] Avatar/placeholder hiển thị
- [ ] Time formatting đúng ("5 phút", "2 giờ", "3 ngày")
- [ ] Active conversation highlight
- [ ] Responsive trên mobile

### Test 5.2: Chat Window

**Steps:**
1. ✅ Mở conversation bất kỳ
2. ✅ Verify messages load
3. ✅ Test gửi tin nhắn:
   - Gõ vào textarea
   - Press Ctrl+Enter hoặc click Send button
4. ✅ Verify typing indicator
5. ✅ Verify auto-scroll to bottom

**Checklist:**
- [ ] Messages hiển thị đúng (own/other)
- [ ] Time formatting
- [ ] Avatar hiển thị
- [ ] Typing indicator hoạt động
- [ ] Auto-scroll when new message
- [ ] Textarea auto-resize
- [ ] Send button disabled khi empty
- [ ] Online/offline status

### Test 5.3: Message Input

**Test cases:**
1. **Empty message:** Không gửi được (button disabled)
2. **Long message:** Textarea tự động expand (max 120px)
3. **Keyboard shortcuts:**
   - Enter: Newline
   - Ctrl+Enter: Send
4. **Disabled state:** Khi socket disconnected

### Test 5.4: Real-time Updates

**Mở 2 browser windows (2 users khác nhau):**

**Window 1 (User A):**
1. Join conversation #1
2. Gửi tin nhắn: "Hello from User A"

**Window 2 (User B):**
1. Join cùng conversation #1
2. **Expected:** Nhận tin nhắn ngay lập tức (không cần refresh)
3. Gõ tin nhắn (không gửi)
4. **Expected:** Window 1 hiển thị "Đang gõ..."

**Window 1:**
5. Verify typing indicator xuất hiện
6. Gửi reply: "Hello back!"

**Window 2:**
7. **Expected:** Nhận reply ngay lập tức
8. Unread count tăng lên

---

## 6. Test Integration

### Test 6.1: Button "Nhắn tin" trong Quản Lý Cuộc Hẹn

**Steps:**
1. ✅ Navigate to `/chu-du-an/cuoc-hen`
2. ✅ Tìm cuộc hẹn bất kỳ
3. ✅ Click button "Nhắn tin" (icon chat bubble)
4. ✅ **Expected:** 
   - API call to create conversation
   - Redirect to `/chu-du-an/tin-nhan/{id}`
   - Conversation mới xuất hiện trong list
   - Chat window mở với title "Cuộc hẹn #X"

**Verify API call (Network tab):**
```
POST /api/chat/conversations
Body: {
  "NguCanhID": 1,
  "NguCanhLoai": "CuocHen",
  "ThanhVienIDs": [2],
  "TieuDe": "Cuộc hẹn #1 - ..."
}
```

### Test 6.2: Multiple Conversations

**Test scenario:**
1. Tạo conversation từ Cuộc hẹn #1 → Click "Nhắn tin"
2. Gửi 5 tin nhắn
3. Back về `/chu-du-an/tin-nhan`
4. Tạo conversation từ Cuộc hẹn #2
5. Gửi 3 tin nhắn
6. **Verify:** Cả 2 conversations xuất hiện trong list
7. Click conversation #1 → Messages load correctly
8. Click conversation #2 → Messages load correctly

---

## 7. Test Security & Performance

### Test 7.1: Authorization

**Test unauthorized access:**
```bash
# No token
curl -X GET http://localhost:5000/api/chat/conversations
# Expected: 401 Unauthorized

# Invalid token
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 or 403

# Access conversation của user khác
curl -X GET http://localhost:5000/api/chat/conversations/999/messages \
  -H "Authorization: Bearer $TOKEN"
# Expected: 403 Forbidden (nếu không phải thành viên)
```

### Test 7.2: Rate Limiting

**Gửi 15 tin nhắn trong 1 phút:**
```javascript
// Browser console
for (let i = 0; i < 15; i++) {
  window.testSocket.emit('send_message', {
    cuocHoiThoaiID: 1,
    noiDung: `Test message ${i+1}`
  });
}

// Listen for errors
window.testSocket.on('error', (err) => {
  console.error('Rate limit:', err);
});
```

**Expected:** Sau tin nhắn thứ 10, nhận error "Bạn đang gửi tin nhắn quá nhanh"

### Test 7.3: XSS Prevention

**Gửi tin nhắn có script tag:**
```bash
curl -X POST http://localhost:5000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "NoiDung": "<script>alert(\"XSS\")</script>Hello"
  }'
```

**Verify response:**
```json
{
  "NoiDung": "&lt;script&gt;alert(\"XSS\")&lt;/script&gt;Hello"
}
```

**UI Test:**
1. Gửi tin nhắn: `<img src=x onerror=alert(1)>`
2. **Expected:** Hiển thị dạng text, không execute script

### Test 7.4: Performance - 100 Messages

**Populate test data:**
```sql
-- Insert 100 test messages
DELIMITER //
CREATE PROCEDURE insert_test_messages()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 100 DO
    INSERT INTO tinnhan (CuocHoiThoaiID, NguoiGuiID, NoiDung)
    VALUES (1, 1, CONCAT('Test message number ', i));
    SET i = i + 1;
  END WHILE;
END//
DELIMITER ;

CALL insert_test_messages();
```

**Test load time:**
```javascript
console.time('Load 100 messages');

fetch('http://localhost:5000/api/chat/conversations/1/messages?limit=100', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.timeEnd('Load 100 messages');
  console.log('Messages loaded:', data.data.length);
});
```

**Expected:** Load time < 500ms

### Test 7.5: Database Indexes Performance

```sql
-- Test query performance
EXPLAIN SELECT * FROM tinnhan 
WHERE CuocHoiThoaiID = 1 
ORDER BY ThoiGian DESC 
LIMIT 50;

-- Should use index: idx_tinnhan_cuochoithoai
-- Type: ref
-- Rows: ~50 (not full table scan)
```

---

## 8. Test Checklist Summary

### ✅ UC-PROJ-04: Báo cáo Hợp Đồng
- [ ] API báo cáo hợp đồng
- [ ] Upload file scan (PDF/JPG/PNG)
- [ ] Validation file type & size
- [ ] File lưu vào thư mục đúng
- [ ] FileScanPath update DB
- [ ] UI form với file upload
- [ ] Error handling

### ✅ Chat REST API
- [ ] POST /conversations - Tạo conversation
- [ ] GET /conversations - List conversations
- [ ] GET /conversations/:id/messages - Get messages
- [ ] POST /conversations/:id/messages - Send message
- [ ] PUT /conversations/:id/mark-read - Mark read
- [ ] DELETE /messages/:id - Delete message
- [ ] Authorization check
- [ ] Error responses

### ✅ Socket.IO Real-time
- [ ] Connection/Disconnection
- [ ] JWT authentication
- [ ] join_conversation
- [ ] send_message
- [ ] typing_start/stop
- [ ] mark_as_read
- [ ] Online/offline status
- [ ] Reconnect auto
- [ ] Rate limiting
- [ ] XSS prevention

### ✅ Frontend UI
- [ ] ConversationList load
- [ ] Unread badges
- [ ] MessageList display
- [ ] MessageInput send
- [ ] Typing indicator
- [ ] Auto-scroll
- [ ] Responsive design
- [ ] Error states
- [ ] Loading states

### ✅ Integration
- [ ] Button "Nhắn tin" trong QuanLyCuocHen
- [ ] Create conversation flow
- [ ] Navigation flow
- [ ] Real-time updates giữa users

### ✅ Security & Performance
- [ ] JWT authentication
- [ ] Authorization checks
- [ ] Rate limiting (10 msg/min)
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] Database indexes
- [ ] Load time < 500ms

---

## 9. Troubleshooting Common Issues

### Issue 1: Socket.IO không connect

**Check:**
1. Backend server running? → `curl http://localhost:5000`
2. Token valid? → Decode JWT tại jwt.io
3. CORS settings → Check `server/index.js` origin config

**Fix:**
```javascript
// server/index.js
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Match exactly
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### Issue 2: Rate limit trigger quá sớm

**Fix:** Tăng limit trong `server/socket/chatHandlers.js`:
```javascript
const MAX_MESSAGES_PER_MINUTE = 20; // Increase from 10
```

### Issue 3: Messages không real-time

**Check:**
1. Socket connected? → Check browser console
2. User đã join conversation? → Emit `join_conversation`
3. Room name đúng? → `conversation_${id}`

### Issue 4: Upload file fail

**Check:**
1. Thư mục tồn tại? → `ls -la public/uploads/temp`
2. Permissions? → `chmod 755 public/uploads/*`
3. File size? → Max 10MB
4. File type? → PDF/JPG/PNG only

---

## 10. Performance Benchmarks

### Expected Performance

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| API Response Time | < 100ms | < 300ms | > 500ms |
| Socket Latency | < 50ms | < 150ms | > 300ms |
| Page Load (50 msgs) | < 500ms | < 1s | > 2s |
| Upload (5MB file) | < 2s | < 5s | > 10s |
| DB Query (100 msgs) | < 50ms | < 200ms | > 500ms |

### Monitoring Tools

**Backend:**
```javascript
// Add to server/index.js
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

**Frontend:**
```javascript
// Browser console
performance.mark('start-load');
// ... load messages
performance.mark('end-load');
performance.measure('load-time', 'start-load', 'end-load');
console.log(performance.getEntriesByName('load-time')[0].duration);
```

---

## 🎯 Kết Luận

Sau khi test hết checklist trên, bạn sẽ verify được:
- ✅ Upload file scan hợp đồng hoạt động
- ✅ Chat REST API hoạt động
- ✅ Socket.IO real-time messaging hoạt động
- ✅ UI responsive và user-friendly
- ✅ Security measures hoạt động
- ✅ Performance đạt yêu cầu

**Happy Testing! 🚀**



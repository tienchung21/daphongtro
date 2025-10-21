# Kế hoạch Chuẩn hóa Cấu trúc File - 21/10/2025

## 🎯 Mục tiêu
Chuẩn hóa cấu trúc thư mục sau khi merge upstream, loại bỏ file tạm thời và sắp xếp file vào đúng vị trí.

---

## 📋 Danh sách File cần xử lý

### 1. Files tạm thời trong ROOT (XÓA)
```
✅ CLEANUP_FINAL_SUMMARY.md           → Xóa (đã merge xong)
✅ CLEANUP_PHASE1_COMPLETE.md         → Xóa
✅ CLEANUP_PHASE2_COMPLETE.md         → Xóa
✅ COMPREHENSIVE_CLEANUP_PLAN.md      → Xóa
✅ MERGE_PLAN.md                      → Move to docs/archive/
✅ MERGE_RESULT.md                    → Move to docs/archive/
✅ MERGE_UPSTREAM_STRATEGY.md         → Move to docs/archive/
✅ PUSH_ANALYSIS.md                   → Move to docs/archive/
✅ transactions_table.sql             → Xóa (đã tạo migration)
```

### 2. Assets không dùng (XÓA)
```
✅ Logo_JL.png                        → Xóa (609 KB, không dùng)
```

### 3. Database files cần kiểm tra
```
⚠️ khuvuc (1).sql                     → Kiểm tra nội dung, quyết định:
                                          - Nếu là migration: Move to migrations/
                                          - Nếu là backup: Move to docs/archive/
                                          - Nếu trùng: Xóa
✅ đặc tả use case v1.docx             → Move to docs/archive/
```

### 4. Test scripts trong server/ (MOVE)
```
✅ server/check-db-structure.js       → Move to server/tests/
✅ server/check-migration.js          → Move to server/tests/
✅ server/test-api-endpoints.js       → Move to server/tests/
✅ server/test-phong-duan-endpoint.js → Move to server/tests/
```

### 5. Folders rỗng không dùng (XÓA)
```
✅ server/uploads/                    → Xóa (rỗng, đang dùng public/uploads/)
```

---

## 🔄 Thực hiện Chuẩn hóa

### Phase 1: Tạo thư mục cần thiết
```bash
mkdir -p docs/archive
mkdir -p server/tests
```

### Phase 2: Di chuyển documents
```bash
mv MERGE_PLAN.md docs/archive/
mv MERGE_RESULT.md docs/archive/
mv MERGE_UPSTREAM_STRATEGY.md docs/archive/
mv PUSH_ANALYSIS.md docs/archive/
mv "đặc tả use case v1.docx" docs/archive/
```

### Phase 3: Di chuyển test scripts
```bash
mv server/check-*.js server/tests/
mv server/test-*.js server/tests/
```

### Phase 4: Xóa file tạm thời
```bash
rm CLEANUP_FINAL_SUMMARY.md
rm CLEANUP_PHASE1_COMPLETE.md
rm CLEANUP_PHASE2_COMPLETE.md
rm COMPREHENSIVE_CLEANUP_PLAN.md
rm transactions_table.sql
rm Logo_JL.png
```

### Phase 5: Xóa folder rỗng
```bash
rm -r server/uploads/
```

### Phase 6: Kiểm tra khuvuc (1).sql
```bash
# Cần review nội dung trước khi quyết định
```

---

## ✅ Cấu trúc Mong đợi sau Cleanup

```
daphongtro/
├── package.json
├── package-lock.json
├── README.md
├── thue_tro.sql                      # Database chính
├── .gitignore
├── docs/
│   ├── archive/                      # ✨ NEW: Lưu trữ docs cũ
│   │   ├── MERGE_PLAN.md
│   │   ├── MERGE_RESULT.md
│   │   ├── MERGE_UPSTREAM_STRATEGY.md
│   │   ├── PUSH_ANALYSIS.md
│   │   └── đặc tả use case v1.docx
│   ├── use-cases-v1.2.md             # Active docs
│   ├── chu-du-an-routes-implementation.md
│   └── ...
├── migrations/
│   └── 2025_10_21_add_transactions_from_upstream.sql
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── ...
└── server/
    ├── api/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── services/
    ├── middleware/
    ├── tests/                        # ✨ NEW: Test scripts
    │   ├── check-db-structure.js
    │   ├── check-migration.js
    │   ├── test-api-endpoints.js
    │   └── test-phong-duan-endpoint.js
    ├── public/
    │   └── uploads/                  # Active uploads (83.5 MB)
    └── index.js
```

---

## 📊 Thống kê

**Files sẽ xóa:** 6 files (CLEANUP_*.md, transactions_table.sql, Logo_JL.png)
**Files sẽ move:** 9 files (4 docs to archive, 4 tests to server/tests/, 1 docx)
**Folders sẽ xóa:** 1 folder (server/uploads/)
**Files cần review:** 1 file (khuvuc (1).sql - 129KB)

**Tổng dung lượng giải phóng:** ~850 KB

---

## ⚠️ Lưu ý

1. **Backup:** Đã có backup branch `Hop-backup-before-upstream-merge`
2. **Git history:** Tất cả file đều có trong git history, có thể khôi phục
3. **khuvuc (1).sql:** Cần xem nội dung trước khi quyết định (129 KB - file lớn)
4. **server/tests/:** Tạo README.md trong folder này để giải thích mục đích

---

## 🚀 Next Steps

1. Kiểm tra nội dung `khuvuc (1).sql`
2. Thực hiện di chuyển/xóa files
3. Commit với message: "chore: chuẩn hóa cấu trúc thư mục sau merge upstream"
4. Verify ứng dụng vẫn chạy OK (npm run dev)

---
applyTo:
  - "**/docker-compose.yml"
  - "db/migrations/**/*.js"
  - "infra/**/*.sh"
  - "infra/nginx/nginx.conf"
  - "thue_tro.sql"
---

# HƯỚNG DẪN COPILOT CHO HẠ TẦNG (DB + DOCKER + MIGRATIONS) - v2

## 1. Database

| Quy tắc | Ghi chú |
|---------|---------|
| **Nguồn gốc schema** | **`thue_tro.sql`** – **chỉ đọc, không sửa**. Mọi thay đổi phải thông qua migrations. |
| **Migrations** | Dùng **Sequelize CLI** hoặc **Prisma Migrate**. Một thay đổi = 1 file chứa `up` / `down`. |
| **Idempotency Key** | Tạo bảng `idempotency_keys` (PK `key`, `user_id`, `path`, `body_hash`, `created_at` TIMESTAMP, INDEX TTL). |
| **Sổ Cái Bất biến** | Bảng `ButToanSoCai` phải là **append-only**. Cân nhắc dùng DB trigger để `REJECT` các thao tác `UPDATE` và `DELETE` nhằm đảm bảo tính toàn vẹn. |
| **Index** | Thêm composite index `tindang(TrangThai, KhuVucID)` cho tìm kiếm và `coc(TrangThai, HetHanLuc)` cho worker. Index các cột khóa ngoại thường dùng trong JOIN. |

---

## 2. Docker Compose (Môi trường Phát triển)

Kiến trúc được mở rộng để bao gồm Reverse Proxy, Hàng đợi, và Lưu trữ File, tiệm cận hơn với môi trường Production.

```yaml
version: "3.9"

services:
  # --- CỔNG VÀO HỆ THỐNG ---
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80" # Cổng chính để truy cập: http://localhost:8080
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on: [backend, frontend]

  # --- CÁC TÀI NGUYÊN CHÍNH ---
  db:
    image: mariadb:11
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: thue_tro
    volumes:
      - db-data:/var/lib/mysql
    ports:
      - "3307:3306" # Mở cho developer kết nối trực tiếp vào DB

  redis:
    image: redis:alpine

  minio:
    image: minio/minio
    ports:
      - "9001:9001" # Giao diện web MinIO
      - "9000:9000" # API Endpoint
    volumes:
      - minio-data:/data
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"

  # --- CÁC ỨNG DỤNG ---
  backend:
    build: ./server
    environment:
      # Dev dùng mysql2: đọc cấu hình từ biến môi trường MYSQL_*
      - MYSQL_HOST=db
      - MYSQL_PORT=3306
      - MYSQL_USER=root
      - MYSQL_PASSWORD=root
      - MYSQL_DATABASE=thue_tro
      - REDIS_URL=redis://redis:6379
      - S3_ENDPOINT=http://minio:9000
      - S3_ACCESS_KEY=minioadmin
      - S3_SECRET_KEY=minioadmin
      - S3_BUCKET=thuetro
    depends_on: [db, redis, minio]
    volumes: ["./server:/app"]
    command: npm run dev

  frontend:
    build: ./client
    depends_on: [backend]
    volumes: ["./client:/app"]
    command: npm run dev -- --host

  # --- CÁC WORKER BẤT ĐỒNG BỘ ---
  cron_release_deposit:
    build: ./server
    command: ["sh","-c","while true; do node jobs/releaseExpiredDeposits.js; sleep 300; done"]
    depends_on: [db]
    restart: on-failure
    environment:
      - MYSQL_HOST=db
      - MYSQL_PORT=3306
      - MYSQL_USER=root
      - MYSQL_PASSWORD=root
      - MYSQL_DATABASE=thue_tro

  notification_worker:
    build: ./server
    command: node workers/notificationProcessor.js # Script lắng nghe hàng đợi Redis
    depends_on: [db, redis]
    restart: on-failure
    environment:
      - MYSQL_HOST=db
      - MYSQL_PORT=3306
      - MYSQL_USER=root
      - MYSQL_PASSWORD=root
      - MYSQL_DATABASE=thue_tro
      - REDIS_URL=redis://redis:6379

  # --- CÔNG CỤ PHỤ TRỢ ---
  phpmyadmin:
    image: phpmyadmin
    environment:
      PMA_HOST: db
      UPLOAD_LIMIT: 64M
    ports:
      - "9090:80"

volumes:
  db-data:
  minio-data:

````

-----

## 3\. Cấu hình Nginx (ví dụ)

Tạo file `infra/nginx/nginx.conf`. Nginx đóng vai trò là reverse proxy, quản lý rate limit và điều hướng request đến đúng service.

```nginx
# infra/nginx/nginx.conf

# Giới hạn 10 request/giây cho mỗi IP, burst 20
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;

    # Điều hướng request API (/api/...) đến backend
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend:5000/; # Dev: backend chạy cổng 5000 (server/index.js)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Điều hướng tất cả request còn lại đến frontend
    location / {
        proxy_pass http://frontend:5173/; # Giả sử frontend dev server chạy ở port 5173
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

-----

## 4\. CI / CD Checklist (GitHub Actions)

| Tên Job | Mô tả |
|---|---|
| `migration-test` | Chạy `npm run migrate:deploy` và `npm run migrate:rollback` trên DB test. |
| `lint` | Chạy ESLint cho backend và stylelint cho frontend. |
| `test` | Chạy Jest (backend) & Vitest (frontend). Yêu cầu coverage \> 80%. |
| `docker-build` | Build image multi-stage, tận dụng cache layers. |
| `security` | Chạy `npm audit --production` & `trivy fs --exit-code 1 ./server`. |

-----

## 5\. Workers & Jobs

| Script | Lịch chạy / Trigger | Trách nhiệm |
|---|---|---|
| `jobs/releaseExpiredDeposits.js` | Cron (5 phút) | – Truy vấn `Coc` có trạng thái `GiuCho` đã quá `HetHanLuc`.<br>– Tạo bút toán hoàn tiền vào ví.<br>– Cập nhật trạng thái `Coc` và `Phong`.<br>– **Đẩy** một job thông báo vào hàng đợi Redis. |
| `workers/notificationProcessor.js`| Luôn chạy, lắng nghe Redis | – **Nhận** job thông báo từ hàng đợi.<br>– Gửi email/push notification qua dịch vụ bên thứ ba.<br>– Ghi log kết quả, thực hiện retry nếu thất bại. |

**Ghi chú:** Các worker phải được thiết kế `stateless` và nhận thông tin kết nối qua biến môi trường. Tách biệt worker giúp hệ thống chịu lỗi tốt hơn.

```
```

# ticket-system-uni-fe

Frontend cho **Hệ thống đăng ký sự kiện trường** (CO3011 — Nhóm 09).
Vite + React + TailwindCSS v4 + TanStack Query + Axios.

> Contract chuẩn nằm trong `api/openapi.yaml` của repo `ticket-system-uni-be`.

## Chạy dự án

```bash
npm ci
cp .env.example .env
npm run dev
```

Chạy PostgreSQL, migration và API theo README của repo `ticket-system-uni-be`.
Với backend `AUTH_MODE=local`, chạy `make dev-token ROLE=student` (hoặc `organizer`, `admin`)
trong repo backend, rồi dán access token vào tab **Dán token trực tiếp**. Refresh token để trống.
Kiểm tra `http://localhost:3000/health/ready`, rồi mở `http://localhost:5173`.

Khi dùng Google thật, đặt backend `AUTH_MODE=google`, dùng cùng Google OAuth Client ID trong
`GOOGLE_CLIENT_ID` của backend và `VITE_GOOGLE_CLIENT_ID` của frontend. Thêm
`http://localhost:5173` vào Authorized JavaScript origins của OAuth client.

Vite chuyển tiếp `/api/v1` đến API ở cổng 3000. Khi dùng `npm run build` để triển khai,
cấu hình web server chuyển tiếp `/api/v1` đến backend và phục vụ `index.html` cho các route React.

Để chạy cả hệ thống bằng Docker và mở cho điện thoại cùng mạng, dùng
`docker compose -f compose.yaml -f compose.host.yaml up -d --build --wait` từ repo backend
đặt cạnh repo này. Frontend dùng Nginx ở cổng mặc định `5174`; hướng dẫn HTTPS cho camera
nằm trong README backend.

### Biến môi trường (`.env`)

| Biến                    | Ý nghĩa                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| `API_PROXY_TARGET`     | Origin backend cho Vite (mặc định `http://127.0.0.1:3000`).       |
| `VITE_API_BASE_URL`     | Base URL API phía trình duyệt (mặc định `/api/v1`).               |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID cho nút đăng nhập Google. Trống = ẩn nút.   |
| `VITE_ENABLE_DEV_LOGIN` | `true` để hiện panel đăng nhập dev (dán token) khi test với local. |

## Đăng nhập (A26)

API dùng access token nội bộ cho các request đã đăng nhập.
Với `AUTH_MODE=google`, `POST /auth/google` đổi Google ID token của trường lấy phiên nội bộ.
Màn đăng nhập hỗ trợ:

1. **Nút Google thật** (Google Identity Services) — khi đã cấu hình `VITE_GOOGLE_CLIENT_ID`.
2. **Panel dev** (bật bằng `VITE_ENABLE_DEV_LOGIN=true`):
   - Dán **Google ID token** → gửi lên `/auth/google` như nút thật, hoặc
   - Dán **access token** từ lệnh `make dev-token` của backend local. Refresh token tùy chọn.

## Kiến trúc

```
src/
├─ config/env.js          # đọc biến môi trường một chỗ
├─ lib/
│  ├─ http.js             # axios instance: gắn JWT, tự refresh token, chuẩn hoá lỗi (A28)
│  ├─ apiError.js         # ApiError { code, status, details } — chuẩn hoá mọi lỗi
│  ├─ queryClient.js      # TanStack Query + xử lý lỗi tập trung (toast)
│  ├─ toast.js            # toast store (pub/sub), toast.apiError map theo error.code
│  ├─ queryKeys.js        # khóa query tập trung
│  └─ fieldErrors.js      # map details.fields của VALIDATION_ERROR -> {field: message}
├─ constants/
│  ├─ errorMessages.js    # error.code -> message tiếng Việt (KHÔNG render error.message)
│  └─ roles.js            # ROLES, EVENT_STATUS, REGISTRATION_STATUS + nhãn
├─ features/              # mỗi domain gom service + custom hooks (không gọi axios trong UI)
│  ├─ auth/               # auth.api, AuthContext/useAuth, useGoogleSignIn
│  ├─ events/             # events.api, useEvents, useApprovals, EventCard, ApprovalLogs
│  ├─ registrations/      # registrations.api, useRegistrations
│  └─ units/              # units.api, useUnits
├─ components/
│  ├─ ui/                 # Button, Spinner, Skeleton, Badge, Modal, Field, Toaster, states…
│  └─ layout/AppLayout.jsx
├─ routes/                # ProtectedRoute, RoleRoute
└─ pages/                 # LoginPage, events/, me/, manage/, admin/
```

### Nguyên tắc (theo yêu cầu đồ án)

- **Không gọi axios trực tiếp trong component.** Logic API nằm ở `features/*/.api.js`, UI dùng qua custom hooks (`useEvents`, `useAuth`…).
- **Lỗi map theo `error.code`**, không render thẳng `error.message` từ backend (xem `constants/errorMessages.js`).
- **Phân quyền** lấy từ mảng `user.roles` của `GET /me` (`STUDENT`, `ORGANIZER`, `ADMIN`).
- **UX:** skeleton khi tải (`components/ui/Skeleton.jsx`), nút tự disable + spinner khi submit (`Button loading`).

## Tiến độ W11

| Task | Nội dung                                         | Trạng thái |
| ---- | ------------------------------------------------ | ---------- |
| A28  | Base layout, axios + refresh token, error handler | ✅         |
| A26  | Đăng nhập (Google + dev) & `GET /me`              | ✅         |
| A27  | Danh sách/chi tiết sự kiện                        | ✅         |
| A27  | Organizer tạo/sửa/gửi duyệt; Admin duyệt/từ chối  | ✅         |
| A29  | Sinh viên đăng ký/hủy, "Đăng ký của tôi"          | ✅         |
| A35  | Vé QR, check-in (C1–C3), báo cáo và tải CSV         | ✅         |

API hiện hỗ trợ xuất CSV. Chức năng xóa nháp cần endpoint ở backend.

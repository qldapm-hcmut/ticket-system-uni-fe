# ticket-system-uni-fe

Frontend cho **Hệ thống đăng ký sự kiện trường** (CO3011 — Nhóm 09).
Vite + React + TailwindCSS v4 + TanStack Query + Axios.

> **Nguồn sự thật (SSOT):** [`docs/openapi.yaml`](docs/openapi.yaml). Mọi thay đổi API bám theo file này.
> Backend chạy local từ repo `ticket-system-uni.git` (mặc định `http://localhost:3000/api/v1`).

## Chạy dự án

```bash
npm install
cp .env.example .env   # sửa lại nếu cần
npm run dev            # http://localhost:5173
npm run build          # build production
npm run preview        # xem thử bản build
```

### Biến môi trường (`.env`)

| Biến                    | Ý nghĩa                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| `VITE_API_BASE_URL`     | Base URL backend (mặc định `http://localhost:3000/api/v1`).        |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID cho nút đăng nhập Google. Trống = ẩn nút.   |
| `VITE_ENABLE_DEV_LOGIN` | `true` để hiện panel đăng nhập dev (dán token) khi test với local. |

## Đăng nhập (A26)

Backend chỉ nhận **Google ID token** qua `POST /auth/google` (yêu cầu domain `hcmut.edu.vn`).
Màn đăng nhập hỗ trợ:

1. **Nút Google thật** (Google Identity Services) — khi đã cấu hình `VITE_GOOGLE_CLIENT_ID`.
2. **Panel dev** (bật bằng `VITE_ENABLE_DEV_LOGIN=true`):
   - Dán **Google ID token** → gửi lên `/auth/google` như nút thật, hoặc
   - Dán thẳng **access/refresh token** (tiện khi backend local seed sẵn token).

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
| —    | QR code trong vé (R4)                             | ⏳ box trống, nối thư viện QR sau |
| —    | Check-in (C1–C3), báo cáo (B1–B2), thông báo (N1–N2) | ⏳ ngoài phạm vi W11 |
```

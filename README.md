# TaskFlow - Personal Task Management App

## Overview
TaskFlow là ứng dụng quản lý công việc cá nhân được xây dựng cho bài test Intern Developer. Thay vì dừng ở một Todo List CRUD cơ bản, dự án tập trung vào trải nghiệm sử dụng thực tế: nhập liệu nhanh, theo dõi trạng thái rõ ràng, ưu tiên công việc, deadline, tìm kiếm, lọc, sắp xếp và phân trang khi dữ liệu tăng lên.

**Product blurb**

> TaskFlow is a personal task management application built for the Intern Developer test. Instead of only implementing basic CRUD operations, the project focuses on product thinking, clean architecture, smooth user experience, and practical task organization. Users can create, edit, delete, search, filter, sort, and track tasks by status, priority, and due date. The application includes validation, pagination, responsive UI, clear API structure, and a professional README for easy review.

## Product Thinking
- Không làm một danh sách việc cần làm đơn thuần; TaskFlow được tổ chức như một mini-product có dashboard thống kê, progress bar, khu vực quick filters, task cards rõ thông tin và các trạng thái UX đầy đủ.
- Priority và due date giúp người dùng không chỉ lưu việc cần làm mà còn biết việc nào cần xử lý trước.
- Search, filter, quick filter, sort và pagination được xử lý để giao diện vẫn mượt khi danh sách lớn hơn.
- Toast, confirm dialog, loading skeleton, disable submit button và contextual empty state giúp trải nghiệm có phản hồi rõ ràng và an toàn hơn.
- Backend và frontend được tách lớp rõ ràng để thể hiện tư duy maintainable code thay vì nhồi logic vào controller hoặc một component lớn.

## Features

### Core task management
- Hiển thị danh sách công việc.
- Thêm công việc mới.
- Chỉnh sửa công việc.
- Xóa công việc.
- Đánh dấu hoàn thành/chưa hoàn thành.
- Tìm kiếm theo từ khóa.
- Lọc theo trạng thái `All / Pending / Completed`.

### Product enhancements
- Priority `Low / Medium / High`.
- Due date.
- Dashboard stats `Total / Pending / Completed / High Priority / Overdue / Due Today`.
- Progress bar completion `X of Y tasks completed`.
- Quick filters `All / Today / Overdue / High Priority / Completed`.
- Due date indicator badges `Completed / Overdue / Due Today / Upcoming`.
- Sort theo `Newest / Oldest / Due Date / Priority`.
- Pagination.
- Glassmorphism UI với progress panel, responsive cards, modal và dialog đồng bộ.
- Empty state khi chưa có task.
- Contextual empty states cho `Today`, `Overdue`, `Completed` và search/filter.
- Toast notification cho create/update/delete/toggle.
- Confirm dialog trước khi xóa.
- Loading skeleton.
- Disable submit button khi đang gửi request.
- Responsive UI cho desktop và mobile.
- Seed data mẫu khi backend chạy lần đầu.

## Tech Stack

### Backend
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core
- SQLite
- Swagger / OpenAPI
- Service Layer pattern
- DTOs
- Global exception middleware
- xUnit + SQLite in-memory tests

### Frontend
- React
- Vite
- TypeScript
- Plain CSS
- Custom hooks

### Tooling
- Docker + Docker Compose
- npm
- dotnet CLI

## Project Structure
```text
taskflow-todo-app/
├── backend/
│   ├── Common/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Mappings/
│   ├── Middleware/
│   ├── Models/
│   ├── Services/
│   ├── Dockerfile
│   ├── Program.cs
│   └── TaskFlow.Api.csproj
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── tests/
│   └── TaskFlow.Api.Tests/
├── docker-compose.yml
├── TaskFlow.sln
└── README.md
```

## Backend API

### Base URL
- Local: `http://localhost:5000/api`
- Docker: `http://localhost:${BACKEND_PORT}/api` with default `http://localhost:5000/api`

### Endpoints
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/toggle`
- `DELETE /api/tasks/{id}`

### Query params for `GET /api/tasks`
- `search`
- `status`
- `priority`
- `due` with `today | overdue | upcoming`
- `sortBy`
- `page`
- `pageSize`

### Example
```http
GET /api/tasks?search=report&priority=High&due=overdue&sortBy=dueDate&page=1&pageSize=10
```

### Response format
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 10,
    "totalItems": 25,
    "totalPages": 3,
    "summary": {
      "totalTasks": 25,
      "pendingTasks": 14,
      "completedTasks": 11,
      "highPriorityTasks": 6,
      "overdueTasks": 3,
      "dueTodayTasks": 4
    }
  }
}
```

## How to Run Locally

### 1. Clone project
```bash
git clone <your-repository-url>
cd taskflow-todo-app
```

### 2. Run backend
Yêu cầu: cài .NET 8 SDK.

```bash
cd backend
dotnet restore
dotnet run
```

Backend sẽ chạy tại:
- `http://localhost:5000`
- Swagger: `http://localhost:5000/swagger`

### 3. Run frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend sẽ chạy tại:
- `http://localhost:5173`

### 4. Run backend tests
```bash
cd ..
dotnet test tests/TaskFlow.Api.Tests/TaskFlow.Api.Tests.csproj
```

## Run with Docker
Yêu cầu: Docker daemon đang chạy.

Nếu host port `5000` đang bị chiếm, tạo file `.env` từ `.env.example` và đổi `BACKEND_PORT` sang port khác, ví dụ `5001`.

```bash
cp .env.example .env
# optional: change BACKEND_PORT=5001 if port 5000 is busy
docker compose up --build
```

Sau khi build xong:
- Frontend: `http://localhost:${FRONTEND_PORT}` mặc định `http://localhost:4173`
- Backend API: `http://localhost:${BACKEND_PORT}` mặc định `http://localhost:5000`
- Swagger: `http://localhost:${BACKEND_PORT}/swagger`

Ví dụ nếu máy đang dùng port `5000`:

```bash
BACKEND_PORT=5001 docker compose up --build
```

## Environment Variables

### Docker Compose
Tạo file `.env` tại thư mục gốc `taskflow-todo-app/` từ `.env.example`:

```env
BACKEND_PORT=5000
FRONTEND_PORT=4173
```

### Frontend
Tạo file `.env` trong `frontend/` từ `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Validation & Error Handling
- `Title` bắt buộc, trim trước khi xử lý, độ dài từ 3 đến 100 ký tự.
- `Description` tối đa 500 ký tự.
- `Priority` chỉ chấp nhận `Low`, `Medium`, `High`.
- `Status` chỉ chấp nhận `Pending`, `Completed`.
- `Due` query filter chỉ chấp nhận `today`, `overdue`, `upcoming`.
- `DueDate` là optional nhưng nếu có sẽ được normalize theo date-only.
- Tất cả lỗi validation trả về format `ApiResponse` thống nhất.
- Global exception middleware xử lý lỗi ngoài dự kiến và trả JSON rõ ràng.
- API trả `404` khi update/toggle/delete task không tồn tại.

## Performance Optimizations
- Debounce search 300ms bằng custom hook `useDebounce`.
- Pagination để giảm số lượng card render cùng lúc.
- Server-side filtering, due filtering, sorting và pagination bằng `IQueryable`.
- `AsNoTracking` cho read queries.
- DTO response để tránh expose Entity trực tiếp.
- Component splitting để giảm file dài và dễ maintain.
- Optimistic update cho toggle status, có rollback nếu API lỗi.

## Screenshots
Bạn có thể thêm ảnh ở đây sau khi chụp giao diện:

- Home page
- Add task modal
- Edit task flow
- Empty state
- Mobile responsive layout

## Future Improvements
- User authentication with JWT
- Multi-user task management
- Personal workspace
- Task sharing and collaboration

## Verification Notes
Recommended verification commands:
- `dotnet build backend/TaskFlow.Api.csproj`
- `dotnet test tests/TaskFlow.Api.Tests/TaskFlow.Api.Tests.csproj`
- `npm run build` trong `frontend/`

Docker files và compose đã được chuẩn bị. Nếu máy local chưa bật Docker daemon, hãy bật Docker Desktop trước khi chạy `docker compose up --build`.

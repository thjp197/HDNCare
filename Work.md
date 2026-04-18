# HDNCare - Work Guide

Tai lieu nay dung de onboarding nhanh khi pull/push code trong team.

## 1. Chay toan bo he thong (dev)

### Yeu cau moi truong
- Node.js 18+ (khuyen nghi Node.js 20 LTS)
- npm 9+
- Da co file `.env` cho:
  - Thu muc goc (frontend client)
  - `admin/`
  - `backend/`

### Cai dependency
Chay trong terminal theo thu tu sau:

```bash
# 1) Tai thu muc goc
cd D:/IT/HDNCare
npm install

# 2) Cho admin
npm --prefix admin install

# 3) Cho backend
npm --prefix backend install
```

### Chay tat ca service bang 1 lenh
Chay tai thu muc goc `/HDNCare/`:

```bash
npm run dev
```

He thong se khoi dong:
- Client (Vite): http://localhost:5173
- Admin/Stylist (Vite): http://localhost:5174
- Backend (Express): http://localhost:4000
- AR Filter: duoc serve qua Client tai duong dan:
  - http://localhost:5173/filter/index.html

### Build production
Chay tai thu muc goc:

```bash
npm run build
```

Output:
- Client build: `dist/web`
- Admin build: `dist/admin`

---

## 2. Them Gemini API key vao dau

Them key trong file:
- `backend/.env`

Dung bien:

```env
GEMINI_API_KEY=your_real_gemini_key_here
```

Hoac co the dung fallback:

```env
GEMINI_KEY=your_real_gemini_key_here
```

Luu y:
- Khong de API key trong frontend (`.env` o root/admin).
- Frontend goi backend proxy, backend moi la noi goi Gemini.
- Endpoint proxy dang dung:
  - `POST /api/gemini/chat`

---

## 3. Mo ta kien truc he thong

HDNCare duoc chia thanh 3 khoi chinh:

### A. Client app (Nguoi dung)
- Cong nghe: React + Vite
- Thu muc: `src/` (tai root project)
- Chuc nang:
  - Trang nguoi dung, dat lich, profile, lich hen
  - Chatbot UI (goi backend API)
  - Nhung AR Makeup qua iframe ` /filter/index.html `

### B. Admin/Stylist app
- Cong nghe: React + Vite
- Thu muc: `admin/src/`
- Chuc nang:
  - Quan tri stylist, lich hen, dashboard
  - Khu vuc stylist quan ly lich va profile

### C. Backend API
- Cong nghe: Node.js + Express + MongoDB (Mongoose)
- Thu muc: `backend/`
- Chuc nang:
  - Xac thuc user/admin/stylist
  - CRUD stylist, appointment, profile
  - Tich hop cloud media (Cloudinary)
  - Chatbot + Gemini proxy (`/api/gemini/chat`)

### Luong giao tiep tong quan
1. Client/Admin goi API toi Backend (`http://localhost:4000`).
2. Backend xu ly business logic + DB MongoDB.
3. Neu can AI, Backend goi Gemini bang key trong `backend/.env`.
4. AR Filter la static app, duoc serve boi Client tai `public/filter`.

---

## 4. Cau truc thu muc (tong quan)

```text
HDNCare/
|-- src/                       # Frontend Client (React)
|   |-- pages/
|   |-- components/
|   |-- context/
|   `-- assets/
|
|-- public/
|   `-- filter/                # AR Makeup static app (duoc serve tai /filter/index.html)
|
|-- admin/                     # Frontend Admin/Stylist (React)
|   `-- src/
|       |-- pages/
|       |-- components/
|       `-- context/
|
|-- backend/                   # Node.js/Express API
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   `-- routes/
|
|-- dist/
|   |-- web/                   # Build output client
|   `-- admin/                 # Build output admin
|
|-- ecosystem.config.js        # PM2 config (production)
|-- package.json               # Scripts chay tap trung
|-- .env.example               # Mau env cho client
`-- Work.md                    # Tai lieu huong dan lam viec
```

---

## 5. Luu y team workflow

- Luon cap nhat file env local theo `.env.example`, tuyet doi khong commit key that.
- Truoc khi push:

```bash
npm run build
```

- Neu co thay doi API backend, cap nhat dong thoi:
  - route/controller backend
  - context/service frontend
  - tai lieu nay (`Work.md`) neu thay doi anh huong workflow

# FormBuilder

A no-code form builder platform built with Next.js, similar to Typeform/JotForm.

## 🏗️ Architecture

This is a **Next.js Full-Stack Application** with:
- **Frontend:** React 19 + Next.js 16 + TypeScript
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** JWT-based authentication with cookies
- **Deployment:** Vercel

## 📁 Project Structure

```
/formbuilder
└── frontend/                    # Main Next.js application
    ├── prisma/
    │   ├── schema.prisma       # Database schema
    │   └── migrations/         # Database migrations
    ├── src/
    │   ├── app/
    │   │   ├── api/            # API Routes (backend)
    │   │   │   ├── auth/       # Authentication endpoints
    │   │   │   ├── forms/      # Form management endpoints
    │   │   │   └── public/     # Public endpoints (form submission)
    │   │   ├── (pages)/        # Frontend pages
    │   │   │   ├── login/
    │   │   │   ├── signup/
    │   │   │   ├── dashboard/
    │   │   │   ├── builder/
    │   │   │   ├── forms/
    │   │   │   └── responses/
    │   │   └── layout.tsx      # Root layout
    │   ├── components/         # React components
    │   ├── lib/                # Utilities & configs
    │   └── types/              # TypeScript types
    ├── public/                 # Static assets
    ├── .env.local              # Environment variables
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:
```env
DATABASE_URL="postgresql://..."
JWT_ACCESS_TOKEN_SECRET="your-secret"
JWT_REFRESH_TOKEN_SECRET="your-refresh-secret"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-key"
```

4. Run database migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Models

- **User** - User accounts with authentication
- **Form** - Form definitions
- **FormField** - Individual form fields (text, email, select, etc.)
- **FormResponse** - User submissions
- **PasswordResetToken** - Password recovery tokens

### Migrations

Run migrations:
```bash
cd frontend
npx prisma migrate dev
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Forms (Protected)
- `GET /api/forms` - List user's forms
- `POST /api/forms` - Create form
- `GET /api/forms/[id]` - Get form details
- `PUT /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form
- `POST /api/forms/[id]/fields` - Add field to form
- `PUT /api/forms/[id]/fields/[fieldId]` - Update field
- `DELETE /api/forms/[id]/fields/[fieldId]` - Delete field
- `GET /api/forms/[id]/responses` - Get form responses
- `DELETE /api/forms/[id]/responses/[responseId]` - Delete response

### Public Endpoints
- `GET /api/public/forms/[id]` - Get public form (for filling)
- `POST /api/public/forms/[id]/responses` - Submit form response

## 🎨 Features

- ✅ User authentication (signup, login, logout)
- ✅ Password recovery
- ✅ Form builder with drag & drop
- ✅ Multiple field types (text, email, number, select, radio, checkbox)
- ✅ Public form sharing
- ✅ Response collection
- ✅ Response analytics
- ✅ Export responses to CSV
- ✅ Form deletion (soft delete)
- ✅ Mobile responsive design

## 🚢 Deployment

### Vercel (Recommended)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Deploy to production:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Environment Variables for Production

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (use pooler for serverless)
- `JWT_ACCESS_TOKEN_SECRET` - JWT secret for access tokens
- `JWT_REFRESH_TOKEN_SECRET` - JWT secret for refresh tokens
- `SUPABASE_URL` - Supabase project URL (optional, for file uploads)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (optional)

## 📝 Development

### Code Structure

- **API Routes:** `/frontend/src/app/api/` - Serverless functions
- **Pages:** `/frontend/src/app/` - Next.js App Router pages
- **Components:** `/frontend/src/components/` - Reusable React components
- **Database:** `/frontend/prisma/schema.prisma` - Prisma schema

### Running Tests

```bash
cd frontend
npm run lint
npm run build  # Type checking
```

## 🔧 Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT, bcryptjs
- **UI Components:** Radix UI, shadcn/ui
- **Validation:** Zod
- **State Management:** SWR
- **Animation:** Framer Motion
- **Icons:** Lucide React

## 📄 License

MIT

## 👨‍💻 Contributing

This is a private project. For issues or questions, contact the maintainer.

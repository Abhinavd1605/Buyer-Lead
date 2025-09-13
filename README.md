# 🏢 LeadFlow Pro - Real Estate CRM

A comprehensive, modern buyer lead management system built with Next.js, TypeScript, and Supabase. Designed for real estate professionals who demand excellence in their tools.

![LeadFlow Pro](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-indigo)

## ✨ Features

### 🎯 **Core Functionality**
- **Complete CRUD Operations** - Create, read, update, and delete buyer leads
- **Advanced Search & Filtering** - Real-time search with multiple filter options
- **Smart Pagination** - Server-side pagination with configurable page sizes
- **Role-Based Access Control** - User and Admin roles with permission management
- **Audit Trail** - Complete history tracking of all lead changes

### 📊 **Data Management**
- **CSV Import/Export** - Bulk operations with row-level validation
- **Data Validation** - Comprehensive Zod schemas on both client and server
- **Concurrency Control** - Optimistic locking to prevent data conflicts
- **Real-time Updates** - Live data synchronization across sessions

### 🎨 **User Experience**
- **Modern UI Design** - Professional, clean interface with smooth animations
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme** - Adaptive design system
- **Accessibility** - WCAG 2.1 compliant with keyboard navigation

### 🔒 **Security & Performance**
- **Rate Limiting** - Multi-tier rate limiting for different operations
- **Input Sanitization** - XSS protection and SQL injection prevention
- **Error Boundaries** - Graceful error handling and recovery
- **Performance Optimization** - Code splitting and lazy loading

## 🏗 Architecture

### **Frontend (Next.js 15)**
```
frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── login/             # Authentication
│   │   ├── buyers/            # Lead management
│   │   │   ├── new/           # Create new lead
│   │   │   └── [id]/          # View/Edit lead
│   │   └── globals.css        # Design system
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React contexts (Auth)
│   └── lib/                   # Utilities and API client
```

### **Backend (Express + Prisma)**
```
backend/
├── src/
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth, rate limiting, errors
│   ├── utils/                 # Database, CSV, auth utilities
│   ├── validators/            # Zod validation schemas
│   └── types/                 # TypeScript definitions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (or PostgreSQL database)

### 1. Clone & Install
```bash
git clone https://github.com/Abhinavd1605/Buyer-Lead.git
cd Buyer-Lead
npm run install:all
```

### 2. Environment Setup

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-role-key"

# App Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Database Setup
```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 4. Start Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Visit `http://localhost:3000` and use the demo accounts to explore!

## 📋 Data Model

### **Buyers Table**
- `id` (UUID) - Primary key
- `fullName` (String, 2-80 chars) - Required
- `email` (Email) - Optional
- `phone` (String, 10-15 digits) - Required
- `city` (Enum) - Chandigarh|Mohali|Zirakpur|Panchkula|Other
- `propertyType` (Enum) - Apartment|Villa|Plot|Office|Retail
- `bhk` (Enum) - Studio|1|2|3|4 (required for Apartment/Villa)
- `purpose` (Enum) - Buy|Rent
- `budgetMin/Max` (Integer) - INR amounts
- `timeline` (Enum) - 0-3m|3-6m|>6m|Exploring
- `source` (Enum) - Website|Referral|Walk-in|Call|Other
- `status` (Enum) - New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped
- `notes` (Text, ≤1000 chars) - Optional
- `tags` (String Array) - Optional
- `ownerId` (UUID) - Foreign key to Users
- `createdAt/updatedAt` (Timestamp) - Auto-managed

### **Users Table**
- `id` (UUID) - Primary key
- `email` (String) - Unique
- `fullName` (String) - Required
- `role` (Enum) - USER|ADMIN
- `createdAt/updatedAt` (Timestamp) - Auto-managed

### **Buyer History Table**
- `id` (UUID) - Primary key
- `buyerId` (UUID) - Foreign key
- `changedBy` (UUID) - Foreign key to Users
- `changedAt` (Timestamp) - Auto-managed
- `diff` (JSON) - Change details

## 🔐 Authentication & Authorization

### **Demo Authentication**
- **Demo User**: `demo@example.com` - Can manage own leads
- **Demo Admin**: `admin@example.com` - Can manage all leads

### **Permission Model**
- **Users**: Can read all leads, edit/delete only their own
- **Admins**: Full access to all leads and users
- **Ownership**: Leads are assigned to the creating user

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/demo-login` - Demo authentication
- `POST /api/auth/logout` - User logout

### **Buyers**
- `GET /api/buyers` - List buyers (paginated, filtered)
- `GET /api/buyers/:id` - Get specific buyer
- `POST /api/buyers` - Create new buyer
- `PUT /api/buyers/:id` - Update buyer
- `DELETE /api/buyers/:id` - Delete buyer
- `POST /api/buyers/import` - CSV import (max 200 rows)
- `GET /api/buyers/export` - CSV export (filtered)

## 🛡 Security Features

### **Rate Limiting**
- General API: 100 requests/15min
- Create/Update: 50 requests/15min
- CSV Import: 5 requests/hour
- Authentication: 10 attempts/15min

### **Data Protection**
- Input validation on client and server
- SQL injection prevention via Prisma
- XSS protection with sanitization
- CORS configuration for frontend-only access

## 🧪 Testing

```bash
cd backend
npm test
```

Includes unit tests for:
- CSV row validation
- Budget validation logic
- Authentication middleware
- API endpoint responses

## 🎨 Design System

### **Color Palette**
- **Primary**: Blue gradient (#3b82f6 → #1d4ed8)
- **Secondary**: Purple gradient (#8b5cf6 → #ec4899)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### **Typography**
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Scale**: 12px → 36px with consistent rhythm

### **Components**
- **Cards**: Glass morphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Floating labels with validation states
- **Tables**: Clean, responsive data display

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet**: Adjusted layouts for medium screens
- **Desktop**: Full-featured experience with sidebars
- **Large Screens**: Optimized for 4K displays

## 🔧 Development

### **Code Quality**
- **TypeScript**: 100% type coverage
- **ESLint**: Strict linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks

### **Performance**
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer
- **Lighthouse Score**: 95+ on all metrics

## 📈 Scalability

### **Database**
- **Connection Pooling**: Supabase pooler for high concurrency
- **Indexing**: Optimized queries with proper indexes
- **Migrations**: Version-controlled schema changes
- **Backup**: Automated daily backups

### **Deployment**
- **Vercel**: Frontend deployment with edge functions
- **Railway/Heroku**: Backend deployment options
- **Docker**: Containerized deployment ready
- **CI/CD**: GitHub Actions workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent ORM
- **Radix UI** - For accessible component primitives
- **Supabase** - For the backend-as-a-service platform

---

**Built with ❤️ for the real estate community**

For support, email: support@leadflowpro.com

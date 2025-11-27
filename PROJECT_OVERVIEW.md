# OWL Platform - Project Structure & Architecture Overview

## Executive Summary

The **OWL Platform** is a comprehensive management system built with a modern full-stack architecture. It combines a **Next.js-based frontend** with an **Express.js/Node.js backend**, using **PostgreSQL** as the primary database. The system features a sophisticated low-code platform for dynamic data management and API configuration, alongside traditional RBAC (Role-Based Access Control) system management.

---

## 1. Overall Project Structure

### Directory Layout

```
owl_platform/
├── frontend/                 # Next.js 15.5.5 front-end application
│   ├── app/                 # Next.js App Router (v13+)
│   ├── components/          # React components (UI, pages, features)
│   ├── lib/                 # Utility functions, API clients, helpers
│   ├── contexts/            # React context providers
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Express.js Node.js backend
│   ├── src/
│   │   ├── app.js          # Express app initialization
│   │   ├── routes/         # API route definitions
│   │   ├── modules/        # Feature modules (auth, user, role, etc.)
│   │   ├── models/         # Sequelize ORM models
│   │   ├── middlewares/    # Express middlewares
│   │   ├── config/         # Configuration files (DB, Redis, etc.)
│   │   ├── utils/          # Utility functions
│   │   └── services/       # Business logic services
│   ├── migrations/         # Database migrations
│   ├── seeders/            # Database seeders
│   ├── scripts/            # Utility scripts
│   └── package.json        # Backend dependencies
│
├── shared/                 # Shared code between frontend/backend
├── CODEBASE_STRUCTURE.md   # Detailed architecture documentation
└── README.md
```

---

## 2. System Management Module Location

### Frontend System Management (`/frontend/app/(authenticated)/setting/`)

The system management interface is located in the **`(authenticated)/setting`** folder with these sub-modules:

| Module | Path | Purpose |
|--------|------|---------|
| **Users** | `/setting/users` | User account management, status control |
| **Roles** | `/setting/roles` | Role definition and management |
| **Permissions** | `/setting/permissions` | Fine-grained permission configuration |
| **Menus** | `/setting/menus` | Navigation menu structure and visibility |
| **Departments** | `/setting/departments` | Organizational hierarchy |
| **Email Templates** | `/setting/email-templates` | Email notification templates |
| **Notification Settings** | `/setting/notification-settings` | Alert and notification preferences |

### Backend System Management Modules

Located in `/backend/src/modules/`:

| Module | Folder | Responsibility |
|--------|--------|-----------------|
| **auth** | `/auth/` | Authentication (login, register, JWT) |
| **user** | `/user/` | User CRUD operations |
| **role** | `/role/` | Role management |
| **permission** | `/permission/` | Permission definitions and checks |
| **menu** | `/menu/` | Menu hierarchy management |
| **department** | `/department/` | Department structure |

---

## 3. Backend API Structure

### API Endpoint Patterns

All APIs follow RESTful conventions with `/api` prefix:

```
HTTP Method | Endpoint Pattern | Purpose
------------|------------------|----------
GET         | /api/[resource]  | List (with pagination, filtering, sorting)
POST        | /api/[resource]  | Create
GET         | /api/[resource]/:id | Retrieve
PUT         | /api/[resource]/:id | Update
DELETE      | /api/[resource]/:id | Delete
POST        | /api/[resource]/batch-delete | Batch operations
```

### Core API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register         - User registration with captcha
POST   /api/auth/login            - User login with JWT token generation
GET    /api/auth/me               - Get current user info
POST   /api/auth/refresh-token    - Refresh JWT token
POST   /api/auth/change-password  - Change password
POST   /api/auth/logout           - Logout
```

#### System Management Endpoints
```
Users:
GET    /api/users                 - List users (with pagination, search)
POST   /api/users                 - Create user
GET    /api/users/:id             - Get user details
PUT    /api/users/:id             - Update user
DELETE /api/users/:id             - Delete user
POST   /api/users/:id/reset-password - Reset password

Roles:
GET    /api/roles                 - List roles
GET    /api/roles/all             - Get all roles (no pagination)
POST   /api/roles                 - Create role
PUT    /api/roles/:id             - Update role
DELETE /api/roles/:id             - Delete role

Permissions:
GET    /api/permissions           - List permissions
POST   /api/permissions           - Create permission
PUT    /api/permissions/:id       - Update permission
DELETE /api/permissions/:id       - Delete permission

Menus:
GET    /api/menus                 - List menus
GET    /api/menus/tree            - Get tree structure
GET    /api/menus/user-tree       - Get user-accessible menus
POST   /api/menus                 - Create menu
PUT    /api/menus/:id             - Update menu
DELETE /api/menus/:id             - Delete menu

Departments:
GET    /api/departments           - List departments
GET    /api/departments/tree      - Tree structure
POST   /api/departments           - Create
PUT    /api/departments/:id       - Update
DELETE /api/departments/:id       - Delete
```

#### Code Generator Endpoints
```
GET    /api/generator/module-configs - Get generated modules
GET    /api/generator/page-config/:path - Get page configuration
POST   /api/generator/generate-code - Generate code from SQL
POST   /api/generator/validate-sql - Validate SQL syntax
POST   /api/generator/generate-fields - Generate field configs
```

#### Low-Code Platform Endpoints
```
GET    /api/datasources           - List data sources
POST   /api/datasources/:id/test  - Test connection

GET    /api/api-interfaces        - List custom APIs
POST   /api/api-interfaces        - Create custom API
POST   /api/api-interfaces/:id/test - Test API

GET    /api/page-configs          - List page configs
POST   /api/page-configs          - Create page config

GET    /api/custom/*              - Dynamic API execution
```

### Response Format

All API responses follow a standard format:

```javascript
{
  success: true/false,
  data: {...},              // Response data (object or array)
  message: "...",           // Status message
  code: "...",              // Error code
  pagination?: {            // For list endpoints
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  },
  timestamp: "2025-11-27T..."
}
```

---

## 4. Authentication & Authorization System

### Authentication Mechanism

**JWT (JSON Web Token) based authentication:**

1. **User Login Flow:**
   - User provides username/password + captcha
   - Server validates credentials and generates JWT token
   - Token includes: `{ id, username, email }`
   - Token expiration: 7 days (configurable)

2. **Token Storage:**
   - Stored in HTTP-only cookies (or localStorage on frontend)
   - Sent in `Authorization: Bearer {token}` header

3. **Authentication Middleware:**
   - Located in: `/backend/src/middlewares/auth.js`
   - Verifies JWT signature
   - Loads user and roles from database
   - Checks user status (active/inactive/banned)

### Authorization System (RBAC)

**Role-Based Access Control with Permissions:**

#### Database Relationships:
```
User --(many-to-many)--> Role --(many-to-many)--> Permission
  ↓
 Menu (each role has assigned menus)

User: 1 user → multiple roles
Role: 1 role → multiple permissions
Permission: resource:action format (e.g., "user:create", "role:delete")
```

#### Permission Format:
```javascript
{
  code: "resource:action",     // e.g., "user:create"
  resource: "user",            // Resource name
  action: "create",            // Action: create, read, update, delete
  category: "system",          // Category for grouping
  description: "..."           // Description
}
```

#### Permission Middleware:
- Located in: `/backend/src/middlewares/permission.js`
- Uses Access Control library
- Checks if user's roles have required permission
- Can be applied per route or per controller

#### Menu Visibility:
- Menus are filtered based on user's roles
- Each menu has optional `permission_code` field
- Frontend fetches `/api/menus/user-tree` to get filtered menu

### Current Built-in Roles

1. **admin** - Full system access
2. **user** - Regular user with limited permissions
3. **guest** - Read-only access (if configured)

---

## 5. Database Schema Structure

### Database Technology

- **Primary**: PostgreSQL
- **ORM**: Sequelize
- **Features**: UUID primary keys, soft delete, timestamps, associations

### Core System Tables

#### Users Table (`users`)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL (bcrypt hashed),
  real_name VARCHAR(50),
  phone VARCHAR(20) UNIQUE,
  avatar VARCHAR(255),
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  department_id UUID FOREIGN KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP (soft delete)
);
```

#### Roles Table (`roles`)
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,  -- Role code for RBAC
  description VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

#### Permissions Table (`permissions`)
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,  -- Format: "resource:action"
  resource VARCHAR(50) NOT NULL,     -- Resource name
  action VARCHAR(50) NOT NULL,       -- create, read, update, delete
  description VARCHAR(255),
  category VARCHAR(50),              -- For grouping
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Menus Table (`menus`)
```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY,
  parent_id UUID,                    -- For tree structure
  name VARCHAR(50) NOT NULL,
  path VARCHAR(255),                 -- Route path
  component VARCHAR(255),            -- Component path
  icon VARCHAR(50),                  -- Icon name
  type ENUM('menu', 'button', 'link') DEFAULT 'menu',
  visible BOOLEAN DEFAULT true,
  sort INTEGER DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  permission_code VARCHAR(50),       -- Linked permission
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

#### Departments Table (`departments`)
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  parent_id UUID,                    -- For hierarchy
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  code VARCHAR(50),
  sort INTEGER DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

#### Association Tables

```sql
-- User-Role Many-to-Many
CREATE TABLE user_roles (
  user_id UUID FOREIGN KEY REFERENCES users(id),
  role_id UUID FOREIGN KEY REFERENCES roles(id),
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- Role-Permission Many-to-Many
CREATE TABLE role_permissions (
  role_id UUID FOREIGN KEY REFERENCES roles(id),
  permission_id UUID FOREIGN KEY REFERENCES permissions(id),
  created_at TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- Role-Menu Many-to-Many
CREATE TABLE role_menus (
  role_id UUID FOREIGN KEY REFERENCES roles(id),
  menu_id UUID FOREIGN KEY REFERENCES menus(id),
  created_at TIMESTAMP,
  PRIMARY KEY (role_id, menu_id)
);
```

### Code Generation Tables

#### GeneratedModule Table
```sql
CREATE TABLE generated_modules (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  path VARCHAR(100),           -- API path
  description VARCHAR(255),
  table_name VARCHAR(100),     -- Source table
  status ENUM('draft', 'published') DEFAULT 'draft',
  page_config JSONB,           -- Dynamic page configuration
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### GeneratedField Table
```sql
CREATE TABLE generated_fields (
  id UUID PRIMARY KEY,
  module_id UUID FOREIGN KEY,
  field_name VARCHAR(100),
  field_type VARCHAR(50),      -- Database type
  is_searchable BOOLEAN,
  search_type VARCHAR(50),     -- exact, like, range, in
  search_component VARCHAR(50), -- UI component type
  show_in_list BOOLEAN,
  show_in_form BOOLEAN,
  format_type VARCHAR(50),     -- Formatting type
  format_options JSONB,        -- Formatting configuration
  form_component VARCHAR(50),  -- Form component type
  form_rules JSONB,            -- Validation rules
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Low-Code Tables

#### DataSources Table
```sql
CREATE TABLE datasources (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),            -- mysql, postgres, mongodb
  host VARCHAR(255),
  port INTEGER,
  database VARCHAR(100),
  username VARCHAR(100),
  password VARCHAR(255),       -- Encrypted
  config JSONB,                -- Connection options
  is_default BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

#### ApiInterface Table
```sql
CREATE TABLE api_interfaces (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(255) UNIQUE,    -- URL path
  method VARCHAR(10),          -- GET, POST, PUT, DELETE
  sql_template TEXT,           -- SQL or API template
  parameters JSONB,            -- Parameter definitions
  response_format JSONB,       -- Output format
  auth_type VARCHAR(50),       -- JWT, API_KEY, NONE
  cache_enabled BOOLEAN,
  cache_duration INTEGER,      -- In seconds
  rate_limit INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Call logs table
CREATE TABLE api_call_logs (
  id UUID PRIMARY KEY,
  api_id UUID FOREIGN KEY,
  user_id UUID FOREIGN KEY,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  execution_time INTEGER,      -- In milliseconds
  created_at TIMESTAMP
);
```

#### PageConfig Table
```sql
CREATE TABLE page_configs (
  id UUID PRIMARY KEY,
  module_id UUID FOREIGN KEY,  -- Which module
  api_id UUID FOREIGN KEY,     -- Which API
  page_type VARCHAR(50),       -- config, designer
  display_mode VARCHAR(50),    -- table, sortable, form
  fields JSONB,                -- Field mappings
  search_config JSONB,         -- Search field config
  pagination_config JSONB,
  lifecycle JSONB,             -- beforeLoad, afterLoad hooks
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 6. Technology Stack Summary

### Frontend Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | Full-stack React framework | 15.5.5 |
| **React** | UI library | 19.1.0 |
| **React Hook Form** | Form management | 7.65.0 |
| **Axios** | HTTP client | 1.12.2 |
| **Tailwind CSS** | Utility CSS framework | v4 |
| **shadcn/ui** | Component library | Latest |
| **Radix UI** | Unstyled component primitives | Latest |
| **Socket.io-client** | Real-time communication | 4.8.1 |
| **Recharts** | Chart library | 3.2.1 |
| **Zod** | Schema validation | 4.1.12 |

### Backend Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Express.js** | Web framework | 4.18.2 |
| **Node.js** | Runtime | Latest |
| **Sequelize** | ORM | 6.35.2 |
| **PostgreSQL** | Primary database | Latest |
| **MySQL2** | MySQL support | 3.15.3 |
| **MongoDB** | NoSQL support | 6.21.0 |
| **JWT** | Authentication tokens | 9.0.2 |
| **bcryptjs** | Password hashing | 2.4.3 |
| **Joi** | Schema validation | 18.0.1 |
| **Redis** | Caching | 4.6.12 |
| **Minio** | File storage | 7.1.3 |
| **Socket.io** | Real-time communication | 4.8.1 |
| **Winston** | Logging | 3.11.0 |
| **Handlebars** | Template engine (code generation) | 4.7.8 |

### Database & DevOps

| Technology | Purpose |
|-----------|---------|
| **PostgreSQL** | Primary relational database |
| **Redis** | Session/cache storage |
| **Minio** | S3-compatible file storage |
| **Docker Compose** | Containerization |
| **PM2** | Process management (production) |

---

## 7. Key Features & Modules

### System Management Features

1. **User Management**
   - Create, read, update, delete users
   - User status control (active/inactive/banned)
   - Password management and reset
   - User-role assignment
   - Department assignment

2. **Role Management**
   - Define roles with custom names
   - Assign permissions to roles
   - Control menu visibility per role
   - Role status and sorting

3. **Permission Management**
   - Fine-grained resource:action permissions
   - Permission categories for organization
   - Dynamic permission checking
   - Role-permission mapping

4. **Menu Management**
   - Hierarchical menu structure
   - Role-based visibility
   - Icon and path configuration
   - Menu sorting and status

5. **Department Management**
   - Organizational hierarchy
   - User-department relationships
   - Department status management

### Additional Core Modules

1. **Authentication**
   - User registration with email validation
   - Login with captcha verification
   - JWT-based session management
   - Password changing

2. **File Management**
   - File upload/download
   - Folder hierarchy
   - File sharing with code generation
   - Minio integration

3. **Dashboard**
   - System metrics and statistics
   - User activity tracking
   - Login trends

4. **Logging**
   - Operation logs
   - API call logs
   - Error tracking

5. **Monitoring**
   - API health checks
   - Performance monitoring
   - Alert rules and history

6. **Notifications**
   - Email templates
   - Notification management
   - Socket.io real-time updates

### Advanced Features

1. **Code Generator**
   - SQL → Page configuration conversion
   - Automatic CRUD interface generation
   - Field configuration and mapping
   - Dynamic component rendering

2. **Low-Code Platform**
   - Data source management
   - Custom API configuration
   - Page designer with drag-drop
   - Dynamic SQL execution
   - API call logging and monitoring

---

## 8. Frontend Architecture

### Routing Structure

```
app/
├── (authenticated)/          # Protected routes (require auth)
│   ├── dashboard/
│   ├── setting/             # System management
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── menus/
│   │   └── departments/
│   ├── files/
│   ├── logs/
│   ├── monitor/
│   ├── notifications/
│   ├── generator/           # Code generator
│   ├── [slug]/             # Dynamic routes
│   └── dynamic/[modulePath]/[id]/ # Dynamic detail page
├── login/                    # Authentication
├── register/
└── public/                   # Public pages
```

### Component Structure

Key component folders:
- `/components/dynamic-module/` - Dynamic CRUD components
- `/components/ui/` - Reusable UI components
- `/components/generator/` - Code generator UI
- `/components/users/` - User management components
- `/components/roles/` - Role management components
- etc.

### State Management

- **React Context API** - User authentication, theme, global state
- **React Hooks** - Local component state
- **Axios interceptors** - API response handling

---

## 9. File and Folder Organization

### Key Frontend Files

```
/frontend/
├── app/
│   ├── globals.css           # Global styles
│   ├── layout.js             # Root layout
│   ├── page.js               # Home page
│   ├── (authenticated)/layout.js # Auth layout (sidebar, header)
│   ├── login/page.js
│   └── [slug]/page.js        # Dynamic module list page
├── components/               # All React components
├── lib/
│   ├── api.js               # API client library
│   ├── axios.js             # Axios instance configuration
│   ├── response-transform-templates.js
│   └── utils.js             # Helper functions
├── contexts/                 # React context providers
├── public/                   # Static assets
├── next.config.mjs          # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
├── jsconfig.json            # JavaScript config
└── package.json
```

### Key Backend Files

```
/backend/src/
├── app.js                    # Express app setup
├── routes/index.js          # Route registry
├── routes/dynamic-routes.js # Dynamic module routes
├── middlewares/
│   ├── auth.js              # JWT authentication
│   ├── permission.js        # RBAC authorization
│   ├── error.js             # Error handling
│   └── validate.js          # Request validation
├── models/
│   ├── system/              # System tables (User, Role, etc.)
│   ├── generator/           # Code generator models
│   ├── monitor/             # Monitoring models
│   └── index.js             # Model associations
├── modules/
│   ├── auth/                # Authentication module
│   ├── user/                # User management
│   ├── role/                # Role management
│   ├── permission/          # Permission management
│   ├── menu/                # Menu management
│   ├── generator/           # Code generation engine
│   ├── datasource/          # Low-code data sources
│   ├── api-interface/       # Low-code API config
│   ├── page-config/         # Low-code page config
│   └── [other modules]/
├── config/
│   ├── database.js          # DB connection
│   ├── redis.js             # Redis connection
│   ├── logger.js            # Winston logger
│   └── minio.js             # File storage
├── utils/
│   ├── ApiError.js          # Error handling
│   ├── response.js          # Response formatting
│   └── [helpers]/
└── package.json
```

---

## 10. Data Flow Examples

### User Login Flow

```
1. Frontend: User enters credentials + captcha
   ↓
2. POST /api/auth/login
   ↓
3. Backend:
   - Verify captcha
   - Find user by username
   - Validate password (bcrypt compare)
   - Check user status
   - Generate JWT token
   ↓
4. Response: { token, user: {...} }
   ↓
5. Frontend: Store token, redirect to dashboard
```

### Page Creation (System Management Example)

```
1. Frontend: Submit user form
   ↓
2. POST /api/users (with Authorization header)
   ↓
3. Backend:
   - Authenticate middleware (verify JWT)
   - Permission middleware (check "user:create")
   - Validate input (Joi schema)
   - Hash password (bcrypt)
   - Create user in DB
   - Create user_roles record
   ↓
4. Response: { success: true, data: user }
   ↓
5. Frontend: Show toast, refresh list
```

### Dynamic Module Access Flow

```
1. Frontend: Click on generated module (e.g., "Products")
   ↓
2. GET /api/generator/page-config/:modulePath
   ↓
3. Backend returns page configuration:
   {
     moduleName: "Products",
     fields: [{name, label, isSearchable, showInList, ...}, ...],
     api: {list, create, update, delete, ...},
     permissions: {read, create, update, delete}
   }
   ↓
4. Frontend: DynamicCrudPage component renders based on config
   - DynamicFilters (from searchable fields)
   - DynamicTable (from showInList fields)
   - DynamicForm (from showInForm fields)
   ↓
5. List data fetched from GET /api/products?page=1&limit=10
```

---

## 11. Security Features

1. **Authentication**
   - JWT tokens with 7-day expiration
   - Bcrypt password hashing
   - Captcha on login
   - Password change functionality

2. **Authorization**
   - Role-Based Access Control (RBAC)
   - Resource:action permission model
   - Fine-grained endpoint protection

3. **Data Protection**
   - Soft deletes (paranoid mode)
   - Encrypted sensitive fields (passwords, API keys)
   - UUID primary keys (not sequential)

4. **API Security**
   - CORS configuration
   - Rate limiting per endpoint
   - Request validation (Joi)
   - SQL injection prevention (Sequelize ORM)
   - Helmet.js for HTTP headers

5. **Logging & Monitoring**
   - Winston logger for error tracking
   - API call logging
   - User action audit trail
   - Performance monitoring

---

## 12. Configuration & Environment

### Environment Variables

Key backend env vars:
```
NODE_ENV=development|production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=owl_platform
DB_USER=postgres
DB_PASSWORD=...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
```

### Sequelize Configuration
- Located in `/backend/src/config/database.js`
- Supports development, test, production environments
- Automatic migrations with sequelize-cli

---

## Summary

The **OWL Platform** is a comprehensive, production-ready management system with:

- **Frontend**: Modern Next.js 15 with React 19, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with Sequelize ORM, PostgreSQL, Redis, Minio
- **Security**: JWT auth + RBAC with fine-grained permissions
- **System Management**: Complete user, role, permission, menu, department management
- **Advanced Features**: Code generator + Low-code platform for custom APIs and page configurations
- **Architecture**: Clean separation of concerns with modules, services, and controllers
- **Database**: UUID-based, with soft deletes, timestamps, and comprehensive schema

The system is designed for scalability, maintainability, and easy expansion with new features.


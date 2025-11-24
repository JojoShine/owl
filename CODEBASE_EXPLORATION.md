# Codebase Exploration Report: SQL Highlighting & Response Transformation

## Executive Summary

This report documents the current implementation of SQL syntax highlighting and response transformation features in the Owl Platform. The system uses a configuration-driven architecture with Handlebars templating for code generation and react-syntax-highlighter for frontend SQL visualization.

---

## 1. SQL SYNTAX HIGHLIGHTING

### 1.1 Frontend SQL Editor Component
**File**: `/Users/jojoshine/projects/owl_platform/frontend/components/generator/SqlEditor.jsx`

#### Key Features:
- SQL query editor with real-time syntax validation
- Toggle-able syntax highlighting using Prism.js
- Live preview of query results in table format
- Field configuration auto-generation from SQL
- Uses `react-syntax-highlighter` library with `oneDark` theme

#### Implementation Details:
```javascript
// Syntax Highlighter Usage
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

<SyntaxHighlighter
  language="sql"
  style={oneDark}
  customStyle={{
    margin: 0,
    minHeight: '200px',
    fontSize: '0.875rem',
  }}
  showLineNumbers
>
  {sql || '-- 请输入SQL查询语句'}
</SyntaxHighlighter>
```

#### Main Functions:
1. **handleSqlChange**: Manages SQL input changes
2. **handleValidate**: Validates SQL syntax via backend
3. **handlePreview**: Executes preview query (limit 10 rows)
4. **handleGenerateFields**: Auto-generates field configurations
5. **setShowHighlight**: Toggles between plain textarea and highlighted view

---

## 2. SQL VALIDATION & PARSING

### 2.1 SQL Parser Service
**File**: `/Users/jojoshine/projects/owl_platform/backend/src/modules/generator/sql-parser.service.js`

#### Core Responsibilities:
- SQL syntax validation using PostgreSQL EXPLAIN
- Field type inference from query results
- Safety checks (SQL injection prevention)
- Table metadata extraction

#### Key Methods:

| Method | Purpose |
|--------|---------|
| `validateSql(sql)` | Validates SQL syntax and safety |
| `parseSqlFields(sql)` | Extracts field info from query results |
| `executeSampleQuery(sql, limit)` | Runs preview queries |
| `checkSqlSafety(sql)` | Performs security checks |
| `_inferFieldType(value, fieldName)` | Determines field data types |

#### Safety Checks:
- Whitelist: Only SELECT statements allowed
- Blacklist: Blocks DROP, DELETE, UPDATE, INSERT, TRUNCATE, ALTER, CREATE, etc.
- Prevents SQL injection via comment symbols (-- and /*)
- Prevents multi-statement execution

#### Field Type Inference:
- Name-based: Detects 'id', 'email', 'phone', 'date', 'is_*' patterns
- Value-based: Infers from actual data types (number, boolean, string, date, JSON)
- Supports: UUID, STRING, TEXT, INTEGER, DECIMAL, BOOLEAN, DATE, JSON

---

## 3. API INTERFACE SERVICE

### 3.1 API Interface Service
**File**: `/Users/jojoshine/projects/owl_platform/backend/src/modules/api-interface/api-interface.service.js`

#### Core Features:
- CRUD operations for API interfaces
- SQL parameter replacement and validation
- Output formatting (raw, object, list with pagination)
- API execution with statistics tracking
- Call logging and analytics

#### Response Transformation:

**formatOutput() Method** (Line 515-539):
```javascript
formatOutput(data, outputFormat) {
  if (!outputFormat || outputFormat.type === 'raw') {
    return data;
  }
  
  if (outputFormat.type === 'object') {
    // Returns first record
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  }
  
  if (outputFormat.type === 'list') {
    // Returns array with optional pagination
    if (outputFormat.pagination) {
      return {
        data: data,
        total: data.length,
        page: outputFormat.pagination.page || 1,
        pageSize: outputFormat.pagination.pageSize || data.length,
      };
    }
    return data;
  }
  
  return data;
}
```

#### SQL Parameter Replacement:
**replaceSqlParams() Method** (Line 431-464):
- Supports `:paramName` placeholder format
- Type conversion: string (quoted), number, boolean (TRUE/FALSE)
- Supports default values
- Test mode for missing required parameters

#### Key Fields in ApiInterface Model:
- `response_transform`: TEXT field for custom transformation code
- `output_format`: JSONB for formatting configuration
- `query_config`: JSONB containing SQL and query metadata
- `params_schema`: JSONB defining input parameters

---

## 4. GENERIC SERVICE (Configuration-Driven)

### 4.1 Generic CRUD Service
**File**: `/Users/jojoshine/projects/owl_platform/backend/src/modules/generator/generic.service.js`

#### Key Features:
- Configuration-driven CRUD operations
- Dynamic WHERE clause building
- Support for custom SQL queries
- Search type handling: like, exact, range
- Pagination and export functionality

#### Configuration-Driven Architecture:
```javascript
// Uses moduleConfig to dynamically build queries
if (moduleConfig.custom_sql) {
  return this._executeCustomSqlList(moduleConfig, query);
}

// Searchable fields from config
const searchableFields = moduleConfig.fields.filter(f => f.is_searchable);
```

#### Response Format:
```javascript
return {
  data: rows,
  pagination: {
    total: parseInt(count),
    page: parseInt(page),
    pageSize: parseInt(limit),
    totalPages: Math.ceil(count / limit),
  },
};
```

---

## 5. RESPONSE FORMATTING & UTILITIES

### 5.1 Response Utility Module
**File**: `/Users/jojoshine/projects/owl_platform/backend/src/utils/response.js`

#### Unified Response Format:
All API responses follow a consistent structure:

```javascript
{
  success: boolean,
  message: string,
  data: any,
  timestamp: ISO8601,
  errors?: object // Only for errors
}
```

#### Available Methods:
| Method | Status Code | Use Case |
|--------|-------------|----------|
| `success()` | 200 | Standard success |
| `created()` | 201 | Resource creation |
| `error()` | 400 | General errors |
| `notFound()` | 404 | Resource not found |
| `unauthorized()` | 401 | Auth failure |
| `forbidden()` | 403 | Permission denied |
| `validationError()` | 422 | Validation failures |
| `serverError()` | 500 | Server errors |
| `paginated()` | 200 | Paginated lists |
| `list()` | 200 | Non-paginated lists |

---

## 6. FRONTEND COMPONENTS

### 6.1 API Interface Edit Page
**File**: `/Users/jojoshine/projects/owl_platform/frontend/app/(authenticated)/lowcode/apis/edit/page.js`

#### Features:
- Create/Edit API interfaces
- SQL query builder or raw SQL entry
- Parameter schema definition
- SQL testing with custom parameters
- Response transformation setup
- Cache and rate limiting configuration

#### Form Fields:
- `name`: API name
- `path`: URL path
- `method`: HTTP method (GET, POST, PUT, DELETE)
- `datasource_id`: Database connection
- `query_config`: SQL and query metadata
- `params_schema`: Input parameters
- `response_transform`: Custom transformation code
- `cache_enabled`, `cache_ttl`: Cache settings
- `rate_limit`: Rate limiting configuration

---

## 7. TEMPLATE GENERATION

### 7.1 Code Generator Service
**File**: `/Users/jojoshine/projects/owl_platform/backend/src/modules/generator/code-generator.service.js`

#### Architecture:
- Uses Handlebars for template rendering
- Configuration-driven: No file generation needed
- Supports both SQL-based and table-based modules

#### Template Files (in `/templates/`):
1. **backend-service.hbs**: Service layer template
2. **backend-controller.hbs**: Controller template
3. **backend-model.hbs**: Model definition
4. **backend-routes.hbs**: Route definitions
5. **backend-validation.hbs**: Input validation
6. **frontend-page.hbs**: Frontend page template
7. **frontend-form-dialog.hbs**: Form dialog template
8. **frontend-filters.hbs**: Filter component template

#### Handlebars Helpers:
- Custom helper functions for formatting
- Joi type conversion
- Field grouping and categorization

#### Template Data Preparation:
```javascript
const templateData = this._prepareTemplateData(moduleConfig, tableSchema);
// Includes:
// - moduleName, modulePath, description
// - fields with types, comments, validation rules
// - searchable fields, required fields
// - table metadata and relationships
```

---

## 8. DATABASE MODEL

### 8.1 ApiInterface Model
**File**: `/Users/jojoshine/projects/owl_platform/backend/src/models/ApiInterface.js`

#### Key Fields:
```javascript
{
  id: UUID (PK),
  name: STRING(100),
  path: STRING(200) UNIQUE,
  method: ENUM('GET', 'POST', 'PUT', 'DELETE'),
  datasource_id: UUID (FK),
  
  // Query Configuration
  query_type: STRING (raw | builder),
  query_config: JSONB,
  
  // Parameters
  input_params: JSONB (deprecated),
  params_schema: JSONB,
  
  // Response Handling
  output_format: JSONB,
  response_transform: TEXT,
  
  // Security & Performance
  auth_required: BOOLEAN,
  auth_config: JSONB,
  cache_enabled: BOOLEAN,
  cache_ttl: INTEGER,
  rate_limit: INTEGER,
  rate_limit_enabled: BOOLEAN,
  rate_limit_config: JSONB,
  
  // Metadata
  is_active: BOOLEAN,
  version: INTEGER,
  call_count: INTEGER,
  last_called_at: DATE,
  avg_response_time: FLOAT,
  created_by: UUID (FK)
}
```

---

## 9. DATA FLOW DIAGRAM

### Request Flow for SQL Execution:

```
Frontend (API Edit Page)
    ↓
SQL Editor Component (SqlEditor.jsx)
    ↓ [Validate/Preview/Generate]
    ↓
Backend API Endpoints
    ↓
API Interface Service
    ├─ validateSql() → SQL Parser Service
    ├─ testSql() → Datasource Service
    └─ parseSql() → Extract params & fields
    ↓
Datasource Service (executes query)
    ↓
Database
    ↓
Response Formatting
    ├─ formatOutput() [shape response]
    └─ Response Utility [JSON structure]
    ↓
Frontend
    ├─ Preview Table
    ├─ Field Configuration
    └─ Parameter Definition
```

---

## 10. API ENDPOINTS

### SQL-Related Endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generator/validate-sql` | POST | Validate SQL syntax |
| `/generator/preview-sql` | POST | Preview query results |
| `/generator/generate-fields` | POST | Extract field definitions |
| `/api-interfaces` | GET/POST | CRUD operations |
| `/api-interfaces/:id/test` | POST | Test API with parameters |
| `/api-interfaces/parse` | POST | Parse SQL for params & fields |
| `/custom-api/:path` | GET/POST/PUT/DELETE | Execute custom API |

---

## 11. KEY TECHNOLOGIES

### Frontend:
- **React 18**: UI framework
- **react-syntax-highlighter**: SQL syntax highlighting (Prism.js based)
- **Next.js**: Framework and routing
- **Tailwind CSS**: Styling

### Backend:
- **Express.js**: API server
- **Sequelize**: ORM
- **PostgreSQL**: Database
- **Handlebars**: Template engine
- **node-sql-parser**: SQL parsing (implicit)

### Libraries:
- **lucide-react**: Icons
- **sonner**: Toast notifications
- **axios**: HTTP client

---

## 12. CONFIGURATION-DRIVEN ARCHITECTURE

### Key Concept:
The platform uses a **configuration-driven** approach instead of code generation:

1. **Module Configuration**: Stored in database
2. **Page Configuration**: Stored in database
3. **No File Generation**: Uses dynamic routing and generic services
4. **Zero Restart**: Changes take effect immediately
5. **Flexible**: Easy to modify without touching code

### Benefits:
- Faster development cycles
- No application restarts needed
- Easy rollback of changes
- Better version control
- Easier debugging

---

## 13. RESPONSE TRANSFORMATION FLOW

### Current Implementation:

```javascript
// 1. Execute SQL
const queryResult = await datasourceService.executeQuery(...);

// 2. Format Output
result = this.formatOutput(
  queryResult.data,
  apiInterface.output_format
);

// 3. Apply Custom Transformation (stored in response_transform)
// Note: Field exists but implementation may need enhancement

// 4. Return via Response Utility
return success(res, result, message);
```

### Output Format Types:
1. **raw**: Return data as-is
2. **object**: Return first record only
3. **list**: Return array with optional pagination metadata

---

## 14. IMPORTANT NOTES

### Backward Compatibility:
- System maintains compatibility with old field names:
  - `sql_template` (old) → `query_config.sql` (new)
  - `input_params` (old) → `params_schema` (new)

### Type Conversions:
```javascript
// Parameter types handled:
- string: Wrapped in quotes, escaped
- number: Direct conversion
- boolean: TRUE/FALSE
- null/undefined: NULL or default value
```

### Error Handling:
- Centralized via ApiError class
- Standardized error responses
- Detailed logging in all services

---

## 15. FILE LOCATIONS SUMMARY

| Purpose | Location |
|---------|----------|
| SQL Editor Component | `/frontend/components/generator/SqlEditor.jsx` |
| SQL Parser Service | `/backend/src/modules/generator/sql-parser.service.js` |
| API Interface Service | `/backend/src/modules/api-interface/api-interface.service.js` |
| Generic Service | `/backend/src/modules/generator/generic.service.js` |
| Response Utilities | `/backend/src/utils/response.js` |
| API Model | `/backend/src/models/ApiInterface.js` |
| Code Generator | `/backend/src/modules/generator/code-generator.service.js` |
| Templates | `/backend/src/modules/generator/templates/` |
| API Edit Page | `/frontend/app/(authenticated)/lowcode/apis/edit/page.js` |
| API Utilities | `/frontend/lib/api.js` |

---

## 16. RECOMMENDATIONS FOR ENHANCEMENT

### SQL Highlighting:
1. Add Monaco Editor for advanced SQL editing (VS Code-like)
2. Add syntax error indicators inline
3. Add SQL formatting/beautification
4. Add context-aware autocomplete

### Response Transformation:
1. Implement custom transformation code execution
2. Add field mapping/renaming in UI
3. Add data type conversion options
4. Add conditional response shaping
5. Add aggregation/grouping options

### Monitoring:
1. Enhance call statistics tracking
2. Add performance metrics
3. Add error rate tracking
4. Add audit logging for transformations


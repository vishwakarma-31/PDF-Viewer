# AI PDF Invoice Extractor

A modern web application that leverages AI to extract and manage invoice data from PDF files. Upload PDFs, use Google Gemini or Groq AI to automatically extract vendor and invoice information, and manage your invoices through an intuitive CRUD interface.

## Project Overview

The AI PDF Invoice Extractor is a full-stack application designed to streamline invoice processing workflows. It combines powerful AI capabilities with a user-friendly interface to transform manual data entry into an automated process.

### Key Features
- **PDF Upload & Viewing**: Secure file upload with built-in PDF viewer featuring zoom and navigation controls
- **AI-Powered Extraction**: Choose between Google Gemini or Groq AI models for accurate data extraction
- **CRUD Operations**: Complete create, read, update, and delete functionality for invoice management
- **Advanced Search**: Search invoices by vendor name or invoice number with real-time filtering
- **Responsive Design**: Modern UI built with Next.js, React, and Tailwind CSS
- **Type-Safe**: Full TypeScript implementation with shared type definitions

### Architecture
- **Monorepo Structure**: Organized with Turbo for efficient build management
- **Frontend**: Next.js 15 with React 19, featuring server-side rendering and optimized performance
- **Backend**: Node.js/Express API with TypeScript, handling file uploads and AI processing
- **Database**: MongoDB Atlas for scalable data storage
- **File Storage**: Vercel Blob for secure PDF storage and retrieval
- **AI Integration**: Support for both Google Gemini and Groq AI models

## Deployed URLs

- **Web Application**: https://your-web-app.vercel.app
- **API**: https://your-api-app.vercel.app

## Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **pnpm** (package manager)
- **MongoDB Atlas** account and cluster
- **Google Gemini API** key
- **Groq API** key

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-pdf-invoice-extractor

# Install dependencies
pnpm install
```

### Development Commands
```bash
# Start both web and API in development mode
pnpm dev

# Build for production
pnpm build

# Deploy to Vercel
pnpm deploy:web  # Deploy web app
pnpm deploy:api  # Deploy API
pnpm deploy      # Deploy both
```

### Environment Setup
1. Copy the environment template:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

2. Fill in your environment variables (see Environment Variables section below)

3. Start the development servers:
   ```bash
   pnpm dev
   ```

The application will be available at:
- Web: http://localhost:3000
- API: http://localhost:3001

## Environment Variables

The API requires the following environment variables. Create a `.env` file in the `apps/api` directory:

### Required Variables
```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string_here

# Server
PORT=3000

# AI APIs
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# File Storage
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token_here

# Vercel (for production deployment)
VERCEL_URL=your_vercel_deployment_url_here
NODE_ENV=production
```

### Obtaining API Keys

1. **MongoDB Atlas**:
   - Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get connection string
   - Replace `<username>`, `<password>`, and `<database>` in the URI

2. **Google Gemini API**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to `GEMINI_API_KEY`

3. **Groq API**:
   - Go to [Groq Console](https://console.groq.com/keys)
   - Generate a new API key
   - Copy the key to `GROQ_API_KEY`

4. **Vercel Blob**:
   - In your Vercel dashboard, go to Storage → Blob
   - Create a new store and generate a token
   - Copy the token to `BLOB_READ_WRITE_TOKEN`

## API Documentation

The API provides RESTful endpoints for file upload, AI extraction, and invoice management. All endpoints return JSON responses.

### Base URL
```
http://localhost:3001/api (development)
https://your-api-app.vercel.app/api (production)
```

### Endpoints

#### 1. Upload PDF File
**POST** `/api/upload`

Upload a PDF file for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file, max 25MB)

**Response (200):**
```json
{
  "fileId": "uuid-generated-id",
  "fileName": "invoice.pdf",
  "blobUrl": "https://blob.vercel-storage.com/..."
}
```

**Error Responses:**
- 400: No file uploaded or invalid file type
- 500: Upload failed

#### 2. Extract Invoice Data
**POST** `/api/extract`

Extract invoice data using AI from an uploaded PDF.

**Request Body:**
```json
{
  "fileId": "uuid-generated-id",
  "model": "gemini",  // or "groq"
  "blobUrl": "https://blob.vercel-storage.com/...",
  "fileName": "invoice.pdf"
}
```

**Response (200):**
```json
{
  "_id": "mongo-object-id",
  "fileId": "uuid-generated-id",
  "fileName": "invoice.pdf",
  "vendor": {
    "name": "ABC Corp",
    "address": "123 Main St, City, State"
  },
  "invoice": {
    "number": "INV-001",
    "date": "2024-01-15T00:00:00.000Z",
    "total": 1250.00,
    "lineItems": [
      {
        "description": "Service A",
        "quantity": 2,
        "unitPrice": 500.00,
        "total": 1000.00
      },
      {
        "description": "Service B",
        "quantity": 1,
        "unitPrice": 250.00,
        "total": 250.00
      }
    ]
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- 400: Missing required fields or invalid model
- 500: Extraction failed

#### 3. List Invoices
**GET** `/api/invoices`

Retrieve all invoices with optional search.

**Query Parameters:**
- `q` (optional): Search term for vendor name or invoice number

**Response (200):**
```json
[
  {
    "_id": "mongo-object-id",
    "fileId": "uuid-generated-id",
    "fileName": "invoice.pdf",
    "vendor": {
      "name": "ABC Corp",
      "address": "123 Main St"
    },
    "invoice": {
      "number": "INV-001",
      "date": "2024-01-15T00:00:00.000Z",
      "total": 1250.00,
      "lineItems": [...]
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 4. Get Single Invoice
**GET** `/api/invoices/:id`

Retrieve a specific invoice by ID.

**Response (200):** Same as extract response

**Error Responses:**
- 404: Invoice not found

#### 5. Update Invoice
**PUT** `/api/invoices/:id`

Update an existing invoice.

**Request Body:** Partial invoice object (same structure as extract response)

**Response (200):** Updated invoice object

**Error Responses:**
- 400: Validation error
- 404: Invoice not found

#### 6. Delete Invoice
**DELETE** `/api/invoices/:id`

Delete an invoice by ID.

**Response (204):** No content

**Error Responses:**
- 404: Invoice not found

### Authentication
Currently, no authentication is implemented. All endpoints are publicly accessible.

## Architecture Overview

### Monorepo Structure
```
ai-pdf-invoice-extractor/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express.js backend API
├── packages/
│   └── types/        # Shared TypeScript definitions
├── package.json      # Root package.json with workspaces
├── turbo.json        # Turbo build configuration
└── README.md
```

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB Atlas
- **File Storage**: Vercel Blob
- **AI**: Google Gemini API, Groq API
- **Build Tool**: Turbo
- **Package Manager**: pnpm
- **UI Components**: Radix UI, Lucide Icons

### Data Flow
1. **Upload**: User uploads PDF → Stored in Vercel Blob → File metadata returned
2. **Extraction**: PDF fetched from blob → Parsed to text → AI processes text → Structured data saved to MongoDB
3. **Management**: CRUD operations on MongoDB → Real-time updates in web interface
4. **Search**: Query MongoDB with regex search → Filtered results displayed

## Features

### PDF Upload and Viewing
- Drag-and-drop PDF upload interface
- Real-time PDF viewer with zoom controls (50% - 300%)
- Page navigation with previous/next buttons
- Responsive design for mobile and desktop

### AI-Powered Data Extraction
- Support for Google Gemini 1.5 Flash model
- Support for Groq Llama 3 8B model
- Automatic parsing of vendor information and invoice details
- Line item extraction with quantity, unit price, and totals
- Error handling and fallback for extraction failures

### CRUD Operations
- Create new invoices manually or via AI extraction
- Read/view invoice details with formatted display
- Update existing invoices with form validation
- Delete invoices with confirmation

### Search Functionality
- Real-time search by vendor name
- Search by invoice number
- Debounced search input for performance
- Case-insensitive regex matching

## Contributing Guidelines

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/ai-pdf-invoice-extractor.git`
3. **Install dependencies**: `pnpm install`
4. **Create a feature branch**: `git checkout -b feature/your-feature-name`
5. **Make your changes** and ensure tests pass
6. **Commit your changes**: `git commit -am 'Add some feature'`
7. **Push to the branch**: `git push origin feature/your-feature-name`
8. **Submit a pull request**

### Development Best Practices
- Use TypeScript for all new code
- Follow existing code style and conventions
- Add proper error handling
- Update documentation for API changes
- Test your changes thoroughly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 vishwakarma-31

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
# AI & Storage Proxy Server

Express server providing secure proxy endpoints for OpenRouter AI and Bunny Storage.

## Features

- **OpenRouter AI Proxy**
  - Chat completions with streaming support
  - Model listing
  - Rate limiting for AI endpoints
  
- **Bunny Storage Proxy**
  - File upload with automatic path generation
  - File deletion
  - Directory listing
  - Image type validation

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Configure environment variables:
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `BUNNY_STORAGE_API_KEY`: Your Bunny Storage API key
- `BUNNY_STORAGE_ZONE_NAME`: Your Bunny storage zone name
- `BUNNY_CDN_URL`: Your Bunny CDN pull zone URL

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/ready` - Readiness check with external service validation

### AI Endpoints
- `POST /api/ai/chat/completions` - Chat completion (streaming supported)
- `GET /api/ai/models` - List available models

### Storage Endpoints
- `POST /api/storage/upload` - Upload file
- `DELETE /api/storage/delete` - Delete file
- `GET /api/storage/list` - List files in directory

## Authentication

All AI and storage endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer your-token-here
```

## Development

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # Type checking
```
# Image Upload Logging Guide

## Overview

The server now includes comprehensive logging for all image upload operations, tracking the entire flow from receiving the request to uploading to Bunny CDN.

## Log Levels

Set the log level using the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=DEBUG npm run dev  # Most verbose
LOG_LEVEL=INFO npm run dev   # Default - shows key operations
LOG_LEVEL=WARN npm run dev   # Only warnings and errors
LOG_LEVEL=ERROR npm run dev  # Only errors
```

## Log Output Format

Logs are output in the following format:
```
[timestamp] [LEVEL] message {context}
```

## Image Upload Flow Logs

When an image is uploaded, you'll see the following log sequence:

### 1. Request Received
```
[2025-01-26T12:00:00.000Z] [INFO] Incoming request {"method":"POST","url":"/api/storage/upload","userId":"user123","ip":"::1","userAgent":"Mozilla/5.0..."}
[2025-01-26T12:00:00.001Z] [INFO] Image upload request received {"method":"POST","url":"/api/storage/upload","userId":"user123","fileInfo":{"originalName":"photo.jpg","mimetype":"image/jpeg","size":1048576,"sizeKB":"1024.00 KB","sizeMB":"1.00 MB"},"customPath":null,"timestamp":"2025-01-26T12:00:00.001Z"}
```

### 2. Processing
```
[2025-01-26T12:00:00.002Z] [DEBUG] Processing file upload {"userId":"user123","fileName":"photo.jpg","fileSize":1048576,"mimeType":"image/jpeg"}
[2025-01-26T12:00:00.003Z] [INFO] Forwarding upload to Bunny CDN {"userId":"user123","customPath":null,"fileName":"photo.jpg","fileSize":1048576}
```

### 3. Bunny API Call
```
[2025-01-26T12:00:00.004Z] [INFO] Calling Bunny Storage API - Upload {"operation":"UPLOAD","bunnyUrl":"https://storage.bunnycdn.com/your-zone/uploads/user123/abc123.jpg","fileName":"photo.jpg","fileSize":1048576,"fileSizeKB":"1024.00 KB","fileSizeMB":"1.00 MB","mimeType":"image/jpeg","userId":"user123","storagePath":"uploads/user123/abc123.jpg","storageZone":"your-zone","timestamp":"2025-01-26T12:00:00.004Z"}
```

### 4. Success Response
```
[2025-01-26T12:00:00.500Z] [INFO] Bunny Storage API - Upload successful {"operation":"UPLOAD_SUCCESS","bunnyUrl":"https://storage.bunnycdn.com/your-zone/uploads/user123/abc123.jpg","cdnUrl":"https://your-cdn.b-cdn.net/uploads/user123/abc123.jpg","httpStatus":201,"responseTime":"496ms","fileName":"photo.jpg","fileSize":1048576,"fileSizeKB":"1024.00 KB","fileSizeMB":"1.00 MB","userId":"user123","path":"uploads/user123/abc123.jpg","timestamp":"2025-01-26T12:00:00.500Z"}
[2025-01-26T12:00:00.501Z] [INFO] Image upload successful {"method":"POST","url":"/api/storage/upload","userId":"user123","result":{"url":"https://your-cdn.b-cdn.net/uploads/user123/abc123.jpg","path":"uploads/user123/abc123.jpg","size":1048576},"responseTime":"501ms","bunnyUrl":"https://your-cdn.b-cdn.net/uploads/user123/abc123.jpg","storagePath":"uploads/user123/abc123.jpg","timestamp":"2025-01-26T12:00:00.501Z"}
[2025-01-26T12:00:00.502Z] [INFO] Outgoing response {"method":"POST","url":"/api/storage/upload","userId":"user123","ip":"::1","userAgent":"Mozilla/5.0...","statusCode":200,"responseTime":"502ms","responseSize":150}
```

### 5. Error Response (if upload fails)
```
[2025-01-26T12:00:00.500Z] [ERROR] Bunny Storage API error {"operation":"UPLOAD","bunnyUrl":"https://storage.bunnycdn.com/your-zone/uploads/user123/abc123.jpg","httpStatus":403,"responseTime":"496ms","errorResponse":"Forbidden: Invalid API key","fileName":"photo.jpg","fileSize":1048576,"userId":"user123","path":"uploads/user123/abc123.jpg","timestamp":"2025-01-26T12:00:00.500Z","errorName":"Error","errorMessage":"Forbidden: Invalid API key"}
[2025-01-26T12:00:00.501Z] [ERROR] Image upload failed {"method":"POST","url":"/api/storage/upload","userId":"user123","responseTime":"501ms","fileName":"photo.jpg","fileSize":1048576,"timestamp":"2025-01-26T12:00:00.501Z","errorName":"AppError","errorMessage":"Bunny upload failed: Forbidden: Invalid API key"}
```

## Key Information Logged

### Request Information
- HTTP method and URL
- User ID (from auth)
- IP address
- User agent

### File Information
- Original filename
- MIME type
- File size (bytes, KB, MB)
- Generated storage path
- Custom path (if provided)

### Performance Metrics
- Response time for each operation
- Timestamp for each log entry

### Bunny CDN Details
- Storage zone name
- Full Bunny Storage URL
- Generated CDN URL
- HTTP status codes

## Monitoring Upload Issues

Look for these patterns in logs:

1. **Authentication Issues**: Check for 401 or 403 status codes
2. **Network Issues**: Look for "UPLOAD_NETWORK_ERROR" operations
3. **File Size Issues**: Monitor file sizes in MB to catch large uploads
4. **Performance Issues**: Check response times > 5000ms

## Example Log Queries

If you're using a log aggregation service, you can search for:

- All upload requests: `"operation":"UPLOAD"`
- Failed uploads: `"operation":"UPLOAD" AND "ERROR"`
- Large file uploads: `"fileSizeMB" > 5`
- Slow uploads: `"responseTime" > 3000`
- Specific user uploads: `"userId":"user123" AND "operation":"UPLOAD"`

## Development Tips

1. Set `LOG_LEVEL=DEBUG` during development to see all logs
2. Use `LOG_LEVEL=INFO` in production for key operations only
3. Monitor response times to identify performance bottlenecks
4. Check file sizes to ensure uploads are within expected limits
5. Use timestamps to correlate frontend and backend events
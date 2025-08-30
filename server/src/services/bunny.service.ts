import { randomUUID } from 'crypto'
import { AppError } from '../middleware/error.middleware'
import { logger } from '../utils/logger'

// Get Bunny configuration - called at runtime to ensure env vars are loaded
function getBunnyConfig(): { hostname: string; zone: string; apiKey: string; cdnUrl: string } {
  const config = {
    hostname: process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com',
    zone: process.env.BUNNY_STORAGE_ZONE_NAME,
    apiKey: process.env.BUNNY_STORAGE_API_KEY,
    cdnUrl: process.env.BUNNY_CDN_URL
  }
  
  if (!config.zone || !config.apiKey || !config.cdnUrl) {
    logger.error('Bunny Storage configuration missing', new Error('Missing environment variables'), {
      hasZone: !!config.zone,
      hasApiKey: !!config.apiKey,
      hasCdnUrl: !!config.cdnUrl,
      hostname: config.hostname
    })
    
    throw new AppError(
      'Bunny Storage configuration missing. Please check BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_API_KEY, and BUNNY_CDN_URL environment variables.',
      500,
      'BUNNY_CONFIG_ERROR'
    )
  }
  
  // Log configuration status (without exposing sensitive data)
  logger.debug('Bunny Storage configuration loaded', {
    hostname: config.hostname,
    zone: config.zone,
    cdnUrl: config.cdnUrl,
    apiKeyLength: config.apiKey.length
  })
  
  return config as { hostname: string; zone: string; apiKey: string; cdnUrl: string }
}

interface BunnyFile {
  name: string
  size: number
  lastModified: string
  isDirectory: boolean
  path: string
}

export async function uploadFile(
  file: Express.Multer.File,
  userId: string,
  customPath?: string
): Promise<{ url: string; path: string; size: number }> {
  const startTime = Date.now()
  const config = getBunnyConfig()
  
  // Always generate UUID filename
  const extension = file.originalname.split('.').pop() || 'bin'
  const uuidFilename = `${randomUUID()}.${extension}`
  
  // Generate full path
  let path: string
  if (customPath) {
    // Treat customPath as directory, append UUID filename
    const cleanPath = customPath.endsWith('/') ? customPath.slice(0, -1) : customPath
    path = `${cleanPath}/${uuidFilename}`
  } else {
    // Default path with userId
    path = `uploads/${userId}/${uuidFilename}`
  }

  const url = `https://${config.hostname}/${config.zone}/${path}`
  
  logger.info('Calling Bunny Storage API - Upload', {
    operation: 'UPLOAD',
    bunnyUrl: url,
    fileName: file.originalname,
    fileSize: file.size,
    fileSizeKB: (file.size / 1024).toFixed(2) + ' KB',
    fileSizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    mimeType: file.mimetype,
    userId,
    storagePath: path,
    storageZone: config.zone,
    hostname: config.hostname,
    hasApiKey: !!config.apiKey,
    apiKeyLength: config.apiKey?.length || 0,
    timestamp: new Date().toISOString()
  })

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': config.apiKey,
        'Content-Type': file.mimetype || 'application/octet-stream',
        'Content-Length': file.buffer.length.toString()
      },
      body: file.buffer
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      const error = await response.text()
      
      logger.error('Bunny Storage API error', new Error(error), {
        operation: 'UPLOAD',
        bunnyUrl: url,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseTime: `${responseTime}ms`,
        errorResponse: error,
        fileName: file.originalname,
        fileSize: file.size,
        userId,
        path,
        timestamp: new Date().toISOString()
      })
      
      throw new AppError(
        `Bunny upload failed: ${error}`,
        response.status,
        'BUNNY_UPLOAD_ERROR'
      )
    }

    const result = {
      id: uuidFilename.split('.')[0], // Extract UUID without extension
      url: `${config.cdnUrl}/${path}`,
      publicUrl: `${config.cdnUrl}/${path}`,
      path,
      size: file.size,
      filename: uuidFilename,
      mimeType: file.mimetype || 'application/octet-stream'
    }

    logger.info('Bunny Storage API - Upload successful', {
      operation: 'UPLOAD_SUCCESS',
      bunnyUrl: url,
      cdnUrl: result.url,
      httpStatus: response.status,
      responseTime: `${responseTime}ms`,
      fileName: file.originalname,
      fileSize: file.size,
      fileSizeKB: (file.size / 1024).toFixed(2) + ' KB',
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      userId,
      path,
      timestamp: new Date().toISOString()
    })

    return result
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    if (!(error instanceof AppError)) {
      logger.error('Bunny Storage API - Network error', error as Error, {
        operation: 'UPLOAD_NETWORK_ERROR',
        bunnyUrl: url,
        responseTime: `${responseTime}ms`,
        fileName: file.originalname,
        fileSize: file.size,
        userId,
        path,
        timestamp: new Date().toISOString()
      })
    }
    
    throw error
  }
}

export async function deleteFile(path: string): Promise<void> {
  const config = getBunnyConfig()
  const url = `https://${config.hostname}/${config.zone}/${path}`
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'AccessKey': config.apiKey,
    }
  })

  if (!response.ok && response.status !== 404) {
    const error = await response.text()
    throw new AppError(
      `Bunny delete failed: ${error}`,
      response.status,
      'BUNNY_DELETE_ERROR'
    )
  }
}

export async function listFiles(path?: string): Promise<BunnyFile[]> {
  const config = getBunnyConfig()
  const url = `https://${config.hostname}/${config.zone}/${path || ''}/`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'AccessKey': config.apiKey,
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new AppError(
      `Bunny list failed: ${error}`,
      response.status,
      'BUNNY_LIST_ERROR'
    )
  }

  interface BunnyApiFile {
    ObjectName: string
    Length: number
    LastChanged: string
    IsDirectory: boolean
  }
  
  const files = await response.json() as BunnyApiFile[]
  
  return files.map(file => ({
    name: file.ObjectName,
    size: file.Length,
    lastModified: file.LastChanged,
    isDirectory: file.IsDirectory,
    path: `${path || ''}/${file.ObjectName}`.replace(/^\//, '')
  }))
}
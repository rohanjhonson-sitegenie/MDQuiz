import { Router } from 'express'
import multer from 'multer'
import { authenticateRequest } from '../middleware/auth.middleware'
import { uploadFile, deleteFile, listFiles } from '../services/bunny.service'
import { AppError } from '../middleware/error.middleware'
import { logger } from '../utils/logger'

const router = Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError('Invalid file type. Only images are allowed', 400))
    }
  }
})

// Apply authentication to all storage routes
router.use(authenticateRequest)

/**
 * @swagger
 * /api/storage/upload:
 *   post:
 *     summary: Upload file to Bunny Storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 10MB)
 *               path:
 *                 type: string
 *                 description: Optional custom storage path
 *     responses:
 *       200:
 *         description: Upload successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid file or request
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  const startTime = Date.now()
  
  try {
    // Log incoming upload request
    logger.info('Image upload request received', {
      ...logger.getRequestContext(req),
      fileInfo: req.file ? {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        sizeKB: (req.file.size / 1024).toFixed(2) + ' KB',
        sizeMB: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
      } : null,
      customPath: req.body.path,
      timestamp: new Date().toISOString()
    })

    if (!req.file) {
      logger.warn('Upload attempt without file', logger.getRequestContext(req))
      throw new AppError('No file provided', 400, 'NO_FILE')
    }

    logger.debug('Processing file upload', {
      userId: req.userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    })

    const customPath = req.body.path as string | undefined
    
    // Log before calling Bunny API
    logger.info('Forwarding upload to Bunny CDN', {
      userId: req.userId,
      customPath,
      fileName: req.file.originalname,
      fileSize: req.file.size
    })

    const result = await uploadFile(req.file, req.userId!, customPath)
    
    const responseTime = Date.now() - startTime
    
    // Log successful upload
    logger.info('Image upload successful', {
      ...logger.getRequestContext(req),
      result,
      responseTime: `${responseTime}ms`,
      bunnyUrl: result.url,
      storagePath: result.path,
      timestamp: new Date().toISOString()
    })
    
    res.json(result)
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    logger.error('Image upload failed', error as Error, {
      ...logger.getRequestContext(req),
      responseTime: `${responseTime}ms`,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      timestamp: new Date().toISOString()
    })
    
    next(error)
  }
})

/**
 * @swagger
 * /api/storage/delete:
 *   delete:
 *     summary: Delete file from Bunny Storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *                 description: Storage path of file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete', async (req, res, next) => {
  try {
    const { path } = req.body
    
    if (!path || typeof path !== 'string') {
      throw new AppError('Path is required', 400, 'INVALID_PATH')
    }

    await deleteFile(path)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/storage/list:
 *   get:
 *     summary: List files in directory
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         description: Directory path to list (optional)
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       lastModified:
 *                         type: string
 *                       isDirectory:
 *                         type: boolean
 *                       path:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/list', async (req, res, next) => {
  try {
    const path = req.query.path as string | undefined
    const files = await listFiles(path)
    
    res.json({ files })
  } catch (error) {
    next(error)
  }
})

export default router
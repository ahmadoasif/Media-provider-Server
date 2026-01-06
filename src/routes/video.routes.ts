import express from 'express'
import { videosProvider } from '../controllers/videos.controller.js'
import { videoUpload } from '../controllers/videos.controller.js'
import { videoDownloadFromUrl } from '../controllers/videos.controller.js'
import { downloadProgress } from '../controllers/videos.controller.js'
import { getVideoInfo } from '../controllers/videos.controller.js'
import { upload } from '../controllers/videos.controller.js'
const router = express.Router()
router.get('/:userName', videosProvider)
router.post('/upload/:userName', upload.single('video'), videoUpload)
router.post('/download-url/:userName', videoDownloadFromUrl)
router.get('/download-progress/:downloadId', downloadProgress)
router.post('/video-info', getVideoInfo)

export default router

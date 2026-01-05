import express from 'express'
import { videosProvider } from '../controllers/videos.controller.js'
import { videoUpload } from '../controllers/videos.controller.js'
import { upload } from '../controllers/videos.controller.js'
const router = express.Router()
router.get('/:userName', videosProvider)
router.post('/upload/:userName', upload.single('video'), videoUpload)

export default router

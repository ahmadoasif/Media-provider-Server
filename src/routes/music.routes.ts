import express from 'express'
import { musicProvider, musicUpload, upload } from '../controllers/music.controller.js'

const router = express.Router()

router.get('/:userName', musicProvider)
router.post('/upload/:userName', upload.single('music'), musicUpload)

export default router

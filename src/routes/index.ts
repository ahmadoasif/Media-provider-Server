import express from 'express'
import picsRoutes from './pic.routes.js'
import videosRoutes from './video.routes.js'
import musicRoutes from './music.routes.js'
import filesRoutes from './files.routes.js'
const router = express.Router()
router.use(express.json())
router.use('/pics', picsRoutes)
router.use('/videos', videosRoutes)
router.use('/music', musicRoutes)
router.use('/files', filesRoutes)
export default router

import express from 'express'
import { picsProvider } from '../controllers/pics.controller.js'
const router = express.Router()
router.get('/:userName', picsProvider)

export default router

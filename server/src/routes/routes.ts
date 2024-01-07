import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.send('WebRTC Teleconferencing Server is running')
})

export default router

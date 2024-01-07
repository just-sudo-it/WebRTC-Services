import dotenv from 'dotenv'
import express, { type Application } from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

import chatController from './controllers/ChatController'
import fileController from './controllers/FileController'
import participantsController from './controllers/ParticipantsController'
import webRTCController from './controllers/WebRtcController'
import useMiddleware from './middleware/middleware'
import useRoutes from './routes/routes'
import { errorHandler } from './utils/ErrorHandlers'
import logger from './utils/Logger'

dotenv.config()

const app: Application = express()
const server = createServer(app)
const io = new SocketIOServer(server)
// io.attachApp(server)
const PORT = process.env.PORT ?? 3000

useMiddleware(app)
useRoutes(app)

app.set('view engine', 'ejs')

io.on('connection', (socket) => {
  logger.info(`New user connected: ${socket.id}`)

  webRTCController(socket, io)
  chatController(socket, io)
  fileController(socket, io)
  participantsController(socket, io)

  socket.on('disconnect', () => logger.info(`User disconnected: ${socket.id}`))
})

io.engine.on('connection_error', (err) => {
  console.log(err.req)
  console.log(err.code)
  console.log(err.message)
  console.log(err.context)
})

app.use(errorHandler)

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`))

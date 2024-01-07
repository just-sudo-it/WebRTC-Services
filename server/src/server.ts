import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Application, type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

import { v4 as uuidv4 } from 'uuid'
import chatController from './controllers/ChatController'
import fileController from './controllers/FileController'
import participantsController from './controllers/ParticipantsController'
import webRTCController from './controllers/WebRtcController'
import httpLogger from './utils/HttpLogger'
import logger from './utils/Logger'

dotenv.config()

const app: Application = express()
const server = createServer(app)
const io = new SocketIOServer(server)
const PORT = process.env.PORT ?? 3000

app.use(helmet())
app.use(cors())
app.use(httpLogger) // Integrating Morgan for HTTP logging
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', (req: Request, res: Response) => { res.redirect(`${uuidv4()}`) })

app.get('/:room', (req, res) => { res.render('room', { roomId: req.params.room }) })

io.on('connection', (socket) => {
  logger.info(`New user connected: ${socket.id}`)

  webRTCController(socket, io)
  chatController(socket, io)
  fileController(socket, io)
  participantsController(socket, io)

  socket.on('disconnect', () => logger.info(`User disconnected: ${socket.id}`))
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`)
  res.status(500).send('Internal Server Error')
})

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`))

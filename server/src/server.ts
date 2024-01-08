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
//const io = new SocketIOServer(server)
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
// io.attachApp(server)
const PORT = process.env.PORT ?? 5000

useMiddleware(app)
useRoutes(app)


io.on('connection', (socket:any) => {
  //socket.join('defaultRoom');


  logger.info(`New user connected: ${socket.id}`)
  socket.conn.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log("Upgraded to transport:", socket.conn.transport.name);  
  });
  
  webRTCController(socket, io)
  chatController(socket, io)
  fileController(socket, io)
  participantsController(socket, io)
})

io.engine.on('connection_error', (err: { req: any; code: any; message: any; context: any }) => 
  logger.info(err.req+ ' ' +err.code+ ' ' +err.message+ ' ' +err.context))

app.use(errorHandler)

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`))

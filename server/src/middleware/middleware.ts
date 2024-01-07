import cors from 'cors'
import express, { type Application } from 'express'
import helmet from 'helmet'
import httpLogger from '../utils/HttpLogger'

export default function useMiddleware (app: Application): void {
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? 'https://your-production-frontend-url.com'
      : '*'
  }

  app.use(helmet())
  app.use(cors(corsOptions))
  app.use(httpLogger)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static('public'))
}

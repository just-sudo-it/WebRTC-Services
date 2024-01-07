import { type NextFunction, type Request, type Response } from 'express'
import logger from './Logger'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`Error: ${err.message}`)
  res.status(500).send('Internal Server Error')
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).send('Resource not found')
}

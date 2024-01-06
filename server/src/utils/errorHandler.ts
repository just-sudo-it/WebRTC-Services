import { type NextFunction, type Request, type Response } from 'express'

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack)
  res.status(500)
    .send({ error: err.message === '' ? 'Internal Server Error' : err.message })
}

export default errorHandler

import { type Application, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

export default function useRoutes (app: Application): void {
  app.get('/', (req: Request, res: Response) => { res.redirect(`${uuidv4()}`) })

  app.get('/:room', (req, res) => { res.render('room', { roomId: req.params.room }) })
}

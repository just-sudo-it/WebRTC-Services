import morgan from 'morgan'
import logger from './Logger'

const httpLogger = morgan(
  'combined',
  { stream: { write: message => logger.info(message.trim()) } }
)

export default httpLogger

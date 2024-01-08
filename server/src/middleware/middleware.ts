import cors from 'cors';
import express, { type Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import httpLogger from '../utils/HttpLogger';

export default function useMiddleware(app: Application): void {
  const corsOptions = {
    origin: '*', 
  };

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later',
  });

  app.use(helmet()); 
  app.use(cors(corsOptions));
  app.use(limiter);
  app.use(httpLogger); 
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public')); // Ensure only public files are in this directory
}

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error';
import routes from './routes';
import swaggerDocs from './swagger';

// Load environment variables
config();

class App {
  public app: Application;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSwagger();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    // Request logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    }

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // API Routes
    this.app.use('/api', routes);

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Not Found' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDB();
      console.log('🛢️  Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    }
  }

  private initializeSwagger(): void {
    if (process.env.NODE_ENV !== 'production') {
      swaggerDocs(this.app, this.port);
    }
  }

  public listen(): void {
    const server = this.app.listen(this.port, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${this.port}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error(`❌ Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  }
}

export default App;

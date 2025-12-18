import express from 'express';
import http from 'http';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error';
import routes from './routes';

// Load environment variables
config();

// Initialize express
const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const port = parseInt(process.env.PORT || '5001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(port, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error(`Error: ${err.message}`);
  // Close the server and exit the process
  server.close(() => process.exit(1));
});

export { app, server };

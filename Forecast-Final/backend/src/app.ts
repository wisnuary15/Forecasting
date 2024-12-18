import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import forecastRoutes from './routes/forecastRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', forecastRoutes);

// Error Handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;

import { Router } from 'express';

const router = Router();

// Add your routes here
router.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

export default router;

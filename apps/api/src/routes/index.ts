import express from 'express';
import uploadRouter from './upload';
import extractRouter from './extract';
import invoicesRouter from './invoices';

const router = express.Router();

// Mount routes
router.use('/upload', uploadRouter);
router.use('/extract', extractRouter);
router.use('/invoices', invoicesRouter);

export default router;
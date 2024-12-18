import { Router } from 'express';
import multer from 'multer';
import { ForecastController } from '../controllers/forecastController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), ForecastController.uploadData);
router.get('/data', ForecastController.getAllData);
router.put('/data/:id', ForecastController.updateData);
router.delete('/data/:id', ForecastController.deleteData);
router.post('/forecast', ForecastController.forecast);
router.post('/data', ForecastController.createData);

export default router;
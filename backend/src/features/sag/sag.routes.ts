import { Router } from 'express';
import { 
    createSagController, 
    createSagAsyncController, 
    getSagCreationStatusController,
    getSagController, 
    getAllSagsController, 
    approveSagController, 
    rejectSagController ,
    overrideFailureSagController
} from './sag.controller';

const router = Router();

// Define routes
router.post('/create', createSagAsyncController);
router.get('/status/:jobId', getSagCreationStatusController);
router.post('/approval/approve', approveSagController);
router.post('/approval/reject', rejectSagController);
router.post('/override-failure', overrideFailureSagController);
router.get('/', getAllSagsController);
router.get('/:id', getSagController);

export default router;
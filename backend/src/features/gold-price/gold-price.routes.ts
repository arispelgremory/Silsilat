import express from 'express';
import {
    createGoldPriceController,
    getGoldPricesController,
    getGoldPriceByIdController,
    getLatestGoldPriceController,
    getYesterdayGoldPriceController,
    updateGoldPriceController,
    deleteGoldPriceController
} from './gold-price.controller';
import {
    fetchGoldPriceController,
    getGoldPriceQueueStatusController
} from './gold-price-scheduler.controller';

const goldPriceRoutes = express.Router();

// Gold price routes
goldPriceRoutes.post('/', createGoldPriceController);
goldPriceRoutes.get('/', getGoldPricesController);
goldPriceRoutes.get('/latest', getLatestGoldPriceController);
goldPriceRoutes.get('/yesterday', getYesterdayGoldPriceController);
goldPriceRoutes.get('/:id', getGoldPriceByIdController);
goldPriceRoutes.put('/:id', updateGoldPriceController);
goldPriceRoutes.delete('/:id', deleteGoldPriceController);

// Gold price scheduler routes
goldPriceRoutes.post('/fetch', fetchGoldPriceController);
goldPriceRoutes.get('/queue-status', getGoldPriceQueueStatusController);

export default goldPriceRoutes;

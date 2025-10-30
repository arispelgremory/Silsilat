import { Request, Response } from 'express';
import { 
    createGoldPrice, 
    getGoldPrices, 
    getGoldPriceById, 
    getLatestGoldPrice, 
    getYesterdayGoldPrice,
    updateGoldPrice, 
    deleteGoldPrice,
    goldPriceExistsForDate 
} from './gold-price.repository';
import { 
    GoldPriceSchema, 
    GoldPriceUpdateSchema, 
    GoldPriceQuerySchema,
    GoldPriceRequest,
    GoldPriceUpdateRequest,
    GoldPriceQuery 
} from './gold-price.model';

/**
 * Create a new gold price record
 * POST /api/v1/gold-price
 */
export const createGoldPriceController = async (req: Request, res: Response) => {
    try {
        const validatedData = GoldPriceSchema.parse(req.body);
        
        // Check if price already exists for this date
        const date = new Date(validatedData.date);
        const exists = await goldPriceExistsForDate(date);
        
        if (exists) {
            return res.status(409).json({
                success: false,
                error: 'Gold price already exists for this date'
            });
        }

        const goldPriceData = {
            ...validatedData,
            date: date,
            pricePerGramUsd: validatedData.pricePerGramUsd.toString(),
            pricePerGramMyr: validatedData.pricePerGramMyr.toString(),
            exchangeRate: validatedData.exchangeRate.toString()
        };

        const result = await createGoldPrice(goldPriceData);
        
        res.status(201).json({
            success: true,
            data: result[0],
            message: 'Gold price created successfully'
        });
    } catch (error) {
        console.error('Error creating gold price:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create gold price'
        });
    }
};

/**
 * Get gold prices with filtering and pagination
 * GET /api/v1/gold-price
 */
export const getGoldPricesController = async (req: Request, res: Response) => {
    try {
        const validatedQuery = GoldPriceQuerySchema.parse(req.query);
        
        const result = await getGoldPrices(validatedQuery);
        
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
            message: 'Gold prices retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting gold prices:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get gold prices'
        });
    }
};

/**
 * Get gold price by ID
 * GET /api/v1/gold-price/:id
 */
export const getGoldPriceByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Gold price ID is required'
            });
        }

        const result = await getGoldPriceById(id);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Gold price not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result[0],
            message: 'Gold price retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting gold price by ID:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get gold price'
        });
    }
};

/**
 * Get latest gold price
 * GET /api/v1/gold-price/latest
 */
export const getLatestGoldPriceController = async (req: Request, res: Response) => {
    try {
        const result = await getLatestGoldPrice();
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No gold price found'
            });
        }

        res.status(200).json({
            success: true,
            data: result[0],
            message: 'Latest gold price retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting latest gold price:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get latest gold price'
        });
    }
};

/**
 * Get yesterday's gold price
 * GET /api/v1/gold-price/yesterday
 */
export const getYesterdayGoldPriceController = async (req: Request, res: Response) => {
    try {
        const result = await getYesterdayGoldPrice();
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No gold price found for yesterday'
            });
        }

        res.status(200).json({
            success: true,
            data: result[0],
            message: 'Yesterday\'s gold price retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting yesterday\'s gold price:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get yesterday\'s gold price'
        });
    }
};

/**
 * Update gold price by ID
 * PUT /api/v1/gold-price/:id
 */
export const updateGoldPriceController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = GoldPriceUpdateSchema.parse(req.body);
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Gold price ID is required'
            });
        }

        const updateData = {
            ...validatedData,
            pricePerGramUsd: validatedData.pricePerGramUsd?.toString(),
            pricePerGramMyr: validatedData.pricePerGramMyr?.toString(),
            exchangeRate: validatedData.exchangeRate?.toString()
        };
        
        const result = await updateGoldPrice(id, updateData);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Gold price not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result[0],
            message: 'Gold price updated successfully'
        });
    } catch (error) {
        console.error('Error updating gold price:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update gold price'
        });
    }
};

/**
 * Delete gold price by ID
 * DELETE /api/v1/gold-price/:id
 */
export const deleteGoldPriceController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Gold price ID is required'
            });
        }

        const result = await deleteGoldPrice(id);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Gold price not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result[0],
            message: 'Gold price deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting gold price:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete gold price'
        });
    }
};

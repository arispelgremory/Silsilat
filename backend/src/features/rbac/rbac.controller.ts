// Types
import { Request, Response } from 'express';

export const getAllUserAccess = async (req: Request, res: Response): Promise<void> => {
  try {
      // const userAccess = await req.context.models.UserAccess.findAll({
      //     where: {
      //         userId: req.context.user.id
      //     }
      // });

    res.status(200).json({
        success: true,
        data: []
    });
  } catch (error) {
    res.status(500).json({
        error: 'Something went wrong'
    });
  }
};
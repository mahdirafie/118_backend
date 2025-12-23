import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../common/token.service.js';

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'دسترسی غیرمجاز. توکن ارسال نشده است. لطفا از حساب کاربری خارج شده و دوباره وارد شوید!',
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyAccessToken(token);

        // Attach payload to request
        req.info = decoded as any;

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'دسترسی غیرمجاز. توکن نامعتبر یا منقضی شده است.',
        });
    }
};

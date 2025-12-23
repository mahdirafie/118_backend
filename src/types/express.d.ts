import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            info?: JwtPayload & {
                uid: number;
                type: 'employee' | 'general';
                emp_id: number | null;
            };
        }
    }
}

"use strict";
// import { Request, Response, NextFunction } from 'express';
// import admin from '@/config/firebase';
// import { FIREBASE_SERVICE_ACCOUNT } from '@/config/env';
// interface DecodedToken {
//   uid: string;
//   email?: string;
//   role?: string;
// }
// const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith('Bearer ')) {
//     res.status(401).json({ error: 'Unauthorized' });
//     return;
//   }
//   const token = authHeader.split(' ')[1];
//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     req.user = {
//       uid: decodedToken.uid,
//       email: decodedToken.email || '',
//       role: decodedToken.role || 'user'
//     };
//     next();
//   } catch (error: any) {
//     console.error('Token verification error:', error);
//     res.status(403).json({ error: 'Forbidden' });
//   }
// };
// export default authenticate;

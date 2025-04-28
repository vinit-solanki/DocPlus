const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

     const requireAuth = ClerkExpressRequireAuth({
       clerkSecretKey: process.env.CLERK_SECRET_KEY,
     });

     module.exports = {
       requireAuth: (req, res, next) => {
         console.log('Authenticating request with Authorization header:', req.headers.authorization);
         requireAuth(req, res, (error) => {
           if (error) {
             console.error('Authentication error:', error.message, error.stack);
             return res.status(401).json({ message: 'Unauthenticated', error: error.message });
           }
           next();
         });
       },
     };
import { UnauthorizedError, ForbiddenError } from '../utils/customErrors.js';

// Rate limiting middleware for comments and public endpoints
const rateLimiter = (limit, windowMs) => {
  const requests = new Map();

  return (req, res, next) => {
    try {
      const ip = req.ip;
      const now = Date.now();

      // Clean old requests
      if (requests.has(ip)) {
        const userRequests = requests.get(ip);
        const validRequests = userRequests.filter(
          (timestamp) => now - timestamp < windowMs
        );

        if (validRequests.length >= limit) {
          throw new UnauthorizedError('Rate limit exceeded');
        }

        requests.set(ip, [...validRequests, now]);
      } else {
        requests.set(ip, [now]);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { rateLimiter };

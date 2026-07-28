import { httpRequestDuration } from '../utils/metrics.js';

/**
 * Prometheus HTTP request duration middleware.
 * Instruments every request with method, path pattern, and status code labels.
 */
export const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    // Normalize dynamic paths to avoid cardinality explosion in Prometheus
    const route = req.route?.path || req.path.replace(/\/\d+/g, '/:id');
    end({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });

  next();
};

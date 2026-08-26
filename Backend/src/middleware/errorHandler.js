export const errorHandler = (err, req, res, next) => {
  const isCorsError = err.message === 'Not allowed by CORS';
  const status = isCorsError ? 403 : (err.status || err.statusCode || 500);
  const isProduction = process.env.NODE_ENV === 'production';

  const message =
    isProduction && status === 500
      ? 'Internal Server Error'
      : (err.message || 'Internal Server Error');

  const errorResponse = {
    success: false,
    error: message,
    status,
  };

  // Only include stack traces in non-production environments
  if (!isProduction && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(status).json(errorResponse);
};

export default errorHandler;

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}`;
    statusCode = 400;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;

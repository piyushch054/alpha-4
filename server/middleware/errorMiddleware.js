const errorMiddleware = (err, req, res, next) => {
    let message = err.message || 'Server Error';
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    if (err.name === 'CastError') {
        message = 'Resource not found or invalid ID';
        statusCode = 404;
    }
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    res.status(statusCode).json({ success: false, message });
};
module.exports = errorMiddleware;
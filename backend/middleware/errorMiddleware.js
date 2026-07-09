const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors;

    // Handle Mongo duplicate key error (e.g. unique username/email index violation)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = field ? `${field.charAt(0).toUpperCase() + field.slice(1)} already in use` : "Duplicate field value entered";
    }

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
        errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};

module.exports = errorHandler;

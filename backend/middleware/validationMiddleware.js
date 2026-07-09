const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Validation result error handler
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors
        });
    }
    next();
};

// Validation rules
const usernameRules = body("username")
    .trim()
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must contain only alphanumeric characters and underscores")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters");

const emailRules = body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail();

const passwordRules = body("password")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters");

const postContentRules = body("content")
    .trim()
    .notEmpty()
    .withMessage("Post content is required")
    .isLength({ max: 500 })
    .withMessage("Post content cannot exceed 500 characters");

const idParamRules = param("id")
    .trim()
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid ID format");

const receiverIdParamRules = param("receiverId")
    .trim()
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid receiver ID format");

module.exports = {
    validateSignup: [usernameRules, emailRules, passwordRules, validateRequest],
    validateLogin: [emailRules, passwordRules, validateRequest],
    validateCreatePost: [postContentRules, validateRequest],
    validateIdParam: [idParamRules, validateRequest],
    validateReceiverIdParam: [receiverIdParamRules, validateRequest]
};

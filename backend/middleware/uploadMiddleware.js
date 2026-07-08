const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, and PNG files are allowed."), false);
        }
    }
});

const uploadSingle = (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
        if (err) {
            let message = err.message;
            if (err.code === "LIMIT_FILE_SIZE") {
                message = "File size must be less than 5 MB.";
            }
            return res.status(400).json({
                message
            });
        }
        next();
    });
};

module.exports = {
    uploadSingle
};

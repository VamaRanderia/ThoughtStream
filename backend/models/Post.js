const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
{
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 500
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},
{
    timestamps: true
});

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);

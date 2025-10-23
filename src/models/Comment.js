// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const CommentSchema = new Schema({
//   text: { type: String, required: true, trim: true },
//   author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   authorName: { type: String }, // denormalized for quick ui display
//   parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
//   likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],     // users who liked
//   dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],  // users who disliked
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// CommentSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('Comment', CommentSchema);


const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorName: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null means it's a top-level comment
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);


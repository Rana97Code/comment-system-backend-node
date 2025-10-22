const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  text: { type: String, required: true, trim: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String }, // denormalized for quick ui display
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],     // users who liked
  dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],  // users who disliked
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CommentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);

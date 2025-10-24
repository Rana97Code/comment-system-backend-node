const contentService = require("../services/contentService");
const Content = require("../models/Content");
const mongoose = require("mongoose");

async function createContent(req, res, next) {
  try {
    const { title, slug, body } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const content = await contentService.createContent({ title, slug, body, image });
    res.status(201).json({ message: "Content created successfully", content });
  } catch (err) {
    next(err);
  }
}

async function getAllContent(req, res, next) {
  try {
    const contents = await contentService.getAllContent();
    res.json(contents);
  } catch (err) {
    next(err);
  }
}

async function getContentById(req, res, next) {
  try {
    const content = await contentService.getContentById(req.params.id);
    res.json(content);
  } catch (err) {
    next(err);
  }
}

async function updateContent(req, res, next) {
  try {
    const { title, slug, body } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updated = await contentService.updateContent(req.params.id, { title, slug, body, image });
    res.json({ message: "Content updated successfully", updated });
  } catch (err) {
    next(err);
  }
}

async function deleteContent(req, res, next) {
  try {
    await contentService.deleteContent(req.params.id);
    res.json({ message: "Content deleted successfully" });
  } catch (err) {
    next(err);
  }
}



// 👍 Like a content
async function likeContent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Ensure arrays exist and are clean
    content.likes = (content.likes || []).filter(Boolean);
    content.dislikes = (content.dislikes || []).filter(Boolean);

    const hasLiked = content.likes.some(
      (u) => u && u.toString() === userId
    );
    const hasDisliked = content.dislikes.some(
      (u) => u && u.toString() === userId
    );

    if (hasLiked) {
      // Remove like
      content.likes = content.likes.filter(
        (u) => u && u.toString() !== userId
      );
    } else {
      // Add like
      content.likes.push(new mongoose.Types.ObjectId(userId));
      // Remove dislike if exists
      if (hasDisliked) {
        content.dislikes = content.dislikes.filter(
          (u) => u && u.toString() !== userId
        );
      }
    }

    await content.save();

    res.json({
      message: hasLiked ? "Like removed" : "Liked successfully",
      likesCount: content.likes.length,
      dislikesCount: content.dislikes.length,
    });
  } catch (error) {
    console.error("Error liking content:", error);
    res.status(500).json({ message: error.message });
  }
};
// 👎 Dislike a content
async function dislikeContent(req, res) {
   try {
    const { id } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    content.likes = (content.likes || []).filter(Boolean);
    content.dislikes = (content.dislikes || []).filter(Boolean);

    const hasLiked = content.likes.some(
      (u) => u && u.toString() === userId
    );
    const hasDisliked = content.dislikes.some(
      (u) => u && u.toString() === userId
    );

    if (hasDisliked) {
      content.dislikes = content.dislikes.filter(
        (u) => u && u.toString() !== userId
      );
    } else {
      content.dislikes.push(new mongoose.Types.ObjectId(userId));
      if (hasLiked) {
        content.likes = content.likes.filter(
          (u) => u && u.toString() !== userId
        );
      }
    }

    await content.save();

    res.json({
      message: hasDisliked ? "Dislike removed" : "Disliked successfully",
      likesCount: content.likes.length,
      dislikesCount: content.dislikes.length,
    });
  } catch (error) {
    console.error("Error disliking content:", error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
  likeContent,
  dislikeContent,
};

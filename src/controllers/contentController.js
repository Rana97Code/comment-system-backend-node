const contentService = require("../services/contentService");

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

module.exports = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
};

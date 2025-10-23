const contentDao = require("../dao/contentDao");

async function createContent({ title, slug, body, image }) {
  if (!title || !slug) throw { status: 400, message: "Title and slug are required" };

  const existing = await contentDao.getAllContent();
  if (existing.some((c) => c.slug === slug))
    throw { status: 400, message: "Slug already exists" };

  return await contentDao.createContent({ title, slug, body, image });
}

async function getAllContent() {
  return await contentDao.getAllContent();
}

async function getContentById(id) {
  const content = await contentDao.getContentById(id);
  if (!content) throw { status: 404, message: "Content not found" };
  return content;
}

async function updateContent(id, data) {
  const updated = await contentDao.updateContent(id, data);
  if (!updated) throw { status: 404, message: "Content not found" };
  return updated;
}

async function deleteContent(id) {
  const deleted = await contentDao.deleteContent(id);
  if (!deleted) throw { status: 404, message: "Content not found" };
  return deleted;
}

module.exports = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
};

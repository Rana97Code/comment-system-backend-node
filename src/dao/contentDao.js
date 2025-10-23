const Content = require("../models/Content");

async function createContent(data) {
  return await Content.create(data);
}

async function getAllContent() {
  return await Content.find().sort({ createdAt: -1 });
}

async function getContentById(id) {
  return await Content.findById(id);
}

async function updateContent(id, data) {
  return await Content.findByIdAndUpdate(id, data, { new: true });
}

async function deleteContent(id) {
  return await Content.findByIdAndDelete(id);
}

module.exports = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
};

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const contentController = require("../controllers/contentController");

const uploadDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});
const upload = multer({ storage });

// CRUD
router.post("/", upload.single("image"), contentController.createContent);
router.get("/", contentController.getAllContent);
router.get("/:id", contentController.getContentById);
router.put("/:id", upload.single("image"), contentController.updateContent);
router.delete("/:id", contentController.deleteContent);

module.exports = router;

const { Router } = require("express");
const { upload } = require("../configs/multer");

// Controllers
const FileController = require("../apps/controllers/FileController");

const router = Router();

router.post("/upload", upload.single('file'), FileController.upload);

module.exports = router;
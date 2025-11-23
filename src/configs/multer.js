const multer = require('multer');
const {v4} = require ('uuid');

const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
];

const upload = multer ({
    storage: multer.diskStorage ({
        destination: 'uploads/',
        filename: (req, file, cb) => {
            const filename = `${v4()}-${file.originalname}`;
            return cb (null, filename);

        },
    }),
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Tipo de arquivo não permitido. Envie PDF ou imagem."));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = { upload };


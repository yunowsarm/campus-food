const path = require('path');
const fs = require('fs');
const multer = require('multer');

// 项目根目录下的 uploadFiles（与 app.js 中静态目录一致）
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploadFiles');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext) || 'file';
    const safe = base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
    if (allowed.test(file.originalname) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片格式'));
    }
  },
});

/** 单文件上传 */
const uploadSingle = (req, res, next) => {
  const single = upload.single('file');
  single(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ code: 400, message: '未选择文件' });
    const url = `/uploadFiles/${req.file.filename}`;
    res.json({ code: 0, data: { url, filename: req.file.filename } });
  });
};

/** 多文件上传 */
const uploadMultiple = (req, res, next) => {
  const multi = upload.array('files', 9);
  multi(req, res, (err) => {
    if (err) return next(err);
    if (!req.files?.length) return res.status(400).json({ code: 400, message: '未选择文件' });
    const files = req.files.map((f) => ({ url: `/uploadFiles/${f.filename}`, filename: f.filename }));
    res.json({ code: 0, data: { files } });
  });
};

module.exports = { uploadSingle, uploadMultiple };

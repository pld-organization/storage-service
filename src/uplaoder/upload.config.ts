import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const uploadDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      cb(
        null,
        file.fieldname +
          '-' +
          uniqueSuffix +
          path.extname(file.originalname),
      );
    },
  }),
  limits: { fileSize: 314572800 }, // 300 MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // NIfTI (.nii, .nii.gz)
      'application/octet-stream',
      'application/gzip',
      'application/x-gzip',
      'image/gz',
      // RAR archives
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/rar',
    ];

    const allowedExtensions = ['.nii', '.nii.gz', '.rar'];
    const originalName: string = file.originalname || '';
    const matchedByExtension = allowedExtensions.some((ext) =>
      originalName.toLowerCase().endsWith(ext),
    );

    if (allowedMimeTypes.includes(file.mimetype) || matchedByExtension) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Type de fichier non supporté. Seuls PDF, JPEG, PNG, DOC, NIfTI (.nii, .nii.gz) et RAR sont autorisés.',
        ),
        false,
      );
    }
  },
};

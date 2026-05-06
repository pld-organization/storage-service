import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    },
  }),
  limits: {
    // 300MB: 300 * 1024 * 1024 bytes
    fileSize: 314572800,
    fieldSize: 104857600,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'application/json',
      // NIfTI formats (.nii and .nii.gz)
      'application/octet-stream',
      'application/gzip',
      'application/x-gzip',
      'image/gz',
      // RAR archives
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/rar',
    ];

    // for unknown types, so we also allow by extension explicitly.
    const allowedExtensions = [
      '.nii',
      '.nii.gz',
      '.rar',
    ];

    const originalName: string = file.originalname || '';
    const matchedByExtension = allowedExtensions.some((ext) =>
      originalName.toLowerCase().endsWith(ext),
    );

    if (allowedMimeTypes.includes(file.mimetype) || matchedByExtension) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Type de fichier non supporté. Seuls PDF, JPEG, PNG, DOC, ZIP, JSON, NIfTI (.nii, .nii.gz) et RAR sont autorisés.',
        ),
        false,
      );
    }
  },
};

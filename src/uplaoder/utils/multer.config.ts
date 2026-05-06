import { GridFsStorage } from 'multer-gridfs-storage';
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

// ─── General files (scans, NIfTI, ZIP, JSON, etc.) ──────────────────────────
export const multerConfig = {
  storage: new GridFsStorage({
    url: process.env.MONGODB_URI ?? (() => { throw new Error('MONGODB_URI is not defined') })(),
    file: (req, file) => {
      return new Promise((resolve) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        resolve({
          filename,
          bucketName: 'uploads',
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date(),
            mimetype: file.mimetype,
          },
        });
      });
    },
  }),
  limits: {
    fileSize: 314572800,   // 300MB
    fieldSize: 104857600,  // 100MB
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
      'application/octet-stream',
      'application/gzip',
      'application/x-gzip',
      'image/gz',
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
        new BadRequestException(
          'Type de fichier non supporté. Seuls PDF, JPEG, PNG, DOC, ZIP, JSON, NIfTI (.nii, .nii.gz) et RAR sont autorisés.',
        ),
        false,
      );
    }
  },
};

// ─── Patient medical files (PDF, images, DOCX) ──────────────────────────────
export const getMulterMedicalConfig = () => ({
  storage: new GridFsStorage({
    url: process.env.MONGODB_URI ?? (() => { throw new Error('MONGODB_URI is not defined') })(),
    file: (req, file) => {
      return new Promise((resolve) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = 'medical-' + uniqueSuffix + path.extname(file.originalname);
        resolve({
          filename,
          bucketName: 'medical-files',
          metadata: {
            originalName: file.originalname,
            patientId: req.body.patientId,
            fileType: req.body.fileType || 'general',
            description: req.body.description || null,
            uploadedAt: new Date(),
            mimetype: file.mimetype,
          },
        });
      });
    },
  }),
  limits: {
    fileSize: 20971520, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Type de fichier non supporté. Seuls PDF, JPEG, PNG, WEBP, TIFF et DOC/DOCX sont autorisés pour les fichiers médicaux.',
        ),
        false,
      );
    }
  },
});

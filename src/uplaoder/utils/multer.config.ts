import { Multer } from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

// Configuration GridFS
export const multerConfig = {
  storage: new GridFsStorage({
    url: process.env.MONGO_URI, // Utilise ta variable d'environnement MongoDB
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        
        resolve({
          filename: filename,
          bucketName: 'uploads', // Nom du bucket GridFS
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
    fileSize: 314572800, // 300MB
    fieldSize: 104857600,
  },
  fileFilter: (req, file, cb) => {
    // ... garde ton fileFilter existant
  },
};

export const multerMedicalConfig = {
  storage: new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const uniqueSuffix = Date.now() '-' + Math.round(Math.random() * 1e9);
        const filename = 'medical-' + uniqueSuffix + path.extname(file.originalname);
        
        resolve({
          filename: filename,
          bucketName: 'medical-files', // Bucket dédié pour les fichiers médicaux
          metadata: {
            originalName: file.originalname,
            patientId: req.body.patientId,
            fileType: req.body.fileType || 'general',
            description: req.body.description || null,
            uploadedAt: new Date(),
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

export const multerMedicalConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, medicalUploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    },
  }),
  limits: {
    // 20MB per file for medical documents/images
    fileSize: 20971520,
    fieldSize: 104857600,
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
};

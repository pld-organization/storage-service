import { Injectable, Inject ,BadRequestException} from '@nestjs/common';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Db , ObjectId} from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';  
import { Response } from 'express';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { existsSync } from 'fs';
Injectable()
export class UploadService {
  constructor(@Inject('MONGO_DB') private db: Db) {}
  
  async uploadFile(
  file: Express.Multer.File,
  data: Record<string, any>,
) {
  const fileData = {
    ...data,                                      
    prediction: data.prediction
      ? (typeof data.prediction === 'string'
      ? JSON.parse(data.prediction)
      : data.prediction)
  : null,
    originalName: file.originalname,
    filename:     file.filename,
    size:         file.size,
    mimetype:     file.mimetype,
    path:         file.path,
    uploadedAt:   new Date(),
  };

  await this.db.collection('uploads').insertOne(fileData);
  return fileData;
}

 async getFilesByPatientAndType(
   patientId: string,
   predictionType: string, // e.g., '3D'
 ): Promise<any[]> {
   return this.db
     .collection('uploads')
     .find({
       patientId: patientId,
       'prediction.type': predictionType, // Use dot notation here
     })
     .sort({ uploadedAt: -1 })
     .toArray();
 }
  
  async getFilesByPatient(patientId: string): Promise<any[]> {
    return this.db
      .collection('uploads')
      .find({ patientId })
      .sort({ uploadedAt: -1 })
      .toArray();
  }



  async getFileByName(filename: string): Promise<any | null> {
    // 1. Fetch the metadata from MongoDB
    const fileRecord = await this.db
      .collection('uploads')
      .findOne({ filename });
  
    if (!fileRecord) return null;
  
    // 2. Read the physical mesh file from the disk
    // We use the 'path' property already stored in your DB document
    try {
      if (fileRecord.path && fs.existsSync(fileRecord.path)) {
        const rawData = fs.readFileSync(fileRecord.path, 'utf-8');
        
        // 3. Return a single object containing both DB info and Mesh data
        return {
          ...fileRecord,
          meshData: JSON.parse(rawData) 
        };
      }
      return fileRecord; // Return record without mesh if file is missing on disk
    } catch (error) {
      console.error("Error reading mesh file:", error);
      return fileRecord; 
    }
  }

  async getmesh(meshFilename: string): Promise<any> {
    // 1. Use the NATIVE db you already have (no Mongoose needed)
    const fileRecord = await this.db.collection('uploads').findOne({ meshFilename });
  
    if (!fileRecord) {
      throw new NotFoundException('Mesh record not found in database');
    }
  
    // 2. Read the file directly using standard fs
    try {
      if (fileRecord.meshPath && fs.existsSync(fileRecord.meshPath)) {
        const rawData = fs.readFileSync(fileRecord.meshPath, 'utf-8');
        
        // 3. Return the parsed JSON directly to the frontend
        return JSON.parse(rawData);
      }
      throw new Error('File missing on disk');
    } catch (error) {
      console.error("Fetch error:", error.message);
      throw new InternalServerErrorException("Could not read mesh file");
    }
  }

  async getFilesByPatientAndTypePaginated(
    patientId: string,
    type: string,
    page = 1,
    limit = 10,
  ) {
    return this.db
      .collection('uploads')
      .find({ patientId, type })
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
  }

  async getFilesByDoctorAndType(
    doctorId: string,
    type: string,
  ): Promise<any[]> {
    return this.db
      .collection('uploads')
      .find({
        doctorId,
        type,
      })
      .sort({ uploadedAt: -1 }) // newest first
      .toArray();
  }
 
  
  async getFilesByDoctor(doctorId: string): Promise<any[]> {
    return this.db
      .collection('uploads')
      .find({ doctorId })
      .sort({ uploadedAt: -1 })
      .toArray();
  }
  async getDoctorFilesForPatient(
    doctorId: string,
    patientId: string,
  ): Promise<any[]> {
    return this.db
      .collection('uploads')
      .find({
        doctorId,
        patientId,
      })
      .sort({ uploadedAt: -1 })
      .toArray();
  }
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    data: Record<string, any>,
  ) {
    // 1. Parse the prediction data (just like your uploadFile method)
    const predictionData = data.prediction
      ? (typeof data.prediction === 'string'
        ? JSON.parse(data.prediction)
        : data.prediction)
      : null;
  
    // 2. Identify which file is which.
    // NIfTI (.nii, .nii.gz), ZIP, and RAR files are treated as the scan.
    // JSON files are the 3D mesh output.
    const NIFTI_MIME_TYPES = [
      'application/octet-stream',
      'application/gzip',
      'application/x-gzip',
      'image/gz',
    ];
    const RAR_MIME_TYPES = [
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/rar',
    ];
    const SCAN_MIME_TYPES = [
      'application/zip',
      'application/x-zip-compressed',
      ...NIFTI_MIME_TYPES,
      ...RAR_MIME_TYPES,
    ];

    const isScanFile = (f: Express.Multer.File): boolean => {
      if (f.mimetype === 'application/json') return false;
      if (SCAN_MIME_TYPES.includes(f.mimetype)) return true;
      // Extension-based detection for NIfTI files
      const name = (f.originalname || '').toLowerCase();
      return name.endsWith('.nii') || name.endsWith('.nii.gz') || name.endsWith('.rar');
    };

    const scanFile = files.find((f) => isScanFile(f));
    const meshFile = files.find((f) => f.mimetype === 'application/json');
  
    if (!scanFile) {
      throw new BadRequestException('Main scan file is missing');
    }
  
    // 3. Create ONE combined record
    const combinedData = {
      ...data,
      prediction: predictionData,
      
      // Scan File Info
      originalName: scanFile.originalname,
      filename:     scanFile.filename,
      size:         scanFile.size,
      mimetype:     scanFile.mimetype,
      path:         scanFile.path,
      
      meshFilename: meshFile ? meshFile.filename : null,
      meshPath:     meshFile ? meshFile.path : null,
      meshSize:     meshFile ? meshFile.size : null,
      
      uploadedAt:   new Date(),
    };

    const result = await this.db.collection('uploads').insertOne(combinedData);
  
    return {
      _id: result.insertedId,
      ...combinedData
    };
  }

  async downloadFileContent(filename: string, res: Response) {
    try {
      // Cherche le fichier dans la collection patient_medical_files
      let fileMetadata = await this.db
        .collection('patient_medical_files')
        .findOne({ filename });
    
      if (!fileMetadata) {
        fileMetadata = await this.db
          .collection('uploads')
          .findOne({ filename });
      }
    
      if (!fileMetadata) {
        throw new NotFoundException('Fichier non trouvé');
      }
    
      const filePath = fileMetadata.path;
      
      if (!filePath || !fs.existsSync(filePath)) {
        throw new NotFoundException('Fichier physique non trouvé');
      }
    
      const originalName = fileMetadata.originalName || filename;
      const mimeType = fileMetadata.mimetype || 'application/octet-stream';
    
      // Envoie le fichier binaire
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
    
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    
    } catch (error) {
      console.error('Download error:', error);
      throw new BadRequestException('Erreur lors du téléchargement');
    }
  }

  
  async uploadPatientMedicalFiles(
    files: Express.Multer.File[],
    data: Record<string, any>,
  ): Promise<any[]> {
    if (!data.patientId) {
      throw new BadRequestException('patientId est requis');
    }

    const records = files.map((file) => ({
      patientId: data.patientId,
      fileType: data.fileType || 'general',     
      description: data.description || null,
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      uploadedAt: new Date(),
    }));

    await this.db.collection('patient_medical_files').insertMany(records);
    return records;
  }

  async getPatientMedicalFiles(
    patientId: string,
    fileType?: string,
  ): Promise<any[]> {
    const query: Record<string, any> = { patientId };
    if (fileType) query.fileType = fileType;

    const files = await this.db
      .collection('patient_medical_files')
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray();
  
    // Retourne les fichiers avec l'ID
    return files.map(file => ({
      _id: file._id,
      originalName: file.originalName,
      filename: file.filename,
      fileType: file.fileType,
      description: file.description,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: file.uploadedAt,
      patientId: file.patientId,
    }));
  }
}

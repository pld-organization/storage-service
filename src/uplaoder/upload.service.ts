import { Injectable, Inject } from '@nestjs/common';
import { Db } from 'mongodb';

@Injectable()
export class UploadService {
  constructor(@Inject('MONGO_DB') private db: Db) {}

  async uploadFile(
    file: Express.Multer.File,
    data: {
      doctorId: string;
      patientId: string;
      fileType: string;
    },
  ): Promise<{
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
    path: string;
    patientId: string;
    doctorId?: string;
    type: string;
    uploadedAt: Date;
  }> {
    const fileData = {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      patientId: data.patientId,
      doctorId: data.doctorId,
      type: data.fileType,
      uploadedAt: new Date(),
    };

    // Save metadata to MongoDB
    await this.db.collection('uploads').insertOne(fileData);

    // Return the complete data
    return fileData;
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    data: {
      doctorId: string;
      patientId: string;
      fileType: string;
    },
  ): Promise<
    {
      originalName: string;
      filename: string;
      size: number;
      mimetype: string;
      path: string;
      patientId: string;
      doctorId?: string;
      type: string;
      uploadedAt: Date;
    }[]
  > {
    // BUG FIX 1: Map each file to its own metadata object with correct file properties
    const filesData = files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      patientId: data.patientId,
      doctorId: data.doctorId,
      type: data.fileType,
      uploadedAt: new Date(),
    }));

    // BUG FIX 2: Pass the array to insertMany, not a single object
    if (filesData.length > 0) {
      await this.db.collection('uploads').insertMany(filesData);
    }

    return filesData;
  }
}
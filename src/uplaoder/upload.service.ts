import { Injectable, Inject } from '@nestjs/common';
import { Db , ObjectId} from 'mongodb';


@Injectable()
export class UploadService {
  constructor(@Inject('MONGO_DB') private db: Db) {}

  async uploadFile(
  file: Express.Multer.File,
  data: Record<string, any>,
) {
  const fileData = {
    ...data,                                          // everything from the form
    prediction: data.prediction
      ? JSON.parse(data.prediction)                  // string → real object
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
    type: string,
  ): Promise<any[]> {
    return this.db
      .collection('uploads')
      .find({
        patientId,
        type,
      })
      .sort({ uploadedAt: -1 }) // newest first
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
    return this.db
      .collection('uploads')
      .findOne({ filename });
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
import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { multerConfig, multerMedicalConfig } from './utils/multer.config';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}



  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.uploadService.uploadFile(file, data);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: any, // Use 'any' or a proper DTO that includes 'prediction'
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // This now passes the 'data' containing your prediction string
    return this.uploadService.uploadMultipleFiles(files, data);
  }



  
  @Get('patient/:patientId')
  async getFilesByPatient(@Param('patientId') patientId: string) {
    return this.uploadService.getFilesByPatient(patientId);
  }

  
  @Get('patient/:patientId/type/:type')
  async getFilesByPatientAndType(
    @Param('patientId') patientId: string,
    @Param('type') predictionType: string,
  ) {
    return this.uploadService.getFilesByPatientAndType(patientId, predictionType);
  }



  
  @Get('doctor/:doctorId')
  async getFilesByDoctor(@Param('doctorId') doctorId: string) {
    return this.uploadService.getFilesByDoctor(doctorId);
  }

  
  @Get('doctor/:doctorId/type/:type')
  async getFilesByDoctorAndType(
    @Param('doctorId') doctorId: string,
    @Param('type') type: string,
  ) {
    return this.uploadService.getFilesByDoctorAndType(doctorId, type);
  }

  
  @Get('doctor/:doctorId/patient/:patientId')
  async getDoctorFilesForPatient(
    @Param('doctorId') doctorId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.uploadService.getDoctorFilesForPatient(
      doctorId,
      patientId,
    );
  }

  @Get('filename/:filename')
  async getFileByID(@Param('filename') filename: string) {
    return this.uploadService.getFileByName(filename);
  }

  @Get('meshfetch/:meshFilename')
  async getMeshByName(@Param('meshFilename') meshFilename: string) {
    return this.uploadService.getmesh(meshFilename);
  }

  // ─── Patient personal medical files ────────────────────────────────────────

  /**
   * POST /upload/patient/medical-files
   * Patient uploads their own personal medical files (images / PDFs).
   * Body (multipart/form-data):
   *   - files        : one or more image/PDF files (field name: "files")
   *   - patientId    : string (required)
   *   - fileType     : string (optional) — e.g. "blood_test", "prescription", "xray", "general"
   *   - description  : string (optional) — free-text note about the files
   */
  @Post('patient/medical-files')
  @UseInterceptors(FilesInterceptor('files', 10, multerMedicalConfig))
  async uploadPatientMedicalFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return this.uploadService.uploadPatientMedicalFiles(files, data);
  }

  /**
   * GET /upload/patient/:patientId/medical-files
   * Doctor (or patient) retrieves all personal medical files for a given patient.
   * Optional query param: ?fileType=blood_test  to filter by category.
   */
  @Get('patient/:patientId/medical-files')
  async getPatientMedicalFiles(
    @Param('patientId') patientId: string,
    @Query('fileType') fileType?: string,
  ) {
    return this.uploadService.getPatientMedicalFiles(patientId, fileType);
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return this.uploadService.downloadFile(filename, res);
  }
}

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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { multerConfig } from './utils/multer.config';
import { UploadFileDataDto } from './dto/upload-file.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}



  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UploadFileDataDto,
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
    @Body() data: UploadFileDataDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.uploadService.uploadMultipleFiles(files, data);
  }



  
  @Get('patient/:patientId')
  async getFilesByPatient(@Param('patientId') patientId: string) {
    return this.uploadService.getFilesByPatient(patientId);
  }

  
  @Get('patient/:patientId/type/:type')
  async getFilesByPatientAndType(
    @Param('patientId') patientId: string,
    @Param('type') type: string,
  ) {
    return this.uploadService.getFilesByPatientAndType(patientId, type);
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
}
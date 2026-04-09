import {
  Controller,
  Post,
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
    @Body() data: UploadFileDataDto, // BUG FIX: Added Body decorator to get form data
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    // BUG FIX: Pass data object instead of undefined variables
    return this.uploadService.uploadFile(file, data);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: UploadFileDataDto, // BUG FIX: Added Body decorator to get form data
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    // BUG FIX: Pass data object instead of undefined variables
    return this.uploadService.uploadMultipleFiles(files, data);
  }
}
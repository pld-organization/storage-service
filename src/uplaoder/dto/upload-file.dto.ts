import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UploadFileDataDto {
  @ApiProperty({ example: 'doc_123456' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: 'pat_789012' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'prescription', description: 'Category of the file' })
  @IsString()
  @IsNotEmpty()
  fileType: string; // Note: camelCase to match convention
}
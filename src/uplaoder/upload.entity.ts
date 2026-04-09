// src/uploader/upload.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// this will be your document type
export type FileDocument = File & Document;

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop()
  mimetype: string;

  @Prop()
  size: number;

  @Prop()
  patientId: string; // optional: link to patient

  @Prop()
  comment: string; // optional
}

// create schema
export const FileSchema = SchemaFactory.createForClass(File);
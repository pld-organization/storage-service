// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';


import {UploadModule} from './uplaoder/upload.module';
@Module({
  imports: [   
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/clinic_db'),
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
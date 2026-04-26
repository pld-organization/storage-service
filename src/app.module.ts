import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadModule } from './uplaoder/upload.module';


import mongoConfig from './database/database.config';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoConfig],
    }),


    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        dbName: configService.get<string>('mongo.database'),
      }),
    }),


    UploadModule,
  ],
})
export class AppModule {}
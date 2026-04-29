import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadModule } from './uplaoder/upload.module';
import mongoConfig from './database/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
        uri: configService.get('mongodb.uri'),
        dbName: configService.get('mongodb.database'),
      }),
    }),
    UploadModule,
  ],
  controllers: [AppController], 
  providers: [AppService],      
})
export class AppModule {}

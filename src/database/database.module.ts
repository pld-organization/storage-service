import { Module } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Module({
  providers: [
    {
      provide: 'MONGO_DB',
      useFactory: async () => {
        const uri = process.env.MONGODB_URI; 
        const client = new MongoClient(uri);
        await client.connect();
        const dbName = process.env.MONGODB_DB || 'clinic_db';
        return client.db(dbName);
      },
    },
  ],
  exports: ['MONGO_DB'],
})
export class DatabaseModule {}

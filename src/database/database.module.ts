import { Module } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Module({
  providers: [
    {
      provide: 'MONGO_DB',
      useFactory: async () => {
        const client = new MongoClient('mongodb://127.0.0.1:27017');
        await client.connect();
        return client.db('clinic_db'); // your DB name
      },
    },
  ],
  exports: ['MONGO_DB'],
})
export class DatabaseModule {}
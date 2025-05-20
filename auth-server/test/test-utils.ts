import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, disconnect } from 'mongoose';

export class MongooseTestModule {
  private mongod: MongoMemoryServer;
  private connection: Connection;

  constructor() {
    this.mongod = null;
    this.connection = null;
  }

  async connect(): Promise<void> {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    this.connection = (await connect(uri)).connection;
  }

  async closeDatabase(): Promise<void> {
    if (this.connection) {
      await this.connection.dropDatabase();
      await this.connection.close();
    }
    if (this.mongod) {
      await this.mongod.stop();
    }
    await disconnect();
  }

  async clearDatabase(): Promise<void> {
    if (this.connection) {
      const collections = this.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  }

  getUri(): string {
    return this.mongod.getUri();
  }
}

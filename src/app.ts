import express from 'express';
import mongoose from 'mongoose';
import { PORT, MONGO_USER, MONGO_PASSWORD, MONGO_PATH } from './utils/config';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();

    this.connectToTheDatabase();
  }

  public listen() {
    this.app.listen(PORT, () => {
      console.log(`App listening on the port ${PORT}`);
    });
  }

  private async connectToTheDatabase() {
    try {
      await mongoose.connect(
        `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`,
        { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }
      );
      console.log(`MongoDB is connected`);
    } catch (err) {
      console.error(err.message);
    }
  }
}

export default App;

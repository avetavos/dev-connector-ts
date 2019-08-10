import express from 'express';
import mongoose from 'mongoose';
import Controller from './app/interface/controller';
import { PORT, MONGO_USER, MONGO_PASSWORD, MONGO_PATH } from './utils/config';

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
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

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach(controller => {
      this.app.use('/api/', controller.router);
    });
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
  }
}

export default App;

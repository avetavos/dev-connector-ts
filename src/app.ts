import express from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import morgan from 'morgan';
import Controller from './app/interface/Controller';

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  private async connectToTheDatabase() {
    try {
      const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
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
    this.app.use(compression());
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    }
  }
}

export default App;

import dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import Controller from './app/interface/Controller';

import AuthenticateController from './app/controllers/Authenticate';
import ProfileController from './app/controllers/Profile';
import PostController from './app/controllers/Post';

dotenv.config();

const app: Application = express();
const controllers: Controller[] = [
  new AuthenticateController(),
  new ProfileController(),
  new PostController()
];

app.use(express.json());
app.use(compression());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

try {
  const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
  mongoose
    .connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(() => {
      console.log(`MongoDB is connected`);
    });
} catch (err) {
  console.error(err.message);
}

controllers.forEach(controller => {
  app.use('/api/', controller.router);
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on the port ${process.env.PORT}`);
});

export default app;

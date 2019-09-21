import dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import Controller from './app/interface/Controller';

import Authenticate from './app/controllers/Authenticate';
import Profile from './app/controllers/Profile';
import Post from './app/controllers/Post';

dotenv.config();

const app: Application = express();
const controllers: Controller[] = [
  new Authenticate(),
  new Profile(),
  new Post()
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

controllers.forEach((controller: Controller) => {
  app.use('/api/', controller.router);
});

app.listen(process.env.PORT, (): void => {
  console.log(`App listening on the port ${process.env.PORT}`);
});

export default app;

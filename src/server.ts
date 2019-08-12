import * as dotenv from 'dotenv';
import App from './App';
import AuthenticateController from './app/controllers/Authenticate';
import ProfileController from './app/controllers/Profile';
import PostController from './app/controllers/Post';

dotenv.config();

const app = new App([
  new AuthenticateController(),
  new ProfileController(),
  new PostController()
]);

app.listen();

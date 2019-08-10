import App from './app';
import AuthenticateController from './app/controllers/Authenticate';

const app = new App([new AuthenticateController()]);

app.listen();

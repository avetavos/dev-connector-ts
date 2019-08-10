import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}../../../.env` });

export const PORT = process.env.PORT;
export const MONGO_USER = process.env.MONGO_USER;
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
export const MONGO_PATH = process.env.MONGO_PATH;
export const JWT_SECRET = process.env.JWT_SECRET;

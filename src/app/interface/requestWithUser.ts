import { Request } from 'express';
import mongoose from 'mongoose';

interface RequestWithUser extends Request {
  user: mongoose.Schema.Types.ObjectId;
}

export default RequestWithUser;

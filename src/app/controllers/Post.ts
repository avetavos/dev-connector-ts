import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import RequestWithUser from '../interface/RequestWithUser';
import userModel from '../models/User';
import postModel from '../models/Post';
import Controller from '../interface/Controller';
import authMiddleware from '../middlewares/authentication';
import postValidator from '../middlewares/validations/Post';
import commentValidator from '../middlewares/validations/Comment';

class PostController implements Controller {
  public path = '/post';
  public router = Router();
  private user = userModel;
  private post = postModel;

  constructor() {
    this.router.post(this.path, authMiddleware, postValidator, this.createPost);
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPost);
    this.router.get(`${this.path}/:id`, this.getPost);
    this.router.delete(this.path, authMiddleware, this.deletePost);
    this.router.post(`${this.path}/like/:id`, authMiddleware, this.likePost);
    this.router.put(`${this.path}/unlike/:id`, authMiddleware, this.unlikePost);
    this.router.post(
      `${this.path}/comment/:id`,
      authMiddleware,
      commentValidator,
      this.commentPost
    );
    this.router.delete(
      `${this.path}/comment/:id/:comment_id`,
      authMiddleware,
      this.removeComment
    );
  }

  private createPost = async (req: RequestWithUser, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await this.user.findById(req.user);
      const newPost = new this.post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.toString()
      });
      const post = await newPost.save();
      return res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private getAllPosts = async (req: Request, res: Response) => {
    try {
      const posts = await this.post.find().sort({ date: -1 });
      return res.json(posts);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private getPost = async (req: Request, res: Response) => {
    try {
      const post = await this.post.findById(req.params.id).sort({ date: -1 });
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
      return res.json(post);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      return res.status(500).send('Server error');
    }
  };

  private deletePost = async (req: RequestWithUser, res: Response) => {
    try {
      const post = await this.post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
      if (post.user.toString() !== req.user.toString()) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
      await post.remove();
      return res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      return res.status(500).send('Server error');
    }
  };

  private likePost = async (req: RequestWithUser, res: Response) => {
    try {
      const post = await this.post.findById(req.params.id);
      if (
        post.likes.filter(like => like.user.toString() === req.user.toString())
          .length > 0
      ) {
        return res.status(400).json({ msg: 'Post already liked' });
      }
      post.likes.unshift({ user: req.user.toString() });
      await post.save();
      return res.send(post.likes);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private unlikePost = async (req: RequestWithUser, res: Response) => {
    try {
      const post = await this.post.findById(req.params.id);
      const removeIndex = post.likes
        .map(like => like.user.toString())
        .indexOf(req.params.id);
      post.likes.splice(removeIndex, 1);
      await post.save();
      return res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private commentPost = async (req: RequestWithUser, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await this.user.findById(req.user).select('-password');
      const post = await this.post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.toString()
      };
      post.comments.unshift(newComment);
      await post.save();
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private removeComment = async (req: RequestWithUser, res: Response) => {
    try {
      const post = await this.post.findById(req.params.id);
      const comment = post.comments.find(
        item => item.id === req.params.comment_id
      );
      if (!comment) {
        return res.status(404).json({ msg: 'Comment does not exist' });
      }
      if (comment.user.toString() !== req.user.toString()) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
      const removeIndex = post.comments
        .map(item => item.user.toString())
        .indexOf(req.user.toString());
      post.comments.splice(removeIndex, 1);
      await post.save();
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };
}

export default PostController;

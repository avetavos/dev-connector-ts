import { Router, Request, Response } from 'express';
import RequestWithUser from '../interface/RequestWithUser';
import { validationResult } from 'express-validator';
import axios from 'axios';
import authMiddleware from '../middlewares/authentication';
import Controller from '../interface/Controller';
import profileModel from '../models/Profile';
import userModel from '../models/User';
import postModel from '../models/Post';
import profileValidator from '../middlewares/validations/Profile';
import experienceValidator from '../middlewares/validations/Experience';
import educationValidator from '../middlewares/validations/Education';

class ProfileController implements Controller {
  public path = '/profile';
  public router = Router();
  private user = userModel;
  private profile = profileModel;
  private post = postModel;

  constructor() {
    this.router.get(`${this.path}/me`, authMiddleware, this.myProfile);
    this.router.post(
      this.path,
      authMiddleware,
      profileValidator,
      this.createAndUpdate
    );
    this.router.get(this.path, this.getAllProfiles);
    this.router.get(`${this.path}/user/:user_id`, this.getProfile);
    this.router.delete(this.path, authMiddleware, this.deleteProfile);
    this.router.put(
      `${this.path}/experience`,
      authMiddleware,
      experienceValidator,
      this.addExperience
    );
    this.router.delete(
      `${this.path}/experience/:exp_id`,
      authMiddleware,
      this.removeExperience
    );
    this.router.put(
      `${this.path}/education`,
      authMiddleware,
      educationValidator,
      this.addEducation
    );
    this.router.delete(
      `${this.path}/education/:edu_id`,
      authMiddleware,
      this.removeEducation
    );
    this.router.get(`${this.path}/github/:username`, this.github);
  }

  private myProfile = async (req: RequestWithUser, res: Response) => {
    try {
      const profile = await this.profile
        .findOne({ user: req.user })
        .populate('users', ['name', 'avatar']);
      if (!profile) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Profile file not found' }] });
      }
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private createAndUpdate = async (req: RequestWithUser, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      github,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;
    const profileFields: any = {};
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (github) profileFields.github = github;
    if (skills) {
      profileFields.skills = skills
        .split(',')
        .map((skill: string) => skill.trim());
    }
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    try {
      const profile = await this.profile.findOneAndUpdate(
        { user: req.user },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  };

  private getAllProfiles = async (req: Request, res: Response) => {
    try {
      const profiles = await this.profile
        .find()
        .populate('users', ['name', 'avatar']);
      return res.json(profiles);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private getProfile = async (req: Request, res: Response) => {
    try {
      const profile = await this.profile
        .findOne({ user: req.params.user_id })
        .populate('users', ['name', 'avatar']);
      if (!profile) {
        return res
          .status(400)
          .json({ msg: 'There is no profile for this user' });
      }
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private deleteProfile = async (req: RequestWithUser, res: Response) => {
    try {
      await this.profile.findOneAndRemove({ user: req.user });
      await this.post.findOneAndRemove({ user: req.user });
      await this.user.findByIdAndDelete(req.user);
      return res.json({ msg: 'User deleted' });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private addExperience = async (req: RequestWithUser, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;
    const newExp = { title, company, location, from, to, current, description };
    try {
      const profile = await this.profile.findOne({ user: req.user });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private removeExperience = async (req: RequestWithUser, res: Response) => {
    try {
      const profile = await this.profile.findOne({ user: req.user });
      const removeIndex = profile.experience
        .map((item: any) => item.id)
        .indexOf(req.params.exp_id);
      profile.experience.splice(removeIndex, 1);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private addEducation = async (req: RequestWithUser, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };
    try {
      const profile = await this.profile.findOne({ user: req.user });
      profile.education.unshift(newEdu);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private removeEducation = async (req: RequestWithUser, res: Response) => {
    try {
      const profile = await this.profile.findOne({ user: req.user });
      const removeIndex = profile.education
        .map((item: any) => item.id)
        .indexOf(req.params.edu_id);
      profile.education.splice(removeIndex, 1);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };

  private github = async (req: Request, res: Response) => {
    try {
      axios
        .get(
          `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_SECRET}`
        )
        .then(result => {
          res.json(result.data);
        })
        .catch(err => {
          if (err.response.status === 404) {
            return res.status(404).json({ msg: 'No Github profile found' });
          }
          return res.status(500).send('Server error');
        });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  };
}

export default ProfileController;

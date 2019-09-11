import { after, before, describe, it } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import Server from '../src/App';
import userModel from '../src/app/models/User';
import profileModel from '../src/app/models/Profile';
import postModel from '../src/app/models/Post';

chai.use(chaiHttp);
chai.should();

describe('', () => {
  let token: string;
  let userId: string;

  before(done => {
    done();
  });

  describe('', () => {
    it('It should register success!', done => {
      chai
        .request(Server)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          name: 'User One',
          email: 'user1@mail.com',
          password: '123456'
        })
        .end((e, res) => {
          res.should.have.status(200);
          res.body.should.have.property('msg').eql('register successes');
          done();
        });
    });
  });

  describe('', () => {
    it('It should login success!', done => {
      chai
        .request(Server)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'user1@mail.com',
          password: '123456'
        })
        .end(async (e, res) => {
          res.should.have.status(200);
          res.body.should.have.property('token');
          token = await (res.body.token as string);
          done();
        });
    });
  });

  describe('', () => {
    it('It should show current user', done => {
      chai
        .request(Server)
        .get('/api/auth')
        .set('x-auth-token', token)
        .end(async (e, res) => {
          res.should.have.status(200);
          res.body.should.have.property('name');
          res.body.should.have.property('email');
          res.body.should.have.property('avatar');
          userId = await (res.body._id as string);
          done();
        });
    });
  });

  describe('', () => {
    it('It should create profile, but if already have one, edit it.', done => {
      chai
        .request(Server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          company: 'Hegmann, Smith and Heaney',
          website: 'xavier.info',
          status: 'Developer',
          skills: 'Java, C#',
          location: 'Araceliborough',
          bio: 'I am a developer',
          githubusername: 'avetavos',
          facebook: 'https://www.facebook.com/alannamitchell'
        })
        .end(async (e, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('skills');
          done();
        });
    });
  });

  describe('', () => {
    it('It should show all user profiles', done => {
      chai
        .request(Server)
        .get('/api/profile')
        .end((e, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('', () => {
    it(`It should show profile by user id`, done => {
      chai
        .request(Server)
        .get(`/api/profile/user/${userId}`)
        .end((e, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('skills');
          done();
        });
    });
  });

  describe('', () => {
    it(`It should add experience to profile`, done => {
      chai
        .request(Server)
        .put(`/api/profile/experience`)
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          title: 'Developer',
          company: 'Degv Soft',
          location: 'Udonthani TH',
          from: '08-10-2010',
          to: '08-10-2015',
          current: false,
          description: 'Web development'
        })
        .end((e, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('', () => {
    it(`It should add education to profile`, done => {
      chai
        .request(Server)
        .put(`/api/profile/education`)
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          school: 'Khon Kean University',
          degree: 'bachelor',
          fieldofstudy: 'Computer Science',
          from: '08-02-2003',
          to: '08-02-2005',
          description: 'Web development'
        })
        .end(async (e, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('', () => {
    it(`It should add education to profile`, done => {
      chai
        .request(Server)
        .get(`/api/profile/github/avetavos`)
        .end(async (e, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  after(done => {
    userModel.remove({}, err => {
      console.log('Remove all users.');
    });
    profileModel.remove({}, err => {
      console.log('Remove all profiles.');
    });
    postModel.remove({}, err => {
      console.log('Remove all posts.');
    });
    done();
  });
});

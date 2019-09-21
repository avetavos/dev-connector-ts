interface Post {
  _id: string;
  user: string;
  text: string;
  name: string;
  avatar: string;
  likes?: Like[];
  comments?: Comment[];
  date: Date;
}

interface Like {
  user: string;
}

interface Comment {
  id?: string;
  user: string;
  text: string;
  name: string;
  avatar: string;
  date?: Date;
}

export default Post;

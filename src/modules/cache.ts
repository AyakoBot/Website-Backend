export const servers: {
  count: number;
  users: number;
  servers: {
    invite?: string;
    name: string;
    iconURL: string;
    members: number;
    bannerURL?: string;
  }[];
} = {
  count: 0,
  users: 0,
  servers: [],
};

export const reviews: {
  content: string;
  score: number;
  poster: {
    username: string;
    id: string;
    avatar: string;
  };
}[] = [];

export default null;

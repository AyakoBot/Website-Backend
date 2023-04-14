import Jobs from 'node-schedule';
import * as nodeFetch from 'node-fetch';
import DataBase from '../DataBase.js';

type Review = {
  content: string;
  score: number;
  poster: {
    username: string;
    avatar: string;
    id: string;
  };
};

const fetch = async () => {
  const getReviews = (page: number = 1) =>
    nodeFetch
      .default(`https://top.gg/api/client/entities/650691698409734151/reviews?page=${page}`)
      .then((r) => r.json()) as Promise<Review[]>;

  let r: Review[] = [];
  for (let i = 1; true; i++) {
    const newReviews = await getReviews(i);
    if (newReviews.length !== 10) break;
    r = r.concat(newReviews);
  }

  r.forEach((review) =>
    DataBase.query(
      `INSERT INTO reviews (content, score, username, avatar, userid) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (userid) DO NOTHING;`,
      [
        review.content,
        review.score,
        review.poster.username,
        review.poster.avatar,
        review.poster.id,
      ],
    ),
  );
};

Jobs.scheduleJob('0 0 1 * *', async () => {
  fetch();
});

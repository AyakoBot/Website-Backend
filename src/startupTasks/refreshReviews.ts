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
  const getReviews = (page = 1) =>
    nodeFetch
      .default(`https://top.gg/api/client/entities/650691698409734151/reviews?page=${page}`)
      .then((r) => r.json()) as Promise<Review[]>;

  let r: Review[] = [];
  // eslint-disable-next-line no-constant-condition
  for (let i = 1; true; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const newReviews = await getReviews(i);
    if (newReviews.length !== 10) break;
    r = r.concat(newReviews);
  }

  r.forEach((review) =>
    DataBase.reviews
      .upsert({
        create: {
          content: review.content,
          score: review.score,
          username: review.poster.username,
          avatar: review.poster.avatar,
          userid: review.poster.id,
        },
        where: { userid: review.poster.id },
        update: {},
      })
      .then(),
  );
};

Jobs.scheduleJob('0 0 1 * *', async () => {
  fetch();
});

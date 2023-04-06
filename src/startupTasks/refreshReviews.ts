import Jobs from 'node-schedule';
import * as nodeFetch from 'node-fetch';
import { reviews } from '../modules/cache.js';

type Review = typeof reviews[number];

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

  reviews.length = 0;
  reviews.push(
    ...r.map((review) => ({
      content: review.content,
      score: review.score / 20,
      poster: {
        username: review.poster.username,
        avatar: !review.poster.avatar.includes('https://')
          ? `https://images.discordapp.net/avatars/${review.poster.id}/${review.poster.avatar}.webp?size=512`
          : review.poster.avatar,
        id: review.poster.id,
      },
    })),
  );
};

setTimeout(() => {
  fetch();
}, 2000);

Jobs.scheduleJob('0 0 1 * *', async () => {
  fetch();
});

import type Express from 'express';
import checkAutorized from '../../../modules/checkAutorized.js';
import checkPunishments from '../../../modules/appeals/checkPunishments.js';
import checkAppeals from '../../../modules/appeals/checkAppeals.js';
import DataBase from '../../../DataBase.js';
import type * as DBT from '../../../../submodules/Ayako-v1.6/src/Typings/DataBaseTypings.js';
import type * as CT from '../../../../submodules/Ayako-v1.6/src/Typings/CustomTypings.js';
import { io, appeal } from '../../../socketIOHandler.js';

type answers = {
  uniquetimestamp: string;
  value: string | boolean | number | string[];
};

export default async (req: Express.Request, res: Express.Response) => {
  const { user, authorized } = await checkAutorized(req, res);
  if (!authorized) return;

  const guildid = req.query.guild as string;
  if (!guildid) {
    res.sendStatus(400);
    return;
  }

  const punishmentid = req.query.punishment as string;
  if (!punishmentid) {
    res.sendStatus(400);
    return;
  }

  const answers = req.body as answers[];

  const pun = await checkPunishments(res, user, guildid);
  if (!pun.authorized) return;

  const appeals = await checkAppeals(res, user, guildid, punishmentid);
  if (!appeals.authorized) return;

  const canAppeal = await checkQuestions(appeals.questions, answers, res);
  if (!canAppeal.authorized) return;

  const questions = answers.length
    ? answers
        .map((a) => canAppeal.questions.find((q) => q.uniquetimestamp === a.uniquetimestamp))
        .filter((q) => !!q?.question)
    : [];

  await DataBase.query(
    `INSERT INTO appeals (userid, guildid, questions, questiontypes, answers, punishmentid) VALUES ($1, $2, $3, $4, $5, $6);`,
    [
      user.userid,
      guildid,
      questions.map((q) => q?.question),
      questions.map((q) => q?.answertype),
      questions.map((q) => answers.find((a) => a.uniquetimestamp === q?.uniquetimestamp)?.value),
      punishmentid,
    ],
  );

  const emitAppeal: CT.Appeal = {
    userid: user.userid,
    guildid,
    punishmentid,
    questions: questions.map((q) => q?.question).filter((q): q is string => !!q),
    answertypes: questions.map((q) => q?.answertype),
    answers: questions
      .map((q) => answers.find((a) => a.uniquetimestamp === q?.uniquetimestamp)?.value)
      .filter((a): a is string => !!a),
  };

  appeal.map((id) => io.to(id).emit('appeal', emitAppeal));
  res.sendStatus(200);
};

type AuthorizedResponse = {
  authorized: true;
  questions: DBT.appealquestions[];
};

type UnauthorizedResponse = {
  authorized: false;
};

type ApiResponse = AuthorizedResponse | UnauthorizedResponse;

const checkQuestions = async (
  questions: DBT.appealquestions[],
  answers: answers[],
  res: Express.Response,
): Promise<ApiResponse> => {
  if (!questions.length) return { authorized: true, questions: [] };

  const areValid = questions.map((question) => {
    const answer = answers.find((a) => a.uniquetimestamp === question.uniquetimestamp)?.value;
    if (!answer && question.required) return false;
    if (!answer) return true;

    console.log(answer, question);

    switch (question.answertype) {
      case 'number': {
        if (typeof answer !== 'number') return false;
        break;
      }
      case 'boolean': {
        if (typeof answer !== 'boolean') return false;
        break;
      }
      case 'multiple choice': {
        if (!Array.isArray(answer)) return false;
        if (!answers.map((a) => typeof a === 'string').includes(false)) return false;
        if (!answer.length) return false;
        break;
      }
      case 'single choice': {
        if (typeof answer !== 'string') return false;
        break;
      }
      default: {
        return true;
      }
    }

    return true;
  });

  if (areValid.includes(false)) {
    res.sendStatus(400);
    return { authorized: false };
  }

  return { authorized: true, questions };
};

import { createServerFn } from '@router/react-start';
import { getRequest } from '@router/react-start/server';
import { z } from 'zod';

export const askCeoDashboard = createServerFn({ method: 'POST' }).
validator((data) => z.object({
  question: z.string().trim().min(3).max(400),
  metrics: z.string().max(8000)
}).parse(data)).
handler(async ({ data }) => {
  const { answerCeoQuestion } = await import('./ceo-ask.server');
  return answerCeoQuestion(getRequest(), data);
});
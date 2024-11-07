import { NextApiResponse } from 'next';

export const handleError = (error: unknown, res: NextApiResponse): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ error: errorMessage });
} 
import { APIResponse } from '../../../types';

export const sendMessage = async (message: string): Promise<APIResponse> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  return response.json();
}; 
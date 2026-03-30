import { apiClient } from '@/api/client';
import { statesResponseSchema, type StatesResponse } from '@/api/schemas';

export async function fetchStates(signal?: AbortSignal): Promise<StatesResponse> {
  const data = await apiClient.get<unknown>('/states', { signal });
  return statesResponseSchema.parse(data);
}

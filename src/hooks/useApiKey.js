import { useStorage } from './useStorage';

export function useApiKey() {
  return useStorage('apiKey', '');
}

import { useQuery } from '@tanstack/react-query';
import { resultService } from '../services/resultService';
import type { MyResult } from '../types/result.types';

  
export function useMyResults() {
  return useQuery<MyResult[]>({
    queryKey: ['results'],
    queryFn: () => resultService.getMyResults(),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

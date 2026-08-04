import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    // Le profil (pseudo, email, date d'inscription) ne change quasiment
    // jamais en V1 → on garde la donnée "fraîche" longtemps, pas de refetch inutile.
    staleTime: 1000 * 60 * 60, // 1 heure
  });
}
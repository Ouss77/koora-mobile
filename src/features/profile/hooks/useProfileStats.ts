import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useProfileStats() {
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => profileService.getStats(),
    // Les stats bougent dès que l'admin saisit/corrige un résultat.
    // On les considère "périmées" vite pour qu'elles se rafraîchissent.
    staleTime: 1000 * 30, // 30 secondes
  });
}
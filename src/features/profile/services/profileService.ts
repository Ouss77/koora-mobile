import { IProfileRepository } from '../repositories/IProfileRepository';
import { SupabaseProfileRepository } from '../repositories/SupabaseProfileRepository';
import { Profile, ProfileStats } from '../types/profile';

export class ProfileService {
  constructor(private readonly repository: IProfileRepository) {}

  getProfile(): Promise<Profile> {
    return this.repository.getProfile();
  }

  getStats(): Promise<ProfileStats> {
    return this.repository.getStats();
  }
}

// Une seule instance au niveau module, comme authService.
export const profileService = new ProfileService(new SupabaseProfileRepository());
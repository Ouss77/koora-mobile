import { Profile, ProfileStats } from '../types/profile';

export interface IProfileRepository {
  getProfile(): Promise<Profile>;
  getStats(): Promise<ProfileStats>;
}
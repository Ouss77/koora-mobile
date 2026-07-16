  import { Match } from "../types/match";

  export interface IMatchRepository {
    list(): Promise<Match[]>;

    listUpcoming(): Promise<Match[]>;

    listLocked(): Promise<Match[]>;

    listFinished(): Promise<Match[]>;

      /** Un match par son id, ou null s'il n'existe pas (ou est invisible via RLS). */
    findById(id: string): Promise<Match | null>;
  }


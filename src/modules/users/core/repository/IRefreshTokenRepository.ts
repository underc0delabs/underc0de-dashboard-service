export interface IRefreshTokenRepository {
  save: (payload: { userId: number; token: string; expiresAt: Date }) => Promise<any>;
  getByToken: (token: string) => Promise<{ userId: number; expiresAt: Date } | null>;
  removeByToken: (token: string) => Promise<void>;
  removeByUserId: (userId: number) => Promise<void>;
}

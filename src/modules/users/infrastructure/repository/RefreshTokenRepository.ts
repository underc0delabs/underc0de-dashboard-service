import { IRefreshTokenRepository } from "../../core/repository/IRefreshTokenRepository.js";
import RefreshTokenModel from "../models/RefreshTokenModel.js";

export const RefreshTokenRepository = (): IRefreshTokenRepository => ({
  async save(payload) {
    await RefreshTokenModel.create(payload as any);
  },
  async getByToken(token) {
    const row = await RefreshTokenModel.findOne({
      where: { token },
      attributes: ["userId", "expiresAt"],
    });
    if (!row) return null;
    const j = row.toJSON() as any;
    return { userId: j.userId, expiresAt: new Date(j.expiresAt) };
  },
  async removeByToken(token) {
    await RefreshTokenModel.destroy({ where: { token } });
  },
  async removeByUserId(userId) {
    await RefreshTokenModel.destroy({ where: { userId } });
  },
});

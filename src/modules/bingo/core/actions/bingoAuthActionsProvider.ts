import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import configs from "../../../../configs.js";
import generateJWT from "../../../../helpers/generate-jwt.js";
import type { IBingoRepository } from "../../infrastructure/repository/BingoRepository.js";
import { BingoValidationException } from "../exceptions/BingoExceptions.js";

export interface IBingoAuthActions {
  loginWithGoogle(idToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    participant: { id: string; name: string | null; email: string; avatarUrl: string | null };
  }>;
  refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;
}

const issueTokens = async (repo: IBingoRepository, participantId: string) => {
  const expiresInSeconds = configs.access_token_expires_seconds ?? 900;
  const accessToken = await generateJWT(participantId, expiresInSeconds);

  const refreshToken = crypto.randomBytes(32).toString("hex");
  const days = configs.refresh_token_expires_days ?? 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  await repo.createParticipantToken({ participantId, token: refreshToken, expiresAt });

  return { accessToken, refreshToken, expiresIn: expiresInSeconds };
};

export const BingoAuthActionsProvider = (
  repo: IBingoRepository,
): IBingoAuthActions => {
  const oauthClient = new OAuth2Client(configs.google_client_id ?? undefined);

  return {
    async loginWithGoogle(idToken) {
      if (!idToken?.trim()) {
        throw new BingoValidationException("idToken es requerido");
      }
      if (!configs.google_client_id) {
        throw new Error("GOOGLE_CLIENT_ID no configurado");
      }

      let payload;
      try {
        const ticket = await oauthClient.verifyIdToken({
          idToken,
          audience: configs.google_client_id,
        });
        payload = ticket.getPayload();
      } catch {
        throw new BingoValidationException("Token de Google inválido");
      }

      if (!payload?.sub || !payload.email) {
        throw new BingoValidationException("Token de Google inválido");
      }

      let participant = await repo.findParticipantByGoogleId(payload.sub);
      if (!participant) {
        participant = await repo.createParticipant({
          googleId: payload.sub,
          email: payload.email,
          name: payload.name ?? null,
          avatarUrl: payload.picture ?? null,
        });
      } else {
        participant = (await repo.updateParticipant(participant.id, {
          email: payload.email,
          name: payload.name ?? null,
          avatarUrl: payload.picture ?? null,
        })) ?? participant;
      }

      const tokens = await issueTokens(repo, participant.id);
      return {
        ...tokens,
        participant: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          avatarUrl: participant.avatarUrl,
        },
      };
    },

    async refresh(refreshToken) {
      const token = refreshToken?.trim();
      if (!token) {
        throw new BingoValidationException("refreshToken es requerido");
      }
      const record = await repo.findParticipantToken(token);
      if (!record) {
        throw new BingoValidationException("Refresh token no válido");
      }
      if (new Date() > record.expiresAt) {
        await repo.deleteParticipantToken(token);
        throw new BingoValidationException("Refresh token expirado");
      }
      const participant = await repo.findParticipantById(record.participantId);
      if (!participant) {
        await repo.deleteParticipantToken(token);
        throw new BingoValidationException("Participante no encontrado");
      }
      await repo.deleteParticipantToken(token);
      return issueTokens(repo, participant.id);
    },
  };
};

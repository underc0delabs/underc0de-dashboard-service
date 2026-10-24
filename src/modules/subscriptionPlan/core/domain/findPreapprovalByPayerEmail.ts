import { MpSubscription } from "../../../../services/mercadopagoService/core/types/mercadoPagoTypes.js";

export type PayerEmailLookupResult =
  | { kind: "found"; preapprovalId: string }
  | { kind: "not_found" }
  | { kind: "not_active" };

const normalize = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

/**
 * Busca la suscripción authorized de MP asociada a un email de pagador.
 * Solo devuelve preapprovals libres (sin usuario) o ya vinculados al propio usuario, de modo
 * que no se pueda reclamar la suscripción de otra cuenta de la app. Entre varias, la más reciente.
 */
export const findPreapprovalByPayerEmail = async (
  subscriptions: MpSubscription[],
  payerEmail: string,
  userId: string,
  getLinkedUserId: (
    preapprovalId: string
  ) => Promise<string | number | null | undefined>
): Promise<PayerEmailLookupResult> => {
  const email = normalize(payerEmail);
  if (!email) return { kind: "not_found" };

  const sameEmail = subscriptions.filter(
    (s) => normalize((s as any).payer_email ?? (s as any).payer_email_address) === email
  );
  if (!sameEmail.length) return { kind: "not_found" };

  const authorized = sameEmail
    .filter((s) => String(s.status ?? "").toLowerCase() === "authorized")
    .sort(
      (a, b) =>
        new Date(b.date_created ?? 0).getTime() -
        new Date(a.date_created ?? 0).getTime()
    );
  if (!authorized.length) return { kind: "not_active" };

  for (const sub of authorized) {
    const linked = await getLinkedUserId(String(sub.id));
    if (linked == null || String(linked) === String(userId)) {
      return { kind: "found", preapprovalId: String(sub.id) };
    }
  }
  // Existen, pero todas pertenecen a otra cuenta: mismo mensaje que "no encontrada".
  return { kind: "not_found" };
};

import IMerchant from "./entities/IMerchant.js";

export const normalizeMerchantPayload = (
  body: IMerchant | Record<string, unknown>,
): Record<string, unknown> => {
  const payload = { ...(body as Record<string, unknown>) };
  const category = payload.category;
  if (
    category === "" ||
    category === "null" ||
    category === "undefined" ||
    category === null ||
    category === undefined
  ) {
    payload.category = null;
  }
  return payload;
};

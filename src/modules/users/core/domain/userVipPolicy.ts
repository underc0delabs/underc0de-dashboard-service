import { isInternalPreapprovalId } from "../../../subscriptionPlan/core/domain/subscriptionPlanHelpers.js";

const toPlanRow = (sub: any) =>
  sub && typeof sub.toJSON === "function" ? sub.toJSON() : sub;

/** PRO otorgado desde el panel (admin-*) o collector (owner-*), sin MercadoPago. */
export const userHasActiveInternalGrant = (
  plans: any[] | undefined
): boolean => {
  if (!plans?.length) return false;
  return plans
    .map(toPlanRow)
    .some(
      (p) =>
        p?.status === "ACTIVE" &&
        isInternalPreapprovalId(p.mpPreapprovalId)
    );
};

export const resolveUserVip = (params: {
  is_pro: boolean | number | null | undefined;
  activeSubscription: any | null;
  cancelledSubscription: any | null;
  isUpToDate: boolean | null;
  subscriptionPlans?: any[];
}): boolean => {
  if (userHasActiveInternalGrant(params.subscriptionPlans)) {
    return true;
  }

  const userIsPro = Boolean(params.is_pro);
  const active = params.activeSubscription;
  const cancelled = params.cancelledSubscription;

  const activeProVip =
    !!active && (params.isUpToDate !== false || userIsPro);

  const proFromCancelled = !!cancelled && params.isUpToDate === true;

  return (
    activeProVip ||
    proFromCancelled ||
    (userIsPro && !active && !cancelled)
  );
};

/** No pisar is_pro=false de MP si el usuario tiene grant interno activo. */
export const resolveIsProAfterMpSync = (
  mpWouldBePro: boolean,
  plans: any[] | undefined
): boolean => mpWouldBePro || userHasActiveInternalGrant(plans);

/** Fecha lejana para suscripciones vitalicias / admin (sin cobro MP). */
export const lifetimeNextPaymentDate = (): Date =>
  new Date("2099-12-31T00:00:00.000Z");

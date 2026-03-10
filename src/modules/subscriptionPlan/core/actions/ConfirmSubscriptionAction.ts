import { ISyncSubscriptionByPreapprovalIdAction } from "./SyncSubscriptionByPreapprovalIdAction.js";

export interface IConfirmSubscriptionAction {
  execute: (webhookBody: any) => Promise<any>;
}

export const ConfirmSubscriptionAction = (
  syncSubscriptionByPreapprovalId: ISyncSubscriptionByPreapprovalIdAction
): IConfirmSubscriptionAction => {
  return {
    execute: async (webhookBody: any) => {
      if (webhookBody.type !== "preapproval") {
        return { success: true, message: "Event type not handled" };
      }

      const preapprovalId = webhookBody.data?.id;
      if (!preapprovalId) {
        return { success: false, message: "Missing preapproval ID" };
      }

      return syncSubscriptionByPreapprovalId.execute(preapprovalId);
    },
  };
};

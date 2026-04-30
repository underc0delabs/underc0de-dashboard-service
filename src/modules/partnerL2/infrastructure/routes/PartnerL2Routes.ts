import { Router } from "express";

import configs from "../../../../configs.js";
import { DependencyManager } from "../../../../dependencyManager.js";
import { partnerL2IntegrationAuth } from "../../../../middlewares/PartnerL2IntegrationAuth.js";
import { createSimpleWindowRateLimiter } from "../../../../middlewares/simpleApiRateLimiter.js";
import type { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";

import { PartnerL2Controllers } from "../controllers/PartnerL2Controllers.js";

const getPartnerL2Routes = (dependencyManager: DependencyManager) => {
  if (!configs.l2_partner_integration_enabled) {
    return Router();
  }

  const userRepository = dependencyManager.resolve(
    "userRepository"
  ) as IUserRepository;
  const c = PartnerL2Controllers({ userRepository });

  const lookupLimiter = createSimpleWindowRateLimiter({
    windowMs: 60_000,
    max: 120,
    key: (req) => `${req.ip ?? "unknown"}`,
  });

  const finalizeLimiter = createSimpleWindowRateLimiter({
    windowMs: 60_000,
    max: 30,
    key: (req) => `${req.ip ?? "unknown"}|finalize`,
  });

  const r = Router();
  r.get(
    `/integrations/l2/forum/username-status`,
    partnerL2IntegrationAuth,
    lookupLimiter,
    c.getUsernameStatus
  );
  r.post(
    `/integrations/l2/forum/finalize`,
    partnerL2IntegrationAuth,
    finalizeLimiter,
    c.postFinalizeForumLink
  );
  r.get(
    `/integrations/l2/forum/link-status/:l2AccountId`,
    partnerL2IntegrationAuth,
    lookupLimiter,
    c.getForumLinkStatus
  );
  return r;
};

export default getPartnerL2Routes;

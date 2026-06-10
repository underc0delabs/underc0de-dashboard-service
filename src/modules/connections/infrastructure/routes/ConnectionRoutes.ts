import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { jwtOrAppKeyAuth } from "../../../../middlewares/JwtOrAppKeyAuth.js";
import { createSimpleWindowRateLimiter } from "../../../../middlewares/simpleApiRateLimiter.js";
import { getConnectionControllers } from "../controllers/controllersProvider.js";

const getConnectionRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = getJwtValidator(dependencyManager);
  const auth = [jwtOrAppKeyAuth(jwtValidator)];
  const {
    resolve,
    rotateShareCode,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    listFriends,
    listIncomingRequests,
    listOutgoingRequests,
    followUser,
    unfollowUser,
    listFollowing,
    listFollowers,
    blockUser,
  } = getConnectionControllers(dependencyManager);

  const resolveLimiter = createSimpleWindowRateLimiter({
    windowMs: 60_000,
    max: 120,
    key: (req) => `${req.ip ?? "unknown"}|connections-resolve`,
  });

  const router = Router();
  const path = "connections";

  router.get(`/${path}/resolve`, resolveLimiter, resolve);

  router.post(`/${path}/share-code/rotate`, auth, rotateShareCode);

  router.post(`/${path}/friend-requests`, auth, sendFriendRequest);
  router.get(`/${path}/friend-requests/incoming`, auth, listIncomingRequests);
  router.get(`/${path}/friend-requests/outgoing`, auth, listOutgoingRequests);
  router.post(`/${path}/friend-requests/:id/accept`, auth, acceptFriendRequest);
  router.post(`/${path}/friend-requests/:id/reject`, auth, rejectFriendRequest);
  router.delete(`/${path}/friend-requests/:id`, auth, cancelFriendRequest);

  router.get(`/${path}/friends`, auth, listFriends);

  router.get(`/${path}/follows/following`, auth, listFollowing);
  router.get(`/${path}/follows/followers`, auth, listFollowers);
  router.post(`/${path}/follows/:userId`, auth, followUser);
  router.delete(`/${path}/follows/:userId`, auth, unfollowUser);

  router.post(`/${path}/block/:userId`, auth, blockUser);

  return router;
};

const getJwtValidator = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("jwtValidator") as IJwtValidator;
};

export default getConnectionRoutes;

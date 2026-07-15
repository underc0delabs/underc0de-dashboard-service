import { Router } from "express";
import { ForumProxyControllers } from "../controllers/ForumProxyControllers.js";

const getForumRoutes = () => {
  const router = Router();
  const { list, replies } = ForumProxyControllers();

  router.post("/forum/list", list);
  router.post("/forum/replies", replies);

  return router;
};

export default getForumRoutes;

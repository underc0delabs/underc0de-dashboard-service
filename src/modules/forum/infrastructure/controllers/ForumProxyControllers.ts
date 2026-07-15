import { Request, Response } from "express";
import { proxyForumList, proxyForumReplies } from "../../../../helpers/forumApiProxy.js";

export const ForumProxyControllers = () => {
  const list = async (req: Request, res: Response) => {
    try {
      const payload = await proxyForumList(req.body ?? {});
      return res.status(200).json(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Forum list proxy failed";
      return res.status(502).json({
        error: true,
        ecode: 502,
        emsg: message,
      });
    }
  };

  const replies = async (req: Request, res: Response) => {
    try {
      const payload = await proxyForumReplies(req.body ?? {});
      return res.status(200).json(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Forum replies proxy failed";
      return res.status(502).json({
        error: true,
        ecode: 502,
        emsg: message,
      });
    }
  };

  return { list, replies };
};

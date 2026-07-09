import { Request, Response, Router } from "express";

const SHARE_CODE_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const ConnectRedirectRoute = (): Router => {
  const router = Router();

  router.get("/connect/:shareCode", (req: Request, res: Response) => {
    const shareCode = decodeURIComponent(String(req.params.shareCode ?? "")).trim();

    if (!SHARE_CODE_PATTERN.test(shareCode)) {
      res.status(404).send("Código no válido");
      return;
    }

    const deepLink = `underc0de://connect/${encodeURIComponent(shareCode)}`;
    const safeDeepLink = escapeHtml(deepLink);

    res
      .status(200)
      .type("html")
      .send(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Underc0de</title>
    <meta http-equiv="refresh" content="0;url=${safeDeepLink}" />
    <script>
      window.location.replace(${JSON.stringify(deepLink)});
    </script>
  </head>
  <body style="font-family: system-ui, sans-serif; text-align: center; padding: 2rem;">
    <p>Abriendo Underc0de…</p>
    <p><a href="${safeDeepLink}">Tocá acá si no se abre la app</a></p>
  </body>
</html>`);
  });

  return router;
};

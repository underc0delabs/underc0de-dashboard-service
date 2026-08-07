import fetch, { Headers, Request, Response } from "node-fetch";

/**
 * google-auth-library@10 asume los globales fetch/Headers/Request/Response
 * de Node >=18. El VPS de producción corre Node 16, así que los completamos
 * acá antes de que se importe cualquier otro módulo.
 */
if (typeof globalThis.fetch === "undefined") {
  Object.assign(globalThis, { fetch, Headers, Request, Response });
}

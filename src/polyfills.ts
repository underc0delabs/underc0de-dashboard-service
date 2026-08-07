import { fetch, Headers, Request, Response, FormData } from "undici";
import { Blob } from "node:buffer";
import { ReadableStream, WritableStream, TransformStream } from "node:stream/web";

/**
 * google-auth-library@10 (via gaxios) asume toda la superficie de la Fetch
 * API + Web Streams de Node >=18. El VPS de producción corre Node 16, así
 * que la completamos acá antes de que se importe cualquier otro módulo.
 * Se descubrió la lista completa probando contra un token real: faltaban,
 * en orden, Headers, Blob, FormData y ReadableStream/WritableStream/
 * TransformStream.
 */
if (typeof globalThis.fetch === "undefined") {
  Object.assign(globalThis, {
    fetch,
    Headers,
    Request,
    Response,
    FormData,
    Blob,
    ReadableStream,
    WritableStream,
    TransformStream,
  });
}

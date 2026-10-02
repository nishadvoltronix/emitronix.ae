/** Read a request body with an actual byte limit before parsing it. */
export async function readBoundedRequestBody(request: Pick<Request, "headers" | "body">, maxBytes: number) {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > maxBytes) {
    return { tooLarge: true, body: null } as const;
  }

  if (!request.body) return { tooLarge: false, body: Buffer.alloc(0) } as const;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return { tooLarge: true, body: null } as const;
    }
    chunks.push(value);
  }

  return { tooLarge: false, body: Buffer.concat(chunks, totalBytes) } as const;
}

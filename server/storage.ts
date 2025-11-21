// Simple local storage for documents
// Stores files in memory (for demo purposes)

const storage = new Map<string, { content: string; contentType: string }>();

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Convert data to string for storage
  const content = typeof data === "string"
    ? data
    : Buffer.isBuffer(data)
      ? data.toString('utf-8')
      : new TextDecoder().decode(data);

  // Store in memory
  storage.set(key, { content, contentType });

  // Return a fake URL (since we're storing in memory)
  const url = `/storage/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  const item = storage.get(key);

  if (!item) {
    throw new Error(`File not found: ${key}`);
  }

  return item.content;
}

import { S3Client } from "bun";

/**
 * Storage module using Bun's S3 support.
 * Works with any S3-compatible provider (Supabase, AWS, Cloudflare R2, MinIO, etc.)
 *
 * Environment variables:
 * - S3_ENDPOINT: S3 endpoint URL (e.g., https://xxx.supabase.co/storage/v1/s3)
 * - S3_ACCESS_KEY_ID: Access key
 * - S3_SECRET_ACCESS_KEY: Secret key
 * - S3_BUCKET: Bucket name (default: "ingest-files")
 * - S3_REGION: Region (default: "auto")
 */

// Configuration from environment
const config = {
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET || "documents",
  region: process.env.S3_REGION || "auto",
};

// Lazy-initialized S3 client
let s3Client: S3Client | null = null;

function getClient(): S3Client {
  if (!s3Client) {
    if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error(
        "Missing S3 configuration. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY environment variables.",
      );
    }

    s3Client = new S3Client({
      endpoint: config.endpoint,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      bucket: config.bucket,
      region: config.region,
    });
  }
  return s3Client;
}

export type UploadOptions = {
  contentType?: string;
  metadata?: Record<string, string>;
};

export type UploadResult = {
  path: string;
  size: number;
  contentType: string;
};

export type DownloadResult = {
  data: Buffer;
  contentType: string;
  size: number;
};

/**
 * Upload a file to S3 storage
 */
export async function uploadFile(
  path: string,
  data: Buffer | Uint8Array | string,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const client = getClient();
  const file = client.file(path);

  const buffer = typeof data === "string" ? Buffer.from(data, "base64") : Buffer.from(data);
  const contentType = options.contentType || "application/octet-stream";

  await file.write(buffer, {
    type: contentType,
  });

  return {
    path,
    size: buffer.length,
    contentType,
  };
}

/**
 * Download a file from S3 storage
 */
export async function downloadFile(path: string): Promise<DownloadResult> {
  const client = getClient();
  const file = client.file(path);

  const exists = await file.exists();
  if (!exists) {
    throw new Error(`File not found: ${path}`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const data = Buffer.from(arrayBuffer);

  return {
    data,
    contentType: file.type || "application/octet-stream",
    size: file.size || data.length,
  };
}

/**
 * Delete a file from S3 storage
 */
export async function deleteFile(path: string): Promise<void> {
  const client = getClient();
  const file = client.file(path);
  await file.delete();
}

/**
 * Delete multiple files from S3 storage
 */
export async function deleteFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => deleteFile(path)));
}

/**
 * Check if a file exists in S3 storage
 */
export async function fileExists(path: string): Promise<boolean> {
  const client = getClient();
  const file = client.file(path);
  return file.exists();
}

/**
 * Get file metadata without downloading
 */
export async function getFileInfo(
  path: string,
): Promise<{ size: number; contentType: string } | null> {
  const client = getClient();
  const file = client.file(path);

  const exists = await file.exists();
  if (!exists) {
    return null;
  }

  return {
    size: file.size || 0,
    contentType: file.type || "application/octet-stream",
  };
}

/**
 * Generate a unique storage path for a file
 * @param entityId - The ID of the entity (candidate, requisition, etc.)
 * @param filename - Original filename
 */
export function generateStoragePath(
  entityId: string,
  filename: string,
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${entityId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Get the configured bucket name
 */
export function getBucketName(): string {
  return config.bucket;
}

/**
 * Storage configuration for different providers
 */
export const providerConfigs = {
  /**
   * Supabase Storage S3 configuration
   * Endpoint: https://<project-ref>.supabase.co/storage/v1/s3
   * Get credentials from: Supabase Dashboard > Settings > Storage > S3 Access Keys
   */
  supabase: (projectRef: string) => ({
    endpoint: `https://${projectRef}.supabase.co/storage/v1/s3`,
    region: "auto",
  }),

  /**
   * AWS S3 configuration
   */
  aws: (region: string) => ({
    endpoint: `https://s3.${region}.amazonaws.com`,
    region,
  }),

  /**
   * Cloudflare R2 configuration
   * Endpoint: https://<account-id>.r2.cloudflarestorage.com
   */
  cloudflareR2: (accountId: string) => ({
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  }),

  /**
   * MinIO configuration (self-hosted)
   */
  minio: (host: string, port: number = 9000, useSSL: boolean = false) => ({
    endpoint: `${useSSL ? "https" : "http"}://${host}:${port}`,
    region: "us-east-1",
  }),
};

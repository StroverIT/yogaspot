/** Vercel serverless functions reject request bodies above ~4.5 MB. */
export const MAX_STUDIO_IMAGE_BYTES = Math.floor(4.5 * 1024 * 1024);

export const MAX_STUDIO_IMAGE_SIZE_LABEL = '4,5 MB';

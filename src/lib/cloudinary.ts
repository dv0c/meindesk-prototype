import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_KEY_SECRET,
});

/**
 * Delete all resources in Cloudinary that have a specific tag
 * @param tag - The tag to search for (e.g., siteId)
 * @returns Result of the delete operation
 */
export async function deleteResourcesByTag(tag: string): Promise<{ deleted: number }> {
  try {
    // Delete all resources with this tag
    const result = await cloudinary.v2.api.delete_resources_by_tag(tag)
    console.log(`Cloudinary: Deleted resources with tag "${tag}"`, result)
    return { deleted: Object.keys(result.deleted || {}).length }
  } catch (error: any) {
    // If no resources found, that's ok
    if (error?.error?.http_code === 404) {
      console.log(`Cloudinary: No resources found with tag "${tag}"`)
      return { deleted: 0 }
    }
    console.error(`Cloudinary: Failed to delete resources with tag "${tag}"`, error)
    throw error
  }
}

export default cloudinary;

import cloudinary from "@/lib/cloudinary"
import {
  assertSiteAssetPublicId,
  assertSiteFolderPath,
} from "@/lib/media-folder-path"
import type { MediaFolderNode } from "@/types/media-gallery"

export {
  assertSiteAssetPublicId,
  assertSiteFolderPath,
  buildDefaultUploadFolder,
  getFolderFromPublicId,
  isDirectChildOfFolder,
  isUnderFolder,
  normalizeFolderPath,
} from "@/lib/media-folder-path"

async function listDirectSubFolders(path: string): Promise<{ name: string; path: string }[]> {
  try {
    const result = await cloudinary.v2.api.sub_folders(path)
    return (result.folders || []).map((f: { name: string; path: string }) => ({
      name: f.name,
      path: f.path,
    }))
  } catch (error: any) {
    // Empty / missing folder returns 404
    if (error?.error?.http_code === 404) {
      return []
    }
    throw error
  }
}

export async function buildFolderTree(siteId: string): Promise<MediaFolderNode[]> {
  const root = assertSiteFolderPath(siteId, siteId)

  async function walk(path: string): Promise<MediaFolderNode[]> {
    const children = await listDirectSubFolders(path)
    const nodes: MediaFolderNode[] = []

    for (const child of children) {
      const childPath = assertSiteFolderPath(siteId, child.path)
      nodes.push({
        name: child.name,
        path: childPath,
        children: await walk(childPath),
      })
    }

    return nodes.sort((a, b) => a.name.localeCompare(b.name))
  }

  return walk(root)
}

export async function createFolder(siteId: string, path: string): Promise<string> {
  const safePath = assertSiteFolderPath(siteId, path)
  if (safePath === siteId) {
    throw new Error("Cannot create the site root folder")
  }
  await cloudinary.v2.api.create_folder(safePath)
  return safePath
}

export async function deleteEmptyFolder(siteId: string, path: string): Promise<void> {
  const safePath = assertSiteFolderPath(siteId, path)
  if (safePath === siteId) {
    throw new Error("Cannot delete the site root folder")
  }

  const subfolders = await listDirectSubFolders(safePath)
  if (subfolders.length > 0) {
    throw new Error("Folder is not empty: remove subfolders first")
  }

  // Check for resources under this prefix
  const resources = await cloudinary.v2.api.resources({
    type: "upload",
    prefix: `${safePath}/`,
    resource_type: "image",
    max_results: 1,
  })

  if ((resources.resources || []).length > 0) {
    throw new Error("Folder is not empty: move or delete assets first")
  }

  await cloudinary.v2.api.delete_folder(safePath)
}

async function listAllResourcesWithPrefix(prefix: string): Promise<{ public_id: string }[]> {
  const all: { public_id: string }[] = []
  let nextCursor: string | undefined

  do {
    const result = await cloudinary.v2.api.resources({
      type: "upload",
      prefix: `${prefix}/`,
      resource_type: "image",
      max_results: 100,
      next_cursor: nextCursor,
    })
    for (const r of result.resources || []) {
      all.push({ public_id: r.public_id })
    }
    nextCursor = result.next_cursor
  } while (nextCursor)

  return all
}

export async function renameFolder(
  siteId: string,
  fromPath: string,
  toPath: string,
): Promise<string> {
  const from = assertSiteFolderPath(siteId, fromPath)
  const to = assertSiteFolderPath(siteId, toPath)

  if (from === siteId || to === siteId) {
    throw new Error("Cannot rename the site root folder")
  }
  if (from === to) return to
  if (to.startsWith(`${from}/`)) {
    throw new Error("Cannot move a folder into itself")
  }

  // Create destination folder (and parents)
  await cloudinary.v2.api.create_folder(to)

  // Move nested subfolders' structure by renaming all assets under from/
  const assets = await listAllResourcesWithPrefix(from)
  for (const asset of assets) {
    const relative = asset.public_id.slice(from.length) // starts with /
    const newPublicId = `${to}${relative}`
    await cloudinary.v2.uploader.rename(asset.public_id, newPublicId, {
      overwrite: false,
      invalidate: true,
    })
  }

  // Recreate empty nested folder structure under `to` for empty subfolders
  async function copyEmptyStructure(source: string, target: string) {
    const kids = await listDirectSubFolders(source)
    for (const kid of kids) {
      const childTarget = `${target}/${kid.name}`
      await cloudinary.v2.api.create_folder(childTarget)
      await copyEmptyStructure(kid.path, childTarget)
    }
  }
  await copyEmptyStructure(from, to)

  // Delete old folder tree bottom-up
  async function deleteTree(path: string) {
    const kids = await listDirectSubFolders(path)
    for (const kid of kids) {
      await deleteTree(kid.path)
    }
    try {
      await cloudinary.v2.api.delete_folder(path)
    } catch (error: any) {
      if (error?.error?.http_code !== 404) throw error
    }
  }
  await deleteTree(from)

  return to
}

export async function moveAsset(
  siteId: string,
  publicId: string,
  toFolder: string,
): Promise<{ public_id: string; secure_url: string }> {
  const from = assertSiteAssetPublicId(siteId, publicId)
  const folder = assertSiteFolderPath(siteId, toFolder)
  if (folder === siteId) {
    throw new Error("Choose a folder under the site, not the site root")
  }

  const filename = from.split("/").pop()
  if (!filename) {
    throw new Error("Invalid public_id")
  }

  const newPublicId = `${folder}/${filename}`
  if (newPublicId === from) {
    const info = await cloudinary.v2.api.resource(from, { resource_type: "image" })
    return { public_id: from, secure_url: info.secure_url }
  }

  const result = await cloudinary.v2.uploader.rename(from, newPublicId, {
    overwrite: false,
    invalidate: true,
  })

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
  }
}

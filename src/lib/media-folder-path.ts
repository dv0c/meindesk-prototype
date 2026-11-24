const SEGMENT_RE = /^[a-zA-Z0-9_-]+(?: [a-zA-Z0-9_-]+)*$/
const MAX_DEPTH = 12

export function normalizeFolderPath(path: string): string {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("/")
}

export function getFolderFromPublicId(publicId: string): string {
  const parts = publicId.split("/")
  if (parts.length <= 1) return ""
  return parts.slice(0, -1).join("/")
}

export function assertSiteFolderPath(siteId: string, path: string): string {
  if (!siteId || !/^[0-9a-fA-F]{24}$/.test(siteId)) {
    throw new Error("Invalid Site ID")
  }

  const normalized = normalizeFolderPath(path)

  if (!normalized || normalized === siteId) {
    return siteId
  }

  if (!normalized.startsWith(`${siteId}/`)) {
    throw new Error("Folder path must be under this site")
  }

  if (normalized.includes("..")) {
    throw new Error("Invalid folder path")
  }

  const segments = normalized.split("/")
  if (segments.length > MAX_DEPTH) {
    throw new Error("Folder nesting is too deep")
  }

  for (const segment of segments.slice(1)) {
    if (!SEGMENT_RE.test(segment)) {
      throw new Error(
        "Folder names may only contain letters, numbers, spaces, hyphens, and underscores",
      )
    }
  }

  return normalized
}

export function assertSiteAssetPublicId(siteId: string, publicId: string): string {
  const normalized = normalizeFolderPath(publicId)
  if (!normalized.startsWith(`${siteId}/`)) {
    throw new Error("Asset does not belong to this site")
  }
  if (normalized.includes("..")) {
    throw new Error("Invalid public_id")
  }
  return normalized
}

export function buildDefaultUploadFolder(siteId: string, selectedFolder: string | null): string {
  if (!selectedFolder || selectedFolder === "all" || selectedFolder === siteId) {
    return `${siteId}/uploads`
  }
  return assertSiteFolderPath(siteId, selectedFolder)
}

export function isDirectChildOfFolder(publicId: string, folderPath: string): boolean {
  const folder = getFolderFromPublicId(publicId)
  return folder === folderPath
}

export function isUnderFolder(publicId: string, folderPath: string): boolean {
  return publicId === folderPath || publicId.startsWith(`${folderPath}/`)
}

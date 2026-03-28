/** Author fields exposed on unauthenticated v1 APIs (no email or role). */
export const v1PublicAuthorSelect = {
  id: true,
  name: true,
  image: true,
  username: true,
} as const;

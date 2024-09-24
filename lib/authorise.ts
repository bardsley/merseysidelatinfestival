const superuser = "superadmin"
const grantUsage = {
  "all-admins": ["/admin"],
  "developer": ["#","/admin/users","/admin/stripe","/admin/import"],
  "content-manager": ['/admin/content'],
  "door-staff": ['/admin/ticketing','/admin/scan', '/admin/epos'],
}
// const grantView = {
//   "developer": { 
//     "thing": ["create","update","read","delete"],
//     "otherthing": ["create","update","read","delete"] 
//   }
// }


export const authUsage = (user,path) => {
  // Check could ever be allowed to do anything
  if(!authBasic(user)) return false
  
  const pathWithoutQueryString = path.split('?')[0]
  const roles = user.publicMetadata.roles
  // Superuser gets set to true always
  if(roles.includes(superuser)) return true
  // check through roles to see if any of them allow access to path
  return roles.some((role) => {
    if(!grantUsage[role]) return false // Roles doesn't exist in permissions
    return grantUsage[role] && grantUsage[role].includes(pathWithoutQueryString) 
  })
}

const authBasic = (user) => {
  // Make sure has metadata, admin and some roles 
  if(!user || !user.publicMetadata || !user.publicMetadata.admin || !user.publicMetadata.roles ) return false
  // Does it have roles?
  if(!Array.isArray(user.publicMetadata.roles)) return false
  return true
}
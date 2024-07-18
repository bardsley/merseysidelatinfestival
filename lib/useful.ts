export const deepCopy = (object: any) => {
  return JSON.parse(JSON.stringify(object))
}
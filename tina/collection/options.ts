export const locations = {
  ballroom: { title: "Ballroom", description: "",} ,
  derby: { title: "Derby", description: "",} ,
  hypostyle: { title: "Hypostyle", description: "",} ,
  terrace: { title: "Terrace", description: "",} ,
  sefton: { title: "Sefton", description: "",} ,
};
export const locationOptions = Object.keys(locations).map((loc) => ({label: locations[loc].title, value: loc}));
export const locations = {
  ballroom: { title: "Ballroom", description: "",} ,
  derby: { title: "Derby", description: "",} ,
  sefton: { title: "Sefton", description: "",} ,
  hypostyle: { title: "Hypostyle", description: "",} ,
  terrace: { title: "Terrace", description: "",} ,
  all: { title: "Reception", description: "" }
};
export const locationOptions = Object.keys(locations).map((loc) => ({label: locations[loc].title, value: loc}));
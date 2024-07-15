export const locations = {
  ballroom: { title: "Banqueting Hall", description: "",} ,
  derby: { title: "Derby Suite", description: "",} ,
  hypostyle: { title: "Hypostyle", description: "",} ,
  terrace: { title: "Terrace", description: "",} ,
};
export const locationOptions = Object.keys(locations).map((loc) => ({label: locations[loc].title, value: loc}));
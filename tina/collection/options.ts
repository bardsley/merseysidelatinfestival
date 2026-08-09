export const locations = {
  ballroom: { title: "Ballroom", description: "",} ,
  derby: { title: "Derby", description: "",} ,
  sefton: { title: "Sefton", description: "",} ,
  hypostyle: { title: "Hypostyle", description: "",} ,
  terrace: { title: "Terrace", description: "",} ,
  kensington: { title: "Kensington", description: "",} ,
  kensington1: { title: "Kensington 1", description: "",} ,
  kensington2: { title: "Kensington 2", description: "",} ,
  all: { title: "Reception", description: "" }
};
export const locationOptions = Object.keys(locations).map((loc) => ({label: locations[loc].title, value: loc}));

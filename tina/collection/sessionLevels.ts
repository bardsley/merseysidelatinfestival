export const levels = {
  advanced: { title: "Advanced", colour: "#ff5757",} ,
  intermediate: { title: "Intermediate", colour: "#ff914d",} ,
  improver: { title: "Improver", colour: "#ffde59",} ,
  beginner: { title: "Beginner", colour: "#7ed957",} ,
  all: { title: "Suitable for All", colour: "#0cc0df",} ,
  party: { title: "Party & Celebrations", colour: '#d0e5f1' },
  shows: { title: "Shows", colour: '#ff66c4' },
  admin: { title: "Registration & Admin", colour: '#2f454b'}
};
export const levelOptions = Object.keys(levels).map((lvl) => ({label: levels[lvl].title, value: lvl}));
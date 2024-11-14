export const levels = {
  advanced: { title: "Advanced", colour: "#ff5757",} ,
  intermediate: { title: "Intermediate", colour: "#ff914d",} ,
  improvers: { title: "Improvers", colour: "#ffde59",} ,
  beginner: { title: "Beginner", colour: "#7ed957",} ,
  all: { title: "Suitable for All", colour: "#0cc0df",} ,
};
export const levelOptions = Object.keys(levels).map((lvl) => ({label: levels[lvl].title, value: lvl}));
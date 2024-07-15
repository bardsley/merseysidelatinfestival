import type { Collection } from "tinacms";
import { locationOptions } from "./options";

const Class: Collection = {
  label: "Classes & Sessions",
  name: "class",
  path: "content/classes",
  format: "mdx",
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
      isTitle: true,
      required: true,
    },
    {
      type: "rich-text",
      label: "Details",
      name: "details",
    },
    {
      type: "reference",
      label: "Artist",
      name: "artist",
      collections: ["artist"],
    },
    {
      type: "datetime",
      label: "Date",
      name: "date",
      ui: {
        dateFormat: "MMMM DD YYYY",
        timeFormat: "hh:mm A",
      },
    },
    {
      type: "string",
      label: "Location",
      name: "location",
      options: locationOptions
    },
  ]
}

export default Class;
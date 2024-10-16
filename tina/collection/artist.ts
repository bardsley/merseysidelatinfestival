import type { Collection } from "tinacms";


const Artist: Collection = {
  label: "Artists",
  name: "artist",
  path: "content/artists",
  format: "mdx",
  ui: {
    router: ({ document }) => {                  
      return `/artists/${document._sys.breadcrumbs.join("/")}`;
    },
    filename: {
      // Example of using a custom slugify function
      slugify: (values) => {
        // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
        return `${values?.name
          ?.toLowerCase()
          .replace(/ /g, '-')}`
      },
    },
  },
  fields: [
    {
      type: "string",
      label: "Name",
      name: "name",
      isTitle: true,
      required: true,
    },
    {
      type: "image",
      label: "Avatar",
      name: "avatar",
    },
    {
      type: "object",
      label: "Social Media",
      name: "socials",
      list: true,
      ui: {
        itemProps: (item) => {
          // Field values are accessed by item?.<Field name>
          return { label: [item?.type,item?.handle].join(': ') };
        },
      },
      fields: [
        {
          type: "string",
          label: "Handle",
          name: "handle",
          required: true,
        },
        {
          type: "string",
          label: "URL",
          name: "url",
          required: true,
        },
        {
          type: "string",
          label: "Type",
          name: "type",
          required: true,
          options: [
            { label: "Twitter", value: "twitter" },
            { label: "Instagram", value: "instagram" },
            { label: "Facebook", value: "facebook" },
            { label: "LinkedIn", value: "linkedin" },
            { label: "GitHub", value: "github" },
            { label: "YouTube", value: "youtube" },
            { label: "Twitch", value: "twitch" },
          ],
        }
      ]
    },
    {
      type: "rich-text",
      label: "About",
      name: "about",
      isBody: true,
    },
  ],
};
export default Artist;

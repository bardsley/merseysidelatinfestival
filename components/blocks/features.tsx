"use client";
import {
  PageBlocksFeatures,
  PageBlocksFeaturesItems,
} from "@tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { Icon } from "../icon";
import { Section } from "../layout/section";
import { Container } from "../layout/container";
import { iconSchema } from "../../tina/fields/icon";
import DiscountCode from "../content/discountCode";
const components = { DiscountCode }

const proseClasses = "prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl \
prose-a:text-chillired-600 hover:prose-a:text-chillired-800 \
prose-blockquote:border prose-blockquote:border-richblack-700 prose-blockquote:p-6 prose-blockquote:rounded-md prose-blockquote:text-xl prose-blockquote:m-3 prose-blockquote:bg-richblack-500 \
prose-p:mb-3 \
prose-strong:font-semibold \
prose-ul:list-disc    prose-ul:list-outside prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-left \
prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6 prose-ol:mb-6 \
prose-li:mb-2\
"

export const Feature = ({
  featuresColor,
  data,
}: {
  featuresColor: string;
  data: PageBlocksFeaturesItems;
}) => {
  return (
    <div
      data-tina-field={tinaField(data)}
      className="flex-1 flex flex-col gap-6 text-center items-center lg:items-start lg:text-left max-w-xl mx-auto"
      style={{ flexBasis: "16rem" }}
    >
      {data.icon && (
        <Icon
          tinaField={tinaField(data, "icon")}
          parentColor={featuresColor}
          data={{ size: "large", ...data.icon }}
        />
      )}
      {data.title && (
        <h3
          data-tina-field={tinaField(data, "title")}
          className="text-2xl font-semibold title-font"
        >
          {data.title}
        </h3>
      )}
      {data.details && (
        <div
          data-tina-field={tinaField(data, "details")}
          className={["prose-base leading-tight text-justify",proseClasses].join(',')}
        >
          <TinaMarkdown content={data.details} components={components}/> 
        </div>
      )}
    </div>
  );
};

export const Features = ({ data }: { data: PageBlocksFeatures }) => {
  return (
    <Section color={data.color}>
      {data.title && (
        <Container className={`flex flex-wrap gap-x-10 gap-y-2 justify-center md:justify-start text-left`} size="small">
        <h2
          data-tina-field={tinaField(data, "title")}
          className="text-4xl font-bold title-font"
        >
          {data.title}
        </h2>
        </Container>
      )}
      
      <Container
        className={`flex flex-wrap gap-x-10 gap-y-8 text-left`}
        size={data.title ? "small" : "small" }
      >
        {data.items &&
          data.items.map(function (block, i) {
            return <Feature featuresColor={data.color} key={i} data={block} />;
          })}
      </Container>
    </Section>
  );
};

const defaultFeature = {
  title: "Here's Another Feature",
  text: "This is where you might talk about the feature, if this wasn't just filler text.",
  icon: {
    color: "",
    style: "float",
    name: "",
  },
};

export const featureBlockSchema = {
  name: "features",
  label: "Features",
  ui: {
    previewSrc: "/blocks/features.png",
    defaultItem: {
      items: [defaultFeature, defaultFeature, defaultFeature],
    },
    itemProps: (item) => {
      return { label: `Features - ${item?.title || "No Title"}` };
    },
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
    },
    {
      type: "object",
      label: "Feature Items",
      name: "items",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.title,
          };
        },
        defaultItem: {
          ...defaultFeature,
        },
      },
      fields: [
        iconSchema,
        {
          type: "string",
          label: "Title",
          name: "title",
        },
        {
          type: "rich-text",
          label: "Details",
          name: "details",
          templates: [
            {
              name: "DiscountCode",
              label: "Discount Code",
              fields: [
                {
                  name: "code",
                  label: "Code",
                  type: "string",
                }
              ],
            },
          ]
        }
      ],
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" },
        { label: "No Colour", value: "transparent" },
      ],
    },
  ],
};

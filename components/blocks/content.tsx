"use client";
import React from "react";

import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { Template } from "tinacms";
import { PageBlocksContent } from "../../tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Container } from "../layout/container";
import { Section } from "../layout/section";
import BuyButton from "../content/buybutton";

const components = { BuyButton }

export const Content = ({ data }: { data: PageBlocksContent }) => {
  return (
    <Section color={data.color}>
      <Container
        className={`prose prose-lg ${
          data.color === "primary" ? `prose-primary` : `dark:prose-dark`
        }`}
        data-tina-field={tinaField(data, "body")}
        size="large"
        width={data.width || 'medium'}  
      >
        <TinaMarkdown content={data.body} components={components}/>
      </Container>
    </Section>
  );
};

export const contentBlockSchema: Template = {
  name: "content",
  label: "Content",
  ui: {
    previewSrc: "/blocks/content.png",
    defaultItem: {
      body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.",
    },
  },
  fields: [
    {
      type: "rich-text",
      label: "Body",
      name: "body",
      templates: [
        {
          name: "BuyButton",
          label: "BuyButton",
          fields: [
            {
              name: "description",
              label: "Description",
              type: "rich-text",
            },
            {
              name: "buttonid",
              label: "Buy Button Type",
              type: "string",
              options: [
                {
                  value: 'buy_btn_1PX2hYEWkmdeWsQPpM9k8WFI',
                  label: 'Student',
                },
                {
                  value: 'buy_btn_1PX2eZEWkmdeWsQPvSMRezVD',
                  label: 'Normal',
                },
              ],
            }
          ],
        },
      ]
    },
    {
      type: "string",
      label: "Width",
      name: "width",
      options: [
        { label: "Full Width", value: "large" },
        { label: "Thinner", value: "medium" },
        { label: "Thin", value: "small" },
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
      ],
    },
  ],
};

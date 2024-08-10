"use client";
import React from "react";

import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { Template } from "tinacms";
import { PageBlocksContent } from "@tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Container } from "../layout/container";
import { Section } from "../layout/section";
import BuyButton, { BuyButtonTemplate } from "../content/buybutton";
import CountdownElement, { CountdownElementTemplate } from "../content/countdown";
import {  RichTextTemplate } from "@tinacms/schema-tools"

const components = { BuyButton, CountdownElement }

const proseClasses = "prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl \
prose-a:text-chillired-600 hover:prose-a:text-chillired-800 \
prose-blockquote:border prose-blockquote:border-richblack-700 prose-blockquote:p-6 prose-blockquote:rounded-md prose-blockquote:text-xl prose-blockquote:m-3 prose-blockquote:bg-richblack-500 \
prose-p:mb-3 \
prose-strong:font-semibold \
prose-ul:list-disc    prose-ul:list-outside prose-ul:pl-6 prose-ul:mb-6 \
prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6 prose-ol:mb-6 \
prose-li:mb-2\
"

export const Content = ({ data }: { data: PageBlocksContent }) => {
  const className = data.textsize && data.textsize !== 'default' 
    ? `prose-${data.textsize}`
    : data.color === "primary" ? `prose-primary` : `dark:prose-dark`
  return (
    <Section color={data.color}>
      <Container
        className={[className,proseClasses].join(" ")}
        data-tina-field={tinaField(data, "body")}
        size={data.padding || "large"}
        width={data.width || 'medium'}  
      >
        <TinaMarkdown content={data.body} components={components} />
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
        BuyButtonTemplate as RichTextTemplate,
        CountdownElementTemplate as RichTextTemplate
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
    {
      type: "string",
      label: "Padding",
      name: "padding",
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ],
    },
    {
      type: "string",
      label: "Text Size",
      name: "textsize",
      options: [
        { label: "Default", value: "default" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "base" },
        { label: "Large", value: "lg" },
        { label: "XL", value: "xl" },
      ],
    },
  ],
};

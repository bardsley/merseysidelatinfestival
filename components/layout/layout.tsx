import React, { PropsWithChildren } from "react";
import { LayoutProvider } from "./layout-context";
import client from "@tina/__generated__/client";
import Header from "../nav/header";
import Footer from "../nav/footer";
import { cn } from "../../lib/utils";

type LayoutProps = PropsWithChildren & {
  rawPageData?: any;
};

export default async function Layout({ children, rawPageData }: LayoutProps) {
  const { data: globalData } = await client.queries.global({
    relativePath: "index.json",
  });

  return (
    <LayoutProvider globalSettings={globalData.global} pageData={rawPageData}>
      <Header header={globalData.global.header} theme={globalData.global.theme} />
      <main id="app"
        className={cn(
          "font-sans flex-1 text-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-richblack-500 dark:to-richblack-600 flex flex-col"
        )}
      >
        {children}
      </main>
      <Footer />
    </LayoutProvider>
  );
}

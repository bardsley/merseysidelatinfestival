import React, { FC, PropsWithChildren } from "react";
import { LayoutProvider } from "./layout-context";
import client from "@tina/__generated__/client";
import Header from "../nav/header";
import Footer from "../nav/footer";
import { cn } from "../../lib/utils";

type LayoutProps = PropsWithChildren & {
  rawPageData?: any;
  cleanLayout?: boolean
};

const defaultProps = {
  cleanLayout: false,
} satisfies Partial<LayoutProps>

const Layout: FC<LayoutProps> = async (props) => {

  const propsWithDefaults = {
    ...defaultProps,
    ...props,
  }

  const { data: globalData } = await client.queries.global({
    relativePath: "index.json",
  });

  return (
    <LayoutProvider globalSettings={globalData.global} pageData={propsWithDefaults.rawPageData}>
      { propsWithDefaults.cleanLayout ? null : <Header header={globalData.global.header} theme={globalData.global.theme} /> }
      <main id="app"
        className={cn(
          "font-sans flex-1 text-gray-800 bg-gradient-to-br from-richblack-500 to-richblack-600 flex flex-col"
        )}
      >
        {props.children}
      </main>
      { propsWithDefaults.cleanLayout ? null : <Footer /> }
    </LayoutProvider>
  );
}

export default Layout
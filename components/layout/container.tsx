import React from "react";
import { cn } from "../../lib/utils";

export const Container = ({
  children,
  size = "medium",
  width = "large",
  className = "",
  padding = `default`,
  ...props
}) => {
  const verticalPadding = {
    custom: "",
    small: "container-small my-4 md:my-8",
    medium: "container-medium my-6 md:my-12",
    large: "container-large my-12 md:my-24",
    default: "container-default my-6 md:my-12",
  };
  const widthClass = {
    small: "max-w-4xl",
    medium: "max-w-5xl",
    large: "max-w-7xl",
    huge: "max-w-8xl",
    custom: "",
  };
  const paddingClass = {
    default: 'mx-auto px-4 md:px-8',
    tight: 'mx-auto px-0 md:px-0',
  }

  return (
    <div
      className={cn(
        widthClass[width],
        paddingClass[padding],
        verticalPadding[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

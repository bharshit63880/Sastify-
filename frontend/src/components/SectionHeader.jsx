import React from "react";
import { SectionIntro } from "./ui/Section";

export const SectionHeader = ({ eyebrow, title, description, action }) => {
  return <SectionIntro eyebrow={eyebrow} title={title} description={description} action={action} />;
};

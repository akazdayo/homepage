import * as linuxMessage from "./linux.md";
import * as nixosMessage from "./nixos.md";
import * as pythonMessage from "./python.md";
import * as rustMessage from "./rust.md";
import * as twitterMessage from "./twitter.md";
import * as typescriptMessage from "./typescript.md";
import * as vimMessage from "./vim.md";
import * as vrchatMessage from "./vrchat.md";

type IconMessage = {
  content: string;
  frontmatter: Record<string, any>;
};
export type Icons = Record<string, IconMessage>;
const allImports = [
  linuxMessage,
  nixosMessage,
  pythonMessage,
  rustMessage,
  twitterMessage,
  typescriptMessage,
  vimMessage,
  vrchatMessage,
];

export const allMessages: Icons = Object.fromEntries(
  await Promise.all(
    allImports.map(async (x) => {
      const content = await x.compiledContent();
      return [x.frontmatter.title, { content, frontmatter: x.frontmatter }];
    }),
  ),
);

import * as linuxMessage from "./linux.md";
import * as nixosMessage from "./nixos.md";
import * as rustMessage from "./rust.md";
import * as typescriptMessage from "./typescript.md";
import * as vimMessage from "./vim.md";

type IconMessage = {
  content: string;
  frontmatter: Record<string, any>;
};
export type Icons = Record<string, IconMessage>;
const allImports = [
  linuxMessage,
  nixosMessage,
  rustMessage,
  typescriptMessage,
  vimMessage,
];

export const allMessages: Icons = Object.fromEntries(
  await Promise.all(
    allImports.map(async (x) => {
      const content = await x.compiledContent();
      return [x.frontmatter.title, { content, frontmatter: x.frontmatter }];
    }),
  ),
);

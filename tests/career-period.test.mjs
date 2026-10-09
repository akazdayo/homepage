import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Run `astro build` before `node --test tests/career-period.test.mjs`.
const html = readFileSync(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const careerList = html.match(/<ol[^>]*id="career-list"[\s\S]*?<\/ol>/)?.[0];
assert.ok(careerList, "Built page contains the career list");

const periodFor = (title) => {
  const item = careerList.split("<li").find((entry) => entry.includes(title));
  assert.ok(item, `Career entry exists: ${title}`);
  return item.match(/<p\b[^>]*>([^<]*)<\/p>/)?.[1].trim();
};

test("a year-only entry does not invent a month or day", () => {
  assert.equal(periodFor("アプリ甲子園"), "2023");
});

test("a year-month entry does not invent a day", () => {
  assert.equal(periodFor("西澤育英基金 2026年度採択"), "2026-06");
});

test("a full date is displayed in YEAR-MONTH-DAY order", () => {
  assert.equal(
    periodFor("セキュリティ・キャンプ2026ミニ（愛知開催）"),
    "2026-09-12",
  );
  assert.equal(periodFor("N高等学校"), "2025-04-01");
});

import { describe, expect, it } from "vitest";
import { applyAndValidateNavigationOperation } from "./navigation-admin";
import { validateCategoryMap } from "./navigation";
import type { CategoryMap } from "../config";

const validCategories: CategoryMap = {
  常用: [
    { name: "GitHub", url: "https://github.com" },
    { name: "Vercel", url: "https://vercel.com" },
  ],
  学习: [
    { name: "ArXiv", url: "https://arxiv.org" },
  ],
};

describe("validateCategoryMap", () => {
  it("rejects invalid URLs", () => {
    expect(() =>
      validateCategoryMap({
        常用: [{ name: "Bad URL", url: "ftp://example.com" }],
      })
    ).toThrow(/http\(s\)/);
  });

  it("rejects duplicate URLs across categories", () => {
    expect(() =>
      validateCategoryMap({
        常用: [{ name: "GitHub", url: "https://github.com" }],
        工具: [{ name: "GitHub Mirror", url: "https://github.com" }],
      })
    ).toThrow(/重复网址/);
  });

  it("rejects empty category names", () => {
    expect(() =>
      validateCategoryMap({
        " ": [{ name: "GitHub", url: "https://github.com" }],
      })
    ).toThrow(/分类名不能为空/);
  });
});

describe("applyAndValidateNavigationOperation", () => {
  it("moves a link across categories", () => {
    const result = applyAndValidateNavigationOperation(validCategories, {
      action: "move_link",
      fromCategory: "常用",
      fromIndex: 0,
      toCategory: "学习",
      toIndex: 1,
    });

    expect(result.next["常用"].map((link) => link.name)).toEqual(["Vercel"]);
    expect(result.next["学习"].map((link) => link.name)).toEqual(["ArXiv", "GitHub"]);
  });

  it("rejects deleting the last category", () => {
    expect(() =>
      applyAndValidateNavigationOperation(
        {
          常用: [{ name: "GitHub", url: "https://github.com" }],
        },
        {
          action: "delete_category",
          name: "常用",
        }
      )
    ).toThrow(/At least one category/);
  });
});

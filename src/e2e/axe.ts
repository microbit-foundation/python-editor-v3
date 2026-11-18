/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import AxeBuilder from "@axe-core/playwright";
import { Page, test } from "@playwright/test";
import { createRequire } from "module";
import path from "path";

interface KnownViolation {
  /** axe rule id. */
  rule: string;
  /**
   * What the rule tests, from axe's tags for it: a WCAG conformance level, or
   * an axe best practice that no WCAG success criterion requires.
   */
  level: "A" | "AA" | "best-practice";
  /** The WCAG success criterion, for A and AA. */
  criterion?: string;
  /** Elements the rule is known to fail on, as a CSS selector. */
  selector: string;
  reason: string;
}

/**
 * Violations we know about and have not fixed yet. A scan fails only on
 * violations that aren't listed here, so fixing one means deleting its entry.
 *
 * The list is recorded against the Foundation's private theme
 * (@microbit-foundation/python-editor-v3-microbit), which is what CI and
 * the deployed editor use. Colours come from the theme, so without it (a fork,
 * or a checkout that hasn't installed it) the colour-contrast results are
 * different and that rule is skipped. See themeDependentRules.
 */
const knownViolations: KnownViolation[] = [
  {
    rule: "color-contrast",
    level: "AA",
    criterion: "1.4.3 Contrast (Minimum)",
    selector: ".cm-gutterElement",
    reason: "Editor line numbers are 2.02:1 against the gutter.",
  },
  {
    rule: "color-contrast",
    level: "AA",
    criterion: "1.4.3 Contrast (Minimum)",
    selector: ".sidebar-tab p",
    reason:
      "Unselected sidebar tab labels are 4.3:1 against the tab bar at 13px.",
  },
  {
    rule: "label-title-only",
    level: "best-practice",
    selector: 'input[type="range"][aria-describedby]',
    reason:
      "False positive: the rule only accepts a <label> element, so it fails any input that has a description but is named another way. The sound level slider is described by its thresholds and named by aria-label, which matches the module's visible heading.",
  },
  {
    rule: "region",
    level: "best-practice",
    selector: ".splitView__splitter",
    reason:
      "The resize handles sit between the landmarks they resize. Wrapping the workbench in another region just to contain them would only add noise for screen reader users.",
  },
];

/**
 * Rules whose results depend on the theme's colours. The known violations
 * above only describe the Foundation theme, so these rules are skipped when
 * the app is running with the open source default theme.
 */
const themeDependentRules = ["color-contrast"];

const hasFoundationTheme = (() => {
  try {
    createRequire(path.join(process.cwd(), "package.json")).resolve(
      "@microbit-foundation/python-editor-v3-microbit/panda-preset"
    );
    return true;
  } catch {
    return false;
  }
})();

interface NodeSummary {
  target: string;
  html: string;
  failureSummary?: string;
}

interface ViolationSummary {
  id: string;
  impact?: string | null;
  help: string;
  helpUrl: string;
  nodes: NodeSummary[];
}

const format = (violations: ViolationSummary[]): string => {
  const lines = [
    `${violations.length} accessibility violation(s) not in knownViolations (src/e2e/axe.ts):`,
  ];
  for (const v of violations) {
    lines.push("", `${v.id} (${v.impact ?? "n/a"}): ${v.help}`, v.helpUrl);
    for (const n of v.nodes) {
      lines.push(`  ${n.target}`, `    ${n.html}`);
      if (n.failureSummary) {
        lines.push(
          ...n.failureSummary.split("\n").map((line) => `    ${line}`)
        );
      }
    }
  }
  return lines.join("\n");
};

/**
 * Scans the page in its current state with axe and fails on any violation
 * that isn't in knownViolations.
 */
export const expectNoNewViolations = async (page: Page): Promise<void> => {
  // A scan part-way through a fade reports the blended colours as contrast
  // failures. Looping animations (the editor cursor) never finish.
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
        .map((a) => a.finished)
    )
  );

  let builder = new AxeBuilder({ page })
    // The simulator is a separate, cross-origin deployment with its own
    // tests. Its content also hides page-level results for this document:
    // its h1 satisfies page-has-heading-one.
    .exclude("iframe");
  if (!hasFoundationTheme) {
    builder = builder.disableRules(themeDependentRules);
  }
  const { violations } = await builder.analyze();

  const candidates = violations.flatMap((v) =>
    v.nodes.map((n) => ({
      target: n.target.join(" "),
      known: knownViolations
        .filter((k) => k.rule === v.id)
        .map((k) => k.selector),
    }))
  );
  const isKnown = await page.evaluate(
    (candidates) =>
      candidates.map(({ target, known }) => {
        const element = document.querySelector(target);
        return !!element && known.some((selector) => element.matches(selector));
      }),
    candidates
  );

  let index = 0;
  const unexpected: ViolationSummary[] = [];
  for (const v of violations) {
    const nodes = v.nodes.filter(() => !isKnown[index++]);
    if (nodes.length > 0) {
      unexpected.push({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: nodes.map((n) => ({
          target: n.target.join(" "),
          html: n.html,
          failureSummary: n.failureSummary,
        })),
      });
    }
  }

  if (unexpected.length > 0) {
    await test.info().attach("axe-violations.json", {
      body: JSON.stringify(unexpected, null, 2),
      contentType: "application/json",
    });
    throw new Error(format(unexpected));
  }
};

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CompareNotice } from "./CompareNotice";

const draw = (props: Partial<Parameters<typeof CompareNotice>[0]> = {}) =>
  renderToStaticMarkup(<CompareNotice title="Compare like with like" message="You are comparing Sunscreens, so only Sunscreens can be added." onClose={() => {}} {...props} />);

describe("the compare message", () => {
  it("shows the title and the reason, announced as an alert, with two ways to close it", () => {
    const html = draw();
    expect(html).toContain('role="alert"');
    expect(html).toContain("Compare like with like");
    expect(html).toContain("only Sunscreens can be added");
    expect(html).toContain('aria-label="Close this message"');
    expect(html).toMatch(/>Close<\/button>/);
  });

  it("offers the filter button only when there is something to apply", () => {
    expect(draw()).not.toContain("Show only");
    expect(draw({ actionLabel: "Show only Sunscreens", onAction: () => {} })).toContain("Show only Sunscreens");
    // A label with no action to run is not drawn: a button that does nothing is worse than none.
    expect(draw({ actionLabel: "Show only Sunscreens" })).not.toContain("Show only");
  });
});

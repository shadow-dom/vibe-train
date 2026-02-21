import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { StatsCard, HealthBadge } from "./StatsCard.jsx";

describe("StatsCard", () => {
  it("renders label and value", () => {
    render(() => <StatsCard label="Revenue" value={1234} />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("renders with a unit", () => {
    render(() => <StatsCard label="Temperature" value={72} unit="°F" />);
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("°F")).toBeInTheDocument();
    expect(screen.getByText("°F").className).toBe("stats-unit");
  });

  it("does not render unit span when no unit provided", () => {
    const { container } = render(() => <StatsCard label="Count" value={5} />);
    expect(container.querySelector(".stats-unit")).toBeNull();
  });

  it("has the stats-card class", () => {
    const { container } = render(() => <StatsCard label="Test" value={0} />);
    expect(container.querySelector(".stats-card")).toBeInTheDocument();
  });
});

describe("HealthBadge", () => {
  it("renders the status text", () => {
    render(() => <HealthBadge status="good" />);
    expect(screen.getByText("good")).toBeInTheDocument();
  });

  it("has badge and status-specific classes", () => {
    render(() => <HealthBadge status="warning" />);
    const badge = screen.getByText("warning");
    expect(badge.className).toContain("badge");
    expect(badge.className).toContain("badge-warning");
  });

  it("renders different statuses", () => {
    const { unmount } = render(() => <HealthBadge status="critical" />);
    const badge = screen.getByText("critical");
    expect(badge.className).toContain("badge-critical");
    unmount();
  });
});

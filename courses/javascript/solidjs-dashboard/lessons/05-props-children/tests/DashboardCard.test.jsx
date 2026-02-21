import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { DashboardCard, DashboardGrid, IconLabel } from "./DashboardCard.jsx";

describe("DashboardCard", () => {
  it("renders the title", () => {
    render(() => <DashboardCard title="Sales">Content here</DashboardCard>);
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(() => (
      <DashboardCard title="Stats">
        <p>Some stats content</p>
      </DashboardCard>
    ));
    expect(screen.getByText("Some stats content")).toBeInTheDocument();
  });

  it("has the dashboard-card class", () => {
    const { container } = render(() => (
      <DashboardCard title="Test">body</DashboardCard>
    ));
    expect(container.querySelector(".dashboard-card")).toBeInTheDocument();
  });
});

describe("DashboardGrid", () => {
  it("defaults to 3 columns", () => {
    const { container } = render(() => (
      <DashboardGrid>
        <div>A</div>
        <div>B</div>
      </DashboardGrid>
    ));
    const grid = container.querySelector(".dashboard-grid");
    expect(grid.style.getPropertyValue("grid-template-columns")).toBe("repeat(3, 1fr)");
  });

  it("uses custom columns", () => {
    const { container } = render(() => (
      <DashboardGrid columns={2}>
        <div>A</div>
      </DashboardGrid>
    ));
    const grid = container.querySelector(".dashboard-grid");
    expect(grid.style.getPropertyValue("grid-template-columns")).toBe("repeat(2, 1fr)");
  });

  it("renders children", () => {
    render(() => (
      <DashboardGrid>
        <div>Grid Item</div>
      </DashboardGrid>
    ));
    expect(screen.getByText("Grid Item")).toBeInTheDocument();
  });
});

describe("IconLabel", () => {
  it("renders icon and label", () => {
    render(() => <IconLabel icon="📊" label="Charts" />);
    expect(screen.getByText(/📊/)).toBeInTheDocument();
    expect(screen.getByText(/Charts/)).toBeInTheDocument();
  });

  it("has the icon-label class", () => {
    const { container } = render(() => <IconLabel icon="🔥" label="Hot" />);
    expect(container.querySelector(".icon-label")).toBeInTheDocument();
  });

  it("forwards additional attributes", () => {
    const { container } = render(() => (
      <IconLabel icon="✅" label="Done" data-testid="my-label" />
    ));
    expect(screen.getByTestId("my-label")).toBeInTheDocument();
  });
});

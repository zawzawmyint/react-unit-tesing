import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

describe("Greeting", () => {
  test("renders greeting message", () => {
    render(<Greeting />);
    const greetingElement = screen.getByText("Greeting");
    expect(greetingElement).toBeInTheDocument();
  });
});

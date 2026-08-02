import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import MoneyInput from "./MoneyInput";

function Harness({ onValue }: { onValue: (v: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <MoneyInput
      label="Amount"
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

describe("MoneyInput", () => {
  it("shows brazilian currency but reports an ISO decimal string", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();

    render(<Harness onValue={onValue} />);
    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.keyboard("123456");

    expect(onValue).toHaveBeenLastCalledWith("1234.56");
    expect((input as HTMLInputElement).value.replace(/ /g, " ")).toBe("R$ 1.234,56");
  });

  it("never emits a comma to the API", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();

    render(<Harness onValue={onValue} />);
    await user.click(screen.getByRole("textbox"));
    await user.keyboard("999");

    for (const call of onValue.mock.calls) {
      expect(call[0]).not.toContain(",");
      expect(call[0]).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it("removes the last digit on backspace", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();

    render(<Harness onValue={onValue} />);
    await user.click(screen.getByRole("textbox"));
    await user.keyboard("1000");
    expect(onValue).toHaveBeenLastCalledWith("10.00");

    await user.keyboard("{Backspace}");
    expect(onValue).toHaveBeenLastCalledWith("1.00");
  });

  it("caps the value instead of overflowing", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();

    render(<Harness onValue={onValue} />);
    await user.click(screen.getByRole("textbox"));
    await user.keyboard("99999999999");

    const last = onValue.mock.calls.at(-1)?.[0];
    expect(Number(last)).toBeLessThanOrEqual(9_999_999.99);
  });

  it("renders empty rather than zero when there is no value", () => {
    render(<Harness onValue={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { validLoginInput } from "@/tests/fixtures/auth";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/app/(auth)/login/actions", () => ({
  login: mocks.login,
}));

describe("LoginForm smoke", () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.replace.mockReset();
    mocks.refresh.mockReset();
  });

  it("renders and submits the login form", async () => {
    const user = userEvent.setup();
    mocks.login.mockResolvedValue({ success: true });

    render(<LoginForm />);

    const emailInput = screen.getByRole("textbox", { name: "E-mail" });
    const passwordInput = screen.getByLabelText("Senha");
    const submitButton = screen.getByRole("button", { name: "Entrar" });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeEnabled();

    await user.type(emailInput, validLoginInput.email);
    await user.type(passwordInput, validLoginInput.password);
    await user.click(submitButton);

    expect(mocks.login).toHaveBeenCalledWith(validLoginInput);
    expect(mocks.replace).toHaveBeenCalledWith("/");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});

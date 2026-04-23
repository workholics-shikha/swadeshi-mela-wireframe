import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginWithEmailPassword, requestPasswordReset, resetPasswordWithCode } from "@/lib/auth";

const inputClassName =
  "w-full rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary)/0.15)]";

type ViewMode = "login" | "forgot" | "reset";

const VendorLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedResetCode, setGeneratedResetCode] = useState<string | null>(null);

  function switchView(nextView: ViewMode) {
    setViewMode(nextView);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const user = await loginWithEmailPassword(email, password);
      const requested = searchParams.get("redirect");

      if (requested === "admin" && user.role !== "admin") {
        setError("Only admin users can access the Admin Dashboard.");
        return;
      }

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/vendor/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login right now");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email);
      setGeneratedResetCode(response.resetCode || null);
      setSuccess(
        response.resetCode
          ? `${response.message} Your reset code is ${response.resetCode}.`
          : response.message,
      );
      setViewMode("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate reset code");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Confirm password does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPasswordWithCode(email, resetCode, newPassword);
      setSuccess(response.message || "Password updated successfully.");
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
      setGeneratedResetCode(null);
      setViewMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    viewMode === "login"
      ? "Sign in to continue"
      : viewMode === "forgot"
        ? "Forgot your password?"
        : "Reset your password";

  const description =
    viewMode === "login"
      ? "Sign in with your registered email and password."
      : viewMode === "forgot"
        ? "Enter your registered email to generate a short-lived reset code."
        : "Enter the reset code and choose a new password for your account.";

  return (
    <div className="relative min-h-screen overflow-hidden bg-festive-admin px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-[hsl(var(--gold)/0.24)] blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-72 w-72 rounded-full bg-[hsl(var(--green-india)/0.16)] blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-[hsl(var(--maroon)/0.12)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
        <div className="w-full rounded-[32px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.92)] p-6 shadow-elevated backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--saffron))_0%,hsl(var(--maroon))_100%)] text-lg font-extrabold text-white shadow-[0_16px_32px_hsl(var(--maroon)/0.22)]">
                S
              </div>
              <div>
                <p className="text-lg font-extrabold text-[hsl(var(--foreground))]">Swadeshi Mela</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin & Vendor sign in</p>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary)/0.45)] hover:text-[hsl(var(--foreground))]"
              onClick={() => navigate("/")}
              type="button"
            >
              Back to site
            </button>
          </div>

          <div className="mt-8">
            <h1 className="mt-3 font-display text-4xl leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
              {description}
            </p>
          </div>

          {viewMode === "login" ? (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="vendorEmail">
                  Email
                </label>
                <input
                  className={inputClassName}
                  id="vendorEmail"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="vendorPassword">
                    Password
                  </label>
                  <button
                    className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
                    onClick={() => switchView("forgot")}
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  className={inputClassName}
                  id="vendorPassword"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
              {success ? <p className="text-sm font-semibold text-green-700">{success}</p> : null}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <input className="accent-[hsl(var(--primary))]" defaultChecked type="checkbox" />
                  Keep me signed in
                </label>
              </div>
              <button
                className="w-full rounded-2xl bg-[linear-gradient(135deg,hsl(var(--saffron))_0%,hsl(var(--maroon))_100%)] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_34px_hsl(var(--maroon)/0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_hsl(var(--maroon)/0.26)] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : null}

          {viewMode === "forgot" ? (
            <form className="mt-8 space-y-5" onSubmit={handleForgotPassword}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="forgotEmail">
                  Registered email
                </label>
                <input
                  className={inputClassName}
                  id="forgotEmail"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
              {success ? <p className="text-sm font-semibold text-green-700">{success}</p> : null}
              <button
                className="w-full rounded-2xl bg-[linear-gradient(135deg,hsl(var(--saffron))_0%,hsl(var(--maroon))_100%)] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_34px_hsl(var(--maroon)/0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_hsl(var(--maroon)/0.26)] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Generating code..." : "Send reset code"}
              </button>
              <button
                className="w-full rounded-2xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
                onClick={() => switchView("login")}
                type="button"
              >
                Back to sign in
              </button>
            </form>
          ) : null}

          {viewMode === "reset" ? (
            <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="resetEmail">
                  Registered email
                </label>
                <input
                  className={inputClassName}
                  id="resetEmail"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="resetCode">
                  Reset code
                </label>
                <input
                  className={inputClassName}
                  id="resetCode"
                  placeholder="Enter 6-digit code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="newPassword">
                  New password
                </label>
                <input
                  className={inputClassName}
                  id="newPassword"
                  placeholder="Enter a new password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  className={inputClassName}
                  id="confirmPassword"
                  placeholder="Re-enter the new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {generatedResetCode ? (
                <div className="rounded-2xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.06)] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                  Reset code for this session: <span className="font-extrabold tracking-[0.2em]">{generatedResetCode}</span>
                </div>
              ) : null}
              {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
              {success ? <p className="text-sm font-semibold text-green-700">{success}</p> : null}
              <button
                className="w-full rounded-2xl bg-[linear-gradient(135deg,hsl(var(--saffron))_0%,hsl(var(--maroon))_100%)] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_34px_hsl(var(--maroon)/0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_hsl(var(--maroon)/0.26)] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating password..." : "Reset password"}
              </button>
              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-2xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
                  onClick={() => switchView("forgot")}
                  type="button"
                >
                  Regenerate code
                </button>
                <button
                  className="flex-1 rounded-2xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
                  onClick={() => switchView("login")}
                  type="button"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;

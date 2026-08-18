import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity } from "lucide-react";

import { Button } from "@/components/rv/Button";
import { useToast } from "@/components/rv/Toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const TITLE = "Sign in — RepoVibe";
const DESCRIPTION = "Sign in to RepoVibe to bookmark repositories and keep your health reports handy.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/saved" });
  }, [loading, session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || password.length < 6) {
      toast({ kind: "error", title: "Check your details", body: "Password must be at least 6 characters." });
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/saved` },
        });
        if (error) throw error;
        toast(
          data.session
            ? { kind: "success", title: "Account created", body: "You can start saving repositories." }
            : {
                kind: "info",
                title: "Confirm your email",
                body: "We sent you a confirmation link. Open it to finish signing up.",
              },
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast({ kind: "success", title: "Welcome back" });
      }
    } catch (err) {
      toast({
        kind: "error",
        title: mode === "signup" ? "Sign up failed" : "Sign in failed",
        body: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ kind: "error", title: "Google sign-in failed", body: "Please try again." });
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/saved" });
  };

  return (
    <main className="min-h-screen grid place-items-center bg-cream-100 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-cream-300 bg-cream-50/80 shadow-soft p-7">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-forest-500 text-cream-100">
            <Activity className="w-5 h-5" strokeWidth={2.4} />
          </span>
          <span className="font-display text-xl font-semibold text-charcoal-900">
            Repo<span className="text-forest-500">Vibe</span>
          </span>
        </Link>

        <h1 className="mt-6 font-display text-2xl font-semibold text-charcoal-900">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-charcoal-700/70">
          Bookmark repositories and revisit their health over time.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-charcoal-800 outline-none focus:border-forest-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-charcoal-800 outline-none focus:border-forest-300"
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-charcoal-700/50">
          <span className="h-px flex-1 bg-cream-300" />
          or
          <span className="h-px flex-1 bg-cream-300" />
        </div>

        <Button variant="ghost" className="w-full" onClick={google}>
          Continue with Google
        </Button>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-sm text-charcoal-700/70 hover:text-forest-600"
        >
          {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

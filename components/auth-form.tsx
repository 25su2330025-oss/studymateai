"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Logo } from "./ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
	const router = useRouter();
	const signup = mode === "signup";
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		Promise.resolve().then(() => createClient().auth.getUser()).then(({ data }) => {
				if (data.user) router.replace("/dashboard");
				else setLoading(false);
			}).catch((requestError: unknown) => {
				setError(requestError instanceof Error && requestError.message.includes("Missing NEXT_PUBLIC")
					? "Supabase is not configured. Add the values from .env.example to .env.local."
					: "Unable to contact Supabase. Check your connection and try again.");
				setLoading(false);
			});
	}, [router]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setMessage("");

		if (signup && !name.trim()) {
			setError("Please enter your name.");
			return;
		}
		if (signup && password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setSubmitting(true);
		let result;
		try {
			const supabase = createClient();
			result = signup
				? await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() } } })
				: await supabase.auth.signInWithPassword({ email, password });

			if (result.error) {
				setError(result.error.message);
				setSubmitting(false);
				return;
			}

			if (result.data.session && result.data.user) {
				const profileName = signup ? name.trim() : (result.data.user.user_metadata.name as string | undefined) ?? result.data.user.email?.split("@")[0] ?? "Student";
				const { error: profileError } = await supabase.from("profiles").upsert({
					id: result.data.user.id,
					name: profileName,
					email: result.data.user.email ?? email,
				});
				if (profileError) {
					setError("You signed in, but your profile could not be saved. Please try again.");
					setSubmitting(false);
					return;
				}
			}
		} catch (requestError) {
			setError(requestError instanceof Error && requestError.message.includes("Missing NEXT_PUBLIC")
				? "Supabase is not configured. Add the values from .env.example to .env.local."
				: "Unable to contact Supabase. Check your connection and try again.");
			setSubmitting(false);
			return;
		}

		if (result.data.session) {
			router.replace("/dashboard");
			router.refresh();
		} else {
			setMessage("Account created. Check your email to confirm your account, then log in.");
			setSubmitting(false);
		}
	}

	if (loading) return <main className="grid min-h-screen place-items-center px-5"><p className="muted text-sm">Checking your session...</p></main>;

	return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-md"><Logo /><div className="panel mt-8 p-7 sm:p-9"><p className="eyebrow">{signup ? "Create your workspace" : "Welcome back"}</p><h1 className="display-font mt-3 text-3xl font-bold">{signup ? "Start learning with intention." : "Pick up where you left off."}</h1><p className="muted mt-3 text-sm leading-6">{signup ? "Build a study rhythm that fits your goals and your calendar." : "Your study plan, progress, and next best action are waiting."}</p><form className="mt-7 space-y-4" onSubmit={handleSubmit}>{signup && <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Full name</span><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Johnson" className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /></label>}<label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Email address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Password</span><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /></label>{signup && <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Confirm password</span><input required minLength={6} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /></label>}<Button className="w-full">{submitting ? "Please wait..." : signup ? "Create account" : "Log in"} {!submitting && <span>→</span>}</Button>{error && <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}{message && <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">{message}</p>}</form><p className="muted mt-7 text-center text-sm">{signup ? "Already have an account? " : "New to StudyMate? "}<Link className="font-semibold text-blue-300 hover:text-blue-200" href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p></div></div></main>;
}
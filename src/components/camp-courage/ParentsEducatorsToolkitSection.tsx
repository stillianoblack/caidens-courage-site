import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalNotification from "../GlobalNotification";
import { submitNetlifyForm } from "../../utils/netlifyForms";

const REDIRECT_ON_SUCCESS = false;

export default function ParentsEducatorsToolkitSection() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showNotice, setShowNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const role = (form.elements.namedItem("role") as HTMLSelectElement)?.value || "";
    const organization = (form.elements.namedItem("organization") as HTMLInputElement)?.value?.trim() || "";
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim() || "";
    const consent = (form.elements.namedItem("consent") as HTMLInputElement)?.checked;
    const botField = (form.elements.namedItem("bot-field") as HTMLInputElement)?.value || "";

    if (!email || status === "sending") return;

    setStatus("sending");
    setErrorMsg(null);
    setShowNotice(false);

    try {
      const res = await submitNetlifyForm("courage_toolkit", {
        role,
        organization,
        email,
        consent: consent ? "yes" : "no",
        "bot-field": botField,
      });

      if (res.ok) {
        setStatus("success");
        setShowNotice(true);
        form.reset();
        if (REDIRECT_ON_SUCCESS) {
          setTimeout(() => navigate("/camp-courage/toolkit-success"), 1000);
        }
      } else {
        setStatus("error");
        setErrorMsg("Please try again in a moment.");
        setShowNotice(true);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Please try again in a moment.");
      setShowNotice(true);
    } finally {
      setStatus((s) => (s === "sending" ? "idle" : s));
    }
  };

  return (
    <section
      aria-labelledby="parents-educators-toolkit"
      className="w-full bg-[#EEF6FF]/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 pt-4 pb-20 sm:pb-28">
        {/* Header — eyebrow, H2, sub text (match reference) */}
        <div className="text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#2B4A73]">
            FOR PARENTS + EDUCATORS
          </div>

          <h2
            id="parents-educators-toolkit"
            className="mt-3 font-display text-balance text-[42px] leading-[1.1] font-extrabold text-[#1F3C63] sm:text-[48px] md:text-[52px]"
          >
            Get calm-ready tools for real moments
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-[18px] leading-[1.65] text-[#4E6A86]">
            Quick, printable supports for regulation, routines, and confidence — designed for neurodivergent learners.
          </p>
        </div>

        {/* Card */}
        <div className="relative mt-12 sm:mt-14">
          {/* little badge */}
          <div className="absolute -left-3 -top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4D477] shadow-[0_10px_25px_rgba(0,0,0,0.12)]">
            <span aria-hidden className="text-[20px]">🧩</span>
          </div>

          <div className="rounded-[16px] border border-[#E7EEF7] bg-white shadow-[0_12px_35px_rgba(31,60,99,0.12)]">
            <div className="grid gap-10 px-8 py-10 md:grid-cols-2 md:gap-12 md:px-12">
              {/* Left: form */}
              <form
                name="courage_toolkit"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                action="/camp-courage/toolkit-success"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <input type="hidden" name="form-name" value="courage_toolkit" />
                <input type="hidden" name="source" value="camp-courage" />
                <p className="hidden">
                  <label>
                    Don&apos;t fill this out: <input name="bot-field" />
                  </label>
                </p>
                <div>
                  <label className="block text-[13px] font-semibold text-[#2B4A73]">I am a:</label>
                  <div className="mt-2">
                    <select
                      name="role"
                      className="h-12 w-full rounded-[10px] border border-[#C7D6EA] bg-white px-4 text-[15px] text-[#2B4A73] outline-none focus:ring-2 focus:ring-[#F4D477]"
                      defaultValue="Teacher"
                    >
                      <option>Teacher</option>
                      <option>Parent</option>
                      <option>Counselor</option>
                      <option>School Admin</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#2B4A73]">
                    School / Organization<span className="text-[#D54B4B]"> *</span>
                  </label>
                  <input
                    name="organization"
                    className="mt-2 h-12 w-full rounded-[10px] border border-[#C7D6EA] bg-white px-4 text-[15px] text-[#2B4A73] placeholder:text-[#9AB0C6] outline-none focus:ring-2 focus:ring-[#F4D477]"
                    placeholder="e.g., Jefferson Elementary"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#2B4A73]">
                    Email<span className="text-[#D54B4B]"> *</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="mt-2 h-12 w-full rounded-[10px] border border-[#C7D6EA] bg-white px-4 text-[15px] text-[#2B4A73] placeholder:text-[#9AB0C6] outline-none focus:ring-2 focus:ring-[#F4D477]"
                    placeholder="you@school.org or you@gmail.com"
                  />
                </div>

                <label className="flex items-start gap-3 text-[13px] text-[#4E6A86]">
                  <input name="consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-[#C7D6EA]" />
                  <span>
                    Email me the toolkit + occasional updates. No spam.<span className="text-[#D54B4B]"> *</span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 h-14 w-full rounded-full bg-[#F4D477] px-6 text-[15px] font-semibold text-[#1F3C63] shadow-[0_10px_22px_rgba(244,212,119,0.55)] hover:brightness-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending…" : "Send me the Courage Toolkit"}
                </button>

                <div className="text-center text-[12px] text-[#7A94AE]">
                  No spam. Just tools + occasional updates.
                </div>

                {showNotice && (
                  <GlobalNotification
                    show={showNotice}
                    title={status === "success" ? "You're in!" : "Hmm — that didn't send."}
                    message={
                      status === "success"
                        ? "Thanks — we'll email you shortly. Keep an eye on your inbox (and spam folder)."
                        : errorMsg || "Please try again in a moment."
                    }
                    tone={status === "success" ? "success" : "error"}
                    durationMs={4000}
                    autoClose
                    onClose={() => setShowNotice(false)}
                  />
                )}
              </form>

              {/* Right: what you get */}
              <div>
                <h3 className="text-[22px] font-extrabold text-[#1F3C63]">What you&apos;ll get</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#4E6A86]">
                  Built for calm, predictable use — no timers, no scores, no wrong answers.
                </p>

                <ul className="mt-6 space-y-4 text-[15px] text-[#2B4A73]">
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-[2px]">🧠</span>
                    <span>Printable mission prompts</span>
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-[2px]">⚡</span>
                    <span>Reset routine cards (B-4 / Courage modules)</span>
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-[2px]">🏫</span>
                    <span>Classroom pilot overview</span>
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-[2px]">📘</span>
                    <span>Training &amp; implementation guide</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* soft background wash like screenshot */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[24px] bg-[#EEF6FF] opacity-60 blur-[0px]" />
        </div>
      </div>
    </section>
  );
}

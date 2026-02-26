import { useState, useEffect } from "react";

const AGE_KEY = "budstore_age_verified";

export default function AgeGate() {
  const [verified, setVerified] = useState(() => {
    return localStorage.getItem(AGE_KEY) === "true";
  });

  useEffect(() => {
    if (!verified) {
      document.body.classList.add("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [verified]);

  if (verified) return null;

  const handleConfirm = () => {
    localStorage.setItem(AGE_KEY, "true");
    setVerified(true);
    document.body.classList.remove("drawer-open");
  };

  const handleDeny = () => {
    window.location.href = "https://google.com";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-brand-surface border border-zinc-800 rounded-3xl p-10 max-w-md w-[90%] text-center">
        {/* Bud Hound logo */}
        <img
          src="/logo.jpg"
          alt="BudStore"
          className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-brand-green/30 object-cover"
        />

        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Age Verification
        </h2>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          You must be 21 years of age or older to enter this site.
          By clicking "I'm 21+" you confirm you meet the legal age requirement.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-brand-green text-black py-4 rounded-xl font-bold text-sm uppercase tracking-widest cursor-pointer hover:bg-green-400 transition-colors"
          >
            I'm 21+, Let Me In
          </button>
          <button
            onClick={handleDeny}
            className="w-full bg-zinc-800 text-zinc-400 py-3 rounded-xl font-medium text-sm cursor-pointer hover:bg-zinc-700 transition-colors"
          >
            I'm Under 21
          </button>
        </div>

        <p className="text-[10px] text-zinc-600 mt-6">
          Cannabis products are for adults 21 and older only.
        </p>
      </div>
    </div>
  );
}

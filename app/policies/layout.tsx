export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-950">
      <main className="mx-auto max-w-3xl px-6 py-14">{children}</main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}

export const h2Cls = "mt-10 text-lg font-bold text-white";
export const pCls = "mt-3 text-sm leading-relaxed text-white/60";
export const listCls = "mt-3 list-disc space-y-2 pl-6 text-sm leading-relaxed text-white/60";

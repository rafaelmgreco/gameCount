"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AppShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/", label: "Início" },
  { href: "/partidas", label: "Partidas" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_10%_10%,_#0d1733_0%,_#0a1028_45%,_#050712_80%)] text-zinc-100">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed right-4 top-4 z-40 rounded-lg border border-cyan-300/40 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-cyan-100 md:hidden"
      >
        Menu
      </button>

      {mobileOpen ? (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Fechar menu"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-cyan-400/20 bg-slate-950/90 px-5 py-6 backdrop-blur transition-transform md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-4 shadow-[0_0_32px_rgba(34,211,238,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Commander</p>
          <h1 className="mt-2 text-xl font-black tracking-tight text-white">Match Dashboard</h1>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                    : "border-cyan-300/20 bg-slate-900/70 text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-500/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-3 text-xs text-fuchsia-100">
          Layout pronto para novas abas e widgets.
        </div>
      </aside>

      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}

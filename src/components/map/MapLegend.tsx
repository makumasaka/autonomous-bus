import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/components/ui/utils";

function Dot({ className }: { className: string }) {
  return <span className={cn("inline-block size-2 rounded-full", className)} />;
}

export function MapLegend({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => [
      {
        label: "Vehicles",
        items: [
          { k: "In service", dot: "bg-robobus-teal" },
          { k: "Delayed", dot: "bg-amber-400" },
          { k: "Needs assist", dot: "bg-orange-500" },
          { k: "Offline", dot: "bg-slate-500" },
        ],
      },
      {
        label: "Incidents",
        items: [
          { k: "Critical", dot: "bg-red-500" },
          { k: "High", dot: "bg-orange-500" },
          { k: "Medium", dot: "bg-amber-400" },
          { k: "Low", dot: "bg-robobus-teal" },
        ],
      },
    ],
    [],
  );

  return (
    <div className={cn("pointer-events-auto", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-slate-200 shadow-surface backdrop-blur-md transition-colors hover:bg-black/50"
        aria-expanded={open}
      >
        <Info className="size-3.5 text-slate-300" />
        Map legend
        <span className="text-slate-400">{open ? "• Hide" : "• Show"}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 6, filter: "blur(2px)" }}
            transition={{ duration: 0.18 }}
            className="mt-2 w-[320px] rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-slate-200 shadow-surface backdrop-blur-md"
          >
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.label}>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
                    {r.label}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {r.items.map((it) => (
                      <div key={it.k} className="flex items-center gap-2">
                        <Dot className={it.dot} />
                        <span className="text-slate-200">{it.k}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-300">
                Tip: Select an incident to open the inspector. Enter Remote Assist for intervention tools.
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}


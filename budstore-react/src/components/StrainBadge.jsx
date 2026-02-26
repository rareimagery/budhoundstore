import { getStrainStyle } from "../lib/constants";

export default function StrainBadge({ strain, size = "sm" }) {
  if (!strain) return null;

  const style = getStrainStyle(strain);
  const sizeClasses =
    size === "lg"
      ? "px-3 py-1.5 text-sm"
      : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wider rounded-full ${style.bg} ${style.text} ${sizeClasses}`}
    >
      {strain}
    </span>
  );
}

"use client";

import Link from "next/link";

interface KanjiBadgesProps {
  categories: string[];
  size?: "sm" | "md";
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; href: string }> = {
  exam: {
    label: "入試頻出",
    color: "bg-red-100 text-red-700 border-red-200",
    href: "/lists/exam",
  },
  mistake: {
    label: "間違えやすい",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    href: "/lists/mistake",
  },
  confused: {
    label: "混同注意",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    href: "/lists/confused",
  },
};

export default function KanjiBadges({ categories, size = "md" }: KanjiBadgesProps) {
  if (!categories || categories.length === 0) return null;

  const sizeClasses = size === "sm" 
    ? "text-xs px-2 py-0.5" 
    : "text-sm px-3 py-1";

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        if (!config) return null;

        return (
          <Link
            key={cat}
            href={config.href}
            className={`inline-flex items-center rounded-full border font-medium transition-colors hover:opacity-80 ${config.color} ${sizeClasses}`}
          >
            {config.label}
          </Link>
        );
      })}
    </div>
  );
}











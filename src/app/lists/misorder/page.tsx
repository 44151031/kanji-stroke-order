import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import MisorderKanjiClient from "@/components/lists/MisorderKanjiClient";

export const metadata: Metadata = generatePageMetadata({
  path: "/lists/misorder",
});

export default function MisorderKanjiPage() {
  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      <MisorderKanjiClient />
    </main>
  );
}

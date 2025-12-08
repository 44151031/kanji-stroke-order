import { Metadata } from "next";
import { generateRadicalIndexMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateRadicalIndexMetadata();

export default function RadicalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}










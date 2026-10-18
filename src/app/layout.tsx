import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pharos Docs MCP Auditor",
  description: "Pharos developer documentation onboarding audit and live network verifier."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

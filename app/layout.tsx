import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MailHere — Compliance inbox for Malaysian MSMEs",
  description:
    "Forward SSM, LHDN, KWSP and SOCSO notices. MailHere extracts the deadline and required action, replies in plain language, and tracks everything live.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}

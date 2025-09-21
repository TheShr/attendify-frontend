"use client";

import type { ReactNode } from "react";
import Protected from "@/components/auth/Protected";

type LayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: LayoutProps) {
  return <Protected>{children}</Protected>;
}

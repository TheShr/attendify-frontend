"use client";

import type { ReactNode } from "react";
import Protected from "@/components/auth/Protected";

type LayoutProps = {
  children: ReactNode;
};

export default function StudentLayout({ children }: LayoutProps) {
  return <Protected>{children}</Protected>;
}

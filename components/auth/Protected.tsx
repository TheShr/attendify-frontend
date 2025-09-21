"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ProtectedProps = {
  children: ReactNode;
};

export default function Protected({ children }: ProtectedProps) {
  const bypassAuth = true;
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(!bypassAuth);

  useEffect(() => {
    if (bypassAuth) {
      return;
    }

    let alive = true;

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/role`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("not authed");
        }

        if (alive) {
          setChecking(false);
        }
      } catch {
        const q = new URLSearchParams({ returnTo: pathname || "/" }).toString();
        router.replace(`/login?${q}`);
      }
    })();

    return () => {
      alive = false;
    };
  }, [bypassAuth, pathname, router]);

  if (bypassAuth) {
    return <>{children}</>;
  }

  if (checking) {
    return null;
  }

  return <>{children}</>;
}

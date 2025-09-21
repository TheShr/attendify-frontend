"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ProtectedProps = {
  children: ReactNode;
};

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || base.length === 0) {
    return null;
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

export default function Protected({ children }: ProtectedProps) {
  const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
  if (disableAuth) {
    return <>{children}</>;
  }

  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;

    const endpointBase = getApiBase();
    const roleUrl = endpointBase ? `${endpointBase}/auth/role` : "/api/auth/role";

    (async () => {
      try {
        const res = await fetch(roleUrl, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("not authed");
        }

        if (alive) {
          setChecking(false);
        }
      } catch (error) {
        const q = new URLSearchParams({ returnTo: pathname || "/" }).toString();
        router.replace(`/login?${q}`);
      }
    })();

    return () => {
      alive = false;
    };
  }, [pathname, router]);

  if (checking) {
    return null;
  }

  return <>{children}</>;
}

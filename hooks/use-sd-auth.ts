"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useSDAuth() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("sd_user");

    if (!user) {
      router.replace("/sd/login");
    }
  }, [router]);
}
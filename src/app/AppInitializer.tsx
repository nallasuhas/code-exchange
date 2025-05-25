"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/Auth";

export default function AppInitializer() {
  useEffect(() => {
    useAuthStore.getState().verfiySession();
  }, []);
  return null;
}
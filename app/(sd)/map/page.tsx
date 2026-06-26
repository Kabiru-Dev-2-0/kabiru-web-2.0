"use client";
import LevelMap from "@/components/sd/map/level-map";
import { useSDAuth } from "@/hooks/use-sd-auth";

export default function MapPage() {
  useSDAuth();
  return <LevelMap />;
}
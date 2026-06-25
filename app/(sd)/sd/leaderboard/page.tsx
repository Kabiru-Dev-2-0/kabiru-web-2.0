"use client";
import LeaderBoard from "@/components/sd/leaderboard/leaderboard";
import { useSDAuth } from "@/hooks/use-sd-auth";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
    useSDAuth();
    const router = useRouter();
    return(
        <div className="relative w-screen h-screen overflow-hidden">
            <LeaderBoard onClose={() => router.push("/onboarding")}/>
        </div>
    )
}
"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Heroes } from "./Heroes";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { SignInButton } from "@clerk/clerk-react";

export default function Heading() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1
        style={{ lineHeight: "65px" }}
        className="text-3xl sm:text-5xl md:text-5xl font-bold text-sky-500"
      >
        Ваши идеи, документы и планы.{" "}
        <span className="underline">BeLikeGreatest</span>
      </h1>
      {isLoading && (
        <div className="w-full flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button size="lg" asChild>
          <Link href="/documents">
            Enter BeLikeGreatest
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button>
            Get BeLikeGreatest Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
}

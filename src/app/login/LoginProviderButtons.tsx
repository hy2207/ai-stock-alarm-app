"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/app/components/ui/button";

type LoginProviderButtonsProps = {
  callbackUrl: string;
};

export function LoginProviderButtons({ callbackUrl }: LoginProviderButtonsProps) {
  return (
    <div className="space-y-4" data-callback-url={callbackUrl}>
      <Button
        className="h-11 w-full"
        onClick={() => void signIn("google", { callbackUrl })}
        type="button"
        variant="outline"
      >
        Google로 계속하기
      </Button>

      <Button
        className="h-11 w-full"
        onClick={() => void signIn("kakao", { callbackUrl })}
        type="button"
        variant="outline"
      >
        Kakao로 계속하기
      </Button>
    </div>
  );
}

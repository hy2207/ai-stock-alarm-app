"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/updateProfile";
import { Button } from "@/app/components/ui/button";

const TIMEZONE_OPTIONS = [
  { value: "Asia/Seoul", label: "서울 (KST, UTC+9)" },
  { value: "America/New_York", label: "뉴욕 (ET, UTC-5/-4)" },
  { value: "America/Chicago", label: "시카고 (CT, UTC-6/-5)" },
  { value: "America/Los_Angeles", label: "로스앤젤레스 (PT, UTC-8/-7)" },
  { value: "Europe/London", label: "런던 (GMT/BST, UTC+0/+1)" },
  { value: "Asia/Tokyo", label: "도쿄 (JST, UTC+9)" },
];

interface ProfileEditFormProps {
  initialName: string;
  initialTimezone: string;
  email: string | null;
}

export function ProfileEditForm({
  initialName,
  initialTimezone,
  email,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = name !== initialName || timezone !== initialTimezone;

  async function handleSubmit() {
    if (!isDirty) return;

    setIsSubmitting(true);
    try {
      const result = await updateProfile({ name, timezone });
      if (!result.success) {
        toast.error(result.error ?? "저장 중 오류가 발생했습니다.");
        return;
      }
      toast.success("프로필이 업데이트되었습니다.");
      router.push("/settings");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          표시 이름
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          placeholder="이름을 입력하세요"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          type="text"
          value={email ?? "—"}
          readOnly
          className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400">Google 계정으로 연결되어 변경할 수 없습니다.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="timezone">
          타임존
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          {TIMEZONE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={() => void handleSubmit()}
          disabled={!isDirty || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "저장 중..." : "변경사항 저장"}
        </Button>
      </div>
    </div>
  );
}

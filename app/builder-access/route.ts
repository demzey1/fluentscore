import { redirect } from "next/navigation";
import { unlockBuilderSession } from "@/lib/auth/builder-session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const passcode = String(formData.get("passcode") ?? "").trim();

  const isUnlocked = await unlockBuilderSession(passcode);
  if (!isUnlocked) {
    redirect("/builder-access?error=invalid-passcode");
  }

  redirect("/builder");
}

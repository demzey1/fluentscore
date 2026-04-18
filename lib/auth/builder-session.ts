import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BUILDER_COOKIE_NAME = "builder_session";
const BUILDER_COOKIE_VALUE = "unlocked";

export async function hasBuilderSession() {
  const cookieStore = await cookies();
  return cookieStore.get(BUILDER_COOKIE_NAME)?.value === BUILDER_COOKIE_VALUE;
}

export async function clearBuilderSession() {
  const cookieStore = await cookies();
  cookieStore.delete(BUILDER_COOKIE_NAME);
}

export async function requireBuilderSession() {
  if (!(await hasBuilderSession())) {
    redirect("/builder-access");
  }
}

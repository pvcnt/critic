import { getSession } from "./session.server";

export async function isAuthenticated(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.has("userId");
}

export async function isAnonymous(request: Request) {
  return !(await isAuthenticated(request));
}

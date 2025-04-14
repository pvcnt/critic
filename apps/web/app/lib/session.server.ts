import { createCookieSessionStorage } from "react-router";
import { env } from "./env.server";

type SessionData = {
  userId: number;
  login: string;
  authState: string;
};

type SessionFlashData = {
  message: string;
  error: string;
};

// TODO: db-backed session storage

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      secure: true,
      secrets: [env.COOKIE_SECRET],
      sameSite: "lax",
      path: "/",
      // TODO:
      // domain: "reactrouter.com",
      // maxAge: 60,
    },
  });

export { getSession, commitSession, destroySession };

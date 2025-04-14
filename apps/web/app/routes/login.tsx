import type { Route } from "./+types/login";
import { Button, Card } from "@blueprintjs/core";
import classes from "./login.module.scss";
import { getSession } from "~/lib/session.server";
import { redirect, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Critic - Login" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    return redirect("/");
  }
  return {};
}

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        <img src="/logo.svg" alt="Logo" />
        <span>Welcome to Critic!</span>
      </h1>
      <Card>
        <Button
          onClick={() => navigate("/login/github")}
          className={classes.button}
          size="large"
          fill
        >
          <img src="/github-mark.svg" alt="" />
          <span>Login to github.com</span>
        </Button>
      </Card>
    </div>
  );
}

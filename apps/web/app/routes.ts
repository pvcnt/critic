import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("components/AppLayout.tsx", [
    route("/dashboard", "routes/dashboard.tsx"),
    route("/settings", "routes/settings.tsx"),
  ]),
  route("/login", "routes/login.tsx"),
  route("/logout", "routes/logout.tsx"),
  route("/login/github", "routes/login.github.tsx"),
] satisfies RouteConfig;

import type { Route } from "./+types/AppLayout";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import classes from "./AppLayout.module.scss";
import { getSession } from "~/lib/session.server";
import { Outlet } from "react-router";
import { useDarkMode } from "usehooks-ts";
//TODO: import { AppToaster } from "~/lib/toaster.client";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return {
    login: session.get("login"),
    flash: {
      message: session.get("message"),
      error: session.get("error"),
    },
  };
}

/*function useFlash(message: string | null, intent: "success" | "danger") {
  useEffect(() => {
    if (message) {
      (async () => {
        (await AppToaster).show({ message, intent });
      })();
    }
  }, [message]);
}*/

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { login, flash } = loaderData;
  const { isDarkMode, toggle: toggleDarkMode } = useDarkMode();

  //useFlash(flash.message ?? null, "success");
  //useFlash(flash.error ?? null, "danger");

  return (
    <div className={clsx(classes.app, isDarkMode && "bp5-dark")}>
      <Sidebar
        login={login}
        isDark={isDarkMode}
        onDarkChange={toggleDarkMode}
      />
      <main className={classes.main}>
        <div className={classes.content}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}

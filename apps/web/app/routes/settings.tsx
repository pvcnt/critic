import type { Route } from "./+types/settings";
import { Button, Card, H3 } from "@blueprintjs/core";
import { useState } from "react";
import ConfirmDialog from "~/components/ConfirmDialog";
import classes from "./settings.module.scss";
import { redirect, useFetcher } from "react-router";
import { resetSections } from "~/lib/mutations";
import { getPrismaClient } from "~/lib/db.server";
import { getSession } from "~/lib/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Critic - Settings" }];
}

export async function action({ request }: Route.ActionArgs) {
  const prisma = getPrismaClient();
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId) {
    return;
  }
  const formData = await request.formData();
  if (formData.get("action") === "reset") {
    await resetSections(prisma, userId);
    session.flash(
      "message",
      "Configuration has been reset to factory settings",
    );
    return redirect("/dashboard");
  }
}

export default function Settings() {
  const [resetting, setResetting] = useState(false);
  const fetcher = useFetcher();
  const handleReset = async () => {
    await fetcher.submit({ action: "reset" }, { method: "post" });
  };
  return (
    <>
      <div className={classes.container}>
        <div className={classes.header}>
          <H3 className={classes.title}>Danger zone</H3>
        </div>
        <Card>
          <p>
            Resetting to factory settings will erase the current configuration
            and replace it with the default configuration, as provided to new
            users. It does <i>not</i> affect connections and stars.
          </p>
          <Button
            text="Reset to factory settings"
            intent="danger"
            variant="outlined"
            onClick={() => setResetting(true)}
          />
        </Card>
      </div>
      <ConfirmDialog
        isOpen={resetting}
        onClose={() => setResetting(false)}
        onSubmit={handleReset}
      >
        Are you sure you want to reset configuration to factory settings?
      </ConfirmDialog>
    </>
  );
}

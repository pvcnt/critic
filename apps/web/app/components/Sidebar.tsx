import { Button, Icon, Tooltip } from "@blueprintjs/core";
import { NavLink } from "react-router";
import { type BlueprintIcons_16Id } from "@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16";
import classes from "./Sidebar.module.scss";

function SidebarLink({
  title,
  icon,
  link,
}: {
  title: string;
  link: string;
  icon: BlueprintIcons_16Id;
}) {
  return (
    <NavLink to={link}>
      {({ isActive }) => (
        <Tooltip content={title}>
          <Button variant="minimal" active={isActive}>
            <Icon icon={icon} />
          </Button>
        </Tooltip>
      )}
    </NavLink>
  );
}

export interface SidebarProps {
  login?: string;
  isDark: boolean;
  onDarkChange: () => void;
}

export default function Sidebar({ login, isDark, onDarkChange }: SidebarProps) {
  return (
    <div className={classes.sidebar}>
      <img src="/logo.svg" height="30" className={classes.logo} />
      <SidebarLink link="/" title="Inbox" icon="inbox" />
      <SidebarLink link="/settings" title="Settings" icon="cog" />

      <div className={classes.bottom}>
        <Tooltip content={"Switch to " + (isDark ? "light" : "dark") + " mode"}>
          <Button onClick={onDarkChange} variant="minimal">
            <Icon icon={isDark ? "flash" : "moon"} />
          </Button>
        </Tooltip>
        <Tooltip content={`Logout (${login || "Anonymous"})`}>
          <SidebarLink link="/logout" title="Logout" icon="log-out" />
        </Tooltip>
      </div>
    </div>
  );
}

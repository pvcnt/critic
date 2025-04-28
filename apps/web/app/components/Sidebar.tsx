import { AnchorButton, Button, Icon, Tooltip } from "@blueprintjs/core";
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
      <NavLink to="/">
        <img src="/logo.svg" height="30" className={classes.logo} />
      </NavLink>
      <SidebarLink link="/dashboard" title="Inbox" icon="inbox" />
      <SidebarLink link="/settings" title="Settings" icon="cog" />

      <div className={classes.bottom}>
        <Tooltip content="Report an issue or request a feature">
          <AnchorButton
            variant="minimal"
            href="https://github.com/pvcnt/critic/issues/new"
          >
            <Icon icon="help" />
          </AnchorButton>
        </Tooltip>
        <Tooltip content={"Switch to " + (isDark ? "light" : "dark") + " mode"}>
          <Button onClick={onDarkChange} variant="minimal">
            <Icon icon={isDark ? "flash" : "moon"} />
          </Button>
        </Tooltip>
        <SidebarLink
          link="/logout"
          title={`Logout (${login || "Anonymous"})`}
          icon="log-out"
        />
      </div>
    </div>
  );
}

import { Icon, Tooltip } from "@blueprintjs/core";
import { type BlueprintIcons_16Id } from "@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16";
import React from "react";

export interface IconWithTooltipProps {
  icon: BlueprintIcons_16Id;
  title: string;
  className?: string;
  color?: string;
  size?: number;
  onClick?: React.MouseEventHandler;
}

export default function IconWithTooltip({
  icon,
  title,
  className,
  color,
  size,
  onClick,
}: IconWithTooltipProps) {
  return (
    <Tooltip content={title} openOnTargetFocus={false} usePortal={false}>
      <Icon
        icon={icon}
        color={color}
        size={size}
        className={className}
        onClick={onClick}
      />
    </Tooltip>
  );
}

import { Tooltip, Tag, Icon } from "@blueprintjs/core";
import TimeAgo from "./TimeAgo";
import IconWithTooltip from "./IconWithTooltip";
import { type Pull, computeSize } from "~/lib/pull";
import styles from "./PullRow.module.scss";
import { useState } from "react";
import CopyToClipboardIcon from "./CopyToClipboardIcon";

export interface PullRowProps {
  pull: Pull;
}

const formatDate = (s: string) => {
  return new Date(s).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export default function PullRow({ pull }: PullRowProps) {
  const [active, setActive] = useState(false);
  const handleClick = (e: React.MouseEvent) => {
    // Manually reproduce the behaviour of CTRL+click or middle mouse button.
    if (e.metaKey || e.ctrlKey || e.button == 1) {
      window.open(pull.url);
    } else {
      window.location.href = pull.url;
    }
  };
  return (
    <tr
      onClick={(e) => handleClick(e)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={styles.row}
    >
      <td>
        <div className={styles.author}>
          <Tooltip content={pull.author.name || pull.author.login}>
            {pull.author.avatarUrl ? (
              <img src={pull.author.avatarUrl} />
            ) : (
              <Icon icon="user" />
            )}
          </Tooltip>
        </div>
      </td>
      <td>
        {pull.state == "draft" ? (
          <IconWithTooltip icon="document" title="Draft" color="#5F6B7C" />
        ) : pull.state == "merged" ? (
          <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF" />
        ) : pull.state == "closed" ? (
          <IconWithTooltip icon="cross-circle" title="Closed" color="#AC2F33" />
        ) : pull.state == "approved" ? (
          <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42" />
        ) : pull.state == "pending" ? (
          <IconWithTooltip icon="git-pull" title="Pending" color="#C87619" />
        ) : null}
      </td>
      <td>
        {pull.ciState == "error" ? (
          <IconWithTooltip icon="error" title="Error" color="#AC2F33" />
        ) : pull.ciState == "failure" ? (
          <IconWithTooltip
            icon="cross-circle"
            title="Some checks are failing"
            color="#AC2F33"
          />
        ) : pull.ciState == "success" ? (
          <IconWithTooltip
            icon="tick-circle"
            title="All checks passing"
            color="#1C6E42"
          />
        ) : pull.ciState == "pending" ? (
          <IconWithTooltip icon="circle" title="Pending" color="#C87619" />
        ) : (
          <IconWithTooltip icon="remove" title="No status" color="#5F6B7C" />
        )}
      </td>
      <td>
        <Tooltip content={formatDate(pull.updatedAt)}>
          <TimeAgo
            date={new Date(pull.updatedAt)}
            tooltip={false}
            timeStyle="round"
          />
        </Tooltip>
      </td>
      <td>
        <Tooltip
          content={
            <>
              <span className={styles.additions}>+{pull.additions}</span> /{" "}
              <span className={styles.deletions}>-{pull.deletions}</span>
            </>
          }
          openOnTargetFocus={false}
          usePortal={false}
        >
          <Tag>{computeSize(pull)}</Tag>
        </Tooltip>
      </td>
      <td>
        <div className={styles.title}>
          <span>{pull.title}</span>
          {active && (
            <CopyToClipboardIcon
              title="Copy URL to clipboard"
              text={pull.url}
              className={styles.copy}
            />
          )}
        </div>
        <div className={styles.source}>
          {pull.repo} #{pull.number}
        </div>
      </td>
    </tr>
  );
}

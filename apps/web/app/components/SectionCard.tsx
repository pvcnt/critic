import { Card, Collapse, H5, Icon, Spinner, Tag } from "@blueprintjs/core";
import { type ReactNode, Suspense, useState } from "react";
import { type Pull } from "~/lib/pull";
import PullTable from "./PullTable";
import styles from "./SectionCard.module.scss";
import { Await } from "react-router";

export interface SectionCardProps {
  label: string;
  pulls: {
    sync: Pull[];
    async?: Promise<Pull[]>;
  };
  actions?: ReactNode;
}

function SectionCount({ count }: { count: number }) {
  if (count === 0) {
    return;
  }
  return (
    <Tag round minimal>
      {count}
    </Tag>
  );
}

function SectionContent({
  pulls,
  collapsed,
}: {
  pulls: Pull[];
  collapsed: boolean;
}) {
  return (
    <Collapse isOpen={!collapsed}>
      <PullTable pulls={pulls} />
    </Collapse>
  );
}

export default function SectionCard({
  label,
  pulls,
  actions,
}: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setCollapsed((v) => !v);
  };
  return (
    <Card className={styles.section}>
      <div className={styles.header}>
        <H5 onClick={(e) => handleClick(e)} className={styles.title}>
          <Icon icon={collapsed ? "chevron-down" : "chevron-up"} color="text" />
          <span>{label}</span>
          {pulls.async ? (
            <Suspense
              fallback={
                <div className={styles.count}>
                  <SectionCount count={pulls.sync.length} />
                  <Spinner size={16} />
                </div>
              }
            >
              <Await resolve={pulls.async}>
                {(resolvedPulls) => (
                  <SectionCount count={resolvedPulls.length} />
                )}
              </Await>
            </Suspense>
          ) : (
            <SectionCount count={pulls.sync.length} />
          )}
        </H5>
        <div className={styles.actions}>{actions}</div>
      </div>
      {pulls.async ? (
        <Suspense
          fallback={<SectionContent collapsed={collapsed} pulls={pulls.sync} />}
        >
          <Await resolve={pulls.async}>
            {(resolvedPulls) => (
              <SectionContent collapsed={collapsed} pulls={resolvedPulls} />
            )}
          </Await>
        </Suspense>
      ) : (
        <SectionContent collapsed={collapsed} pulls={pulls.sync} />
      )}
    </Card>
  );
}

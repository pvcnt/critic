import { Card, Collapse, H5, Icon, Spinner, Tag } from "@blueprintjs/core";
import { type ReactNode, Suspense, useState } from "react";
import { type Pull } from "~/lib/pull";
import PullTable from "./PullTable";
import styles from "./SectionCard.module.scss";
import { Await } from "react-router";

function matches(pull: Pull, search?: string) {
  if (!search) {
    return true;
  }
  const normalizedTitle = pull.title.toLowerCase();
  const normalizedQuery = search.toLowerCase();
  const tokens = normalizedQuery
    .split(" ")
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0);
  return tokens.every((tok) => normalizedTitle.indexOf(tok) > -1);
}

export interface SectionCardProps {
  label: string;
  search?: string;
  pulls: Promise<Pull[]>;
  actions?: ReactNode;
}

export default function SectionCard({
  label,
  search,
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
          <Suspense>
            <Await resolve={pulls}>
              {(resolvedPulls) =>
                resolvedPulls.length > 0 && (
                  <Tag round minimal>
                    {resolvedPulls.length}
                  </Tag>
                )
              }
            </Await>
          </Suspense>
        </H5>
        <div className={styles.actions}>{actions}</div>
      </div>
      <Suspense fallback={<Spinner />}>
        <Await resolve={pulls}>
          {(resolvedPulls) => (
            <Collapse isOpen={!collapsed}>
              <PullTable
                pulls={resolvedPulls.filter((pull) => matches(pull, search))}
              />
            </Collapse>
          )}
        </Await>
      </Suspense>
    </Card>
  );
}

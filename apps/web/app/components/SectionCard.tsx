import { Card, Collapse, H5, Icon, Spinner, Tag } from "@blueprintjs/core";
import { type ReactNode, useState } from "react";
import { type Pull } from "~/lib/pull";
import PullTable from "./PullTable";
import styles from "./SectionCard.module.scss";

export interface SectionCardProps {
  label: string;
  isLoading: boolean;
  pulls: Pull[];
  actions?: ReactNode;
}

export default function SectionCard({
  label,
  pulls,
  isLoading,
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
          <div className={styles.count}>
            {pulls.length > 0 && (
              <Tag round minimal>
                {pulls.length}
              </Tag>
            )}
            {isLoading && <Spinner size={16} />}
          </div>
        </H5>
        <div className={styles.actions}>{actions}</div>
      </div>
      <Collapse isOpen={!collapsed} keepChildrenMounted={true}>
        <PullTable pulls={pulls} />
      </Collapse>
    </Card>
  );
}

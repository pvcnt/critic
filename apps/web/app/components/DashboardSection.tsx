import { Button } from "@blueprintjs/core";
import { useState } from "react";
import SectionDialog from "./SectionDialog";
import { type Pull } from "~/lib/pull";
import SectionCard from "./SectionCard";
import type { Section } from "@critic/prisma";

export interface DashboardSectionProps {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  pulls: {
    sync: Pull[];
    async?: Promise<Pull[]>;
  };
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (v: Section) => void;
  onDelete: () => void;
}

export default function DashboardSection({
  section,
  isFirst,
  isLast,
  pulls,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: DashboardSectionProps) {
  const [isEditing, setEditing] = useState(false);
  return (
    <>
      <SectionCard
        label={section.label}
        pulls={pulls}
        actions={
          <>
            <Button
              icon="symbol-triangle-up"
              variant="minimal"
              disabled={isFirst}
              onClick={onMoveUp}
            />
            <Button
              icon="symbol-triangle-down"
              variant="minimal"
              disabled={isLast}
              onClick={onMoveDown}
            />
            <Button
              icon="edit"
              variant="minimal"
              onClick={() => setEditing(true)}
            />
          </>
        }
      />
      <SectionDialog
        section={section}
        title="Edit section"
        isOpen={isEditing}
        onClose={() => setEditing(false)}
        onSubmit={(v) => onChange({ ...section, ...v })}
        onDelete={onDelete}
      />
    </>
  );
}

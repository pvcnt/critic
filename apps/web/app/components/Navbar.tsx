import { useState } from "react";
import {
  Alignment,
  Navbar as BPNavbar,
  Button,
  ControlGroup,
} from "@blueprintjs/core";
import classes from "./Navbar.module.scss";
import TimeAgo from "./TimeAgo";
import SectionDialog, { type SectionData } from "./SectionDialog";
import SearchBar from "./SearchBar";

export interface NavbarProps {
  refreshedAt: number | null;
  search: string;
  isFetching: boolean;
  onSearch: (value: string) => void;
  onCreateSection: (value: SectionData) => void;
  onRefresh: () => void;
}

export default function Navbar({
  refreshedAt,
  search,
  isFetching,
  onSearch,
  onCreateSection,
  onRefresh,
}: NavbarProps) {
  const [isEditing, setEditing] = useState(false);
  return (
    <>
      <BPNavbar className={classes.container}>
        <BPNavbar.Group align={Alignment.START}>
          <SearchBar value={search} onChange={onSearch} />
        </BPNavbar.Group>
        <BPNavbar.Group align={Alignment.END}>
          <div className={classes.right}>
            {refreshedAt !== null && refreshedAt > 0 && (
              <div className={classes.refreshed}>
                <TimeAgo date={refreshedAt} tooltip={false} timeStyle="round" />
              </div>
            )}
            <ControlGroup>
              <Button
                icon="refresh"
                variant="minimal"
                onClick={onRefresh}
                disabled={isFetching}
              />
              <Button
                text="New section"
                icon="plus"
                variant="minimal"
                onClick={() => setEditing(true)}
              />
            </ControlGroup>
          </div>
        </BPNavbar.Group>
      </BPNavbar>
      <SectionDialog
        title="New section"
        isOpen={isEditing}
        onClose={() => setEditing(false)}
        onSubmit={onCreateSection}
      />
    </>
  );
}

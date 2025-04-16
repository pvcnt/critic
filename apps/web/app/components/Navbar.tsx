import { useState } from "react";
import { Alignment, Navbar as BPNavbar, Button } from "@blueprintjs/core";
import classes from "./Navbar.module.scss";
import TimeAgo from "./TimeAgo";
import SectionDialog, { type SectionData } from "./SectionDialog";
import SearchBar from "./SearchBar";

export interface NavbarProps {
  refreshedAt: Date | null;
  search: string;
  onSearch: (value: string) => void;
  onCreateSection: (value: SectionData) => void;
}

export default function Navbar({
  refreshedAt,
  search,
  onSearch,
  onCreateSection,
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
            {refreshedAt && (
              <div className={classes.refreshed}>
                Refreshed{" "}
                <TimeAgo date={refreshedAt} tooltip={false} timeStyle="round" />
              </div>
            )}
            <Button
              text="New section"
              icon="plus"
              variant="minimal"
              onClick={() => setEditing(true)}
            />
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

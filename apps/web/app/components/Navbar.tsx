import { useMemo, useState } from "react";
import {
  Alignment,
  Navbar as BPNavbar,
  Button,
  ButtonGroup,
  useHotkeys,
  type HotkeyConfig,
} from "@blueprintjs/core";
import classes from "./Navbar.module.scss";
import TimeAgo from "./TimeAgo";
import SectionDialog, { type SectionData } from "./SectionDialog";
import SearchBar from "./SearchBar";
import { RefreshIntervalInput } from "./RefreshIntervalInput";

export interface NavbarProps {
  refreshedAt: number | null;
  refreshInterval: number;
  search: string;
  isFetching: boolean;
  onSearch: (value: string) => void;
  onCreateSection: (value: SectionData) => void;
  onRefresh: () => void;
  onChangeRefreshInterval: (v: number) => void;
}

export default function Navbar({
  refreshedAt,
  refreshInterval,
  search,
  isFetching,
  onSearch,
  onCreateSection,
  onRefresh,
  onChangeRefreshInterval,
}: NavbarProps) {
  const [isEditing, setEditing] = useState(false);
  const hotkeys: HotkeyConfig[] = useMemo(
    () => [
      {
        combo: "r",
        global: true,
        label: "Refresh pull requests",
        preventDefault: true,
        onKeyDown: onRefresh,
      },
    ],
    [],
  );
  useHotkeys(hotkeys);

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
            <ButtonGroup>
              <Button
                icon="refresh"
                onClick={onRefresh}
                disabled={isFetching}
              />
              <RefreshIntervalInput
                value={refreshInterval}
                onChange={onChangeRefreshInterval}
              />
            </ButtonGroup>
            <Button
              text="New section"
              icon="plus"
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

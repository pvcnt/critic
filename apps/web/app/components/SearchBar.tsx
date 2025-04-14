import { useMemo, useRef } from "react";
import {
  InputGroup,
  Tag,
  useHotkeys,
  type HotkeyConfig,
} from "@blueprintjs/core";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hotkeys: HotkeyConfig[] = useMemo(
    () => [
      {
        combo: "mod+k",
        global: true,
        label: "Search pull requests",
        preventDefault: true,
        onKeyDown: () => inputRef.current?.focus(),
      },
    ],
    [inputRef],
  );
  useHotkeys(hotkeys);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      inputRef.current?.blur();
    }
  };
  return (
    <InputGroup
      type="search"
      leftIcon="search"
      placeholder="Search pull requests"
      rightElement={
        <Tag minimal round>
          ⌘ K
        </Tag>
      }
      value={value}
      onValueChange={onChange}
      inputRef={inputRef}
      onKeyDown={handleKeyDown}
    />
  );
}

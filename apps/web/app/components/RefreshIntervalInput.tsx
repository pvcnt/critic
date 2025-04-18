import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core";

const intervals = [1, 5, 10, 15, 30];

export interface RefreshIntervalInputProps {
  value: number;
  onChange: (v: number) => void;
}

function formatInterval(v: number) {
  return `${v} minute${v > 1 ? "s" : ""}`;
}

export function RefreshIntervalInput({
  value,
  onChange,
}: RefreshIntervalInputProps) {
  return (
    <Popover
      content={
        <Menu>
          {intervals.map((v, idx) => (
            <MenuItem key={idx}  text={formatInterval(v)} onClick={() => onChange(v)} />
          ))}
        </Menu>
      }
      placement="bottom-start"
    >
      <Button endIcon="caret-down" text={formatInterval(value)} />
    </Popover>
  );
}

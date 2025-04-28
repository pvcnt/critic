import { Card, Collapse, Icon } from "@blueprintjs/core";
import { type File, type Hunk } from "gitdiff-parser";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import classes from "./DiffViewer.module.scss";
import clsx from "clsx";

export interface DiffViewerProps {
  diff: File[];
}

type Row = {
  leftLineNumber: number | null;
  leftContent: string | null;
  rightLineNumber: number | null;
  rightContent: string | null;
  type: "normal" | "delete" | "insert" | "replace";
};

function makeRows(hunk: Hunk): Row[] {
  const rows: Row[] = [];
  let i = 0;
  while (i < hunk.changes.length) {
    const change = hunk.changes[i];
    if (change.type === "normal") {
      rows.push({
        leftLineNumber: change.oldLineNumber,
        leftContent: change.content,
        rightLineNumber: change.newLineNumber,
        rightContent: change.content,
        type: "normal",
      });
    } else if (change.type === "delete") {
      const nextChange =
        i + 1 < hunk.changes.length ? hunk.changes[i + 1] : null;
      if (nextChange?.type === "insert") {
        // delete followed by insert
        rows.push({
          leftLineNumber: change.lineNumber,
          leftContent: change.content,
          rightLineNumber: nextChange.lineNumber,
          rightContent: nextChange.content,
          type: "replace",
        });
        i++;
      } else {
        // delete only
        rows.push({
          leftLineNumber: change.lineNumber,
          leftContent: change.content,
          rightLineNumber: null,
          rightContent: null,
          type: "delete",
        });
      }
    } else if (change.type === "insert") {
      // insert only
      rows.push({
        leftLineNumber: null,
        leftContent: null,
        rightLineNumber: change.lineNumber,
        rightContent: change.content,
        type: "insert",
      });
    }
    i++;
  }
  return rows;
}

export function FileViewer({ file }: { file: File }) {
  const [collapsed, setCollapsed] = useState(false);
  const rows = file.hunks.flatMap(makeRows);
  const firstLine = Math.max(
    rows[0].leftLineNumber || 0,
    rows[0].rightLineNumber || 0,
  );
  const linesBefore = Math.max(0, firstLine - 1);
  return (
    <Card compact>
      <div className={classes.filename} onClick={() => setCollapsed((v) => !v)}>
        <Icon icon={collapsed ? "chevron-down" : "chevron-up"} color="text" />
        <span>{file.newPath}</span>
      </div>
      <Collapse isOpen={!collapsed}>
        <table className={classes.table}>
          <tbody>
            {linesBefore > 0 && (
              <tr className={classes.skip}>
                <td colSpan={4}>Expand {linesBefore} lines</td>
              </tr>
            )}
            {rows.map((row, idx) => {
              const previousRow = rows.at(idx - 1);
              const leftLinesBetween =
                row.leftLineNumber && previousRow?.leftLineNumber
                  ? row.leftLineNumber - previousRow.leftLineNumber - 1
                  : 0;
              const rightLinesBetween =
                row.rightLineNumber && previousRow?.rightLineNumber
                  ? row.rightLineNumber - previousRow.rightLineNumber - 1
                  : 0;
              const linesBetween = Math.max(
                leftLinesBetween,
                rightLinesBetween,
              );
              return (
                <Fragment key={idx}>
                  {linesBetween > 0 && (
                    <tr className={classes.skip}>
                      <td colSpan={4}>Expand {linesBetween} lines</td>
                    </tr>
                  )}
                  <tr
                    key={idx}
                    className={clsx(
                      classes.hunk,
                      row.type === "insert" && classes.insert,
                      row.type === "delete" && classes.delete,
                      row.type === "replace" && classes.replace,
                    )}
                  >
                    <td>
                      {row.leftLineNumber !== null ? row.leftLineNumber : ""}
                    </td>
                    <td>{row.leftContent}</td>
                    <td>
                      {row.rightLineNumber !== null ? row.rightLineNumber : ""}
                    </td>
                    <td>{row.rightContent}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Collapse>
    </Card>
  );
}

export function HunkViewer({ hunk }: { hunk: Hunk }) {
  const rows: Row[] = [];
  let i = 0;
  while (i < hunk.changes.length) {
    const change = hunk.changes[i];
    if (change.type === "normal") {
      rows.push({
        leftLineNumber: change.oldLineNumber,
        leftContent: change.content,
        rightLineNumber: change.newLineNumber,
        rightContent: change.content,
        type: "normal",
      });
    } else if (change.type === "delete") {
      const nextChange =
        i + 1 < hunk.changes.length ? hunk.changes[i + 1] : null;
      if (nextChange?.type === "insert") {
        // delete followed by insert
        rows.push({
          leftLineNumber: change.lineNumber,
          leftContent: change.content,
          rightLineNumber: nextChange.lineNumber,
          rightContent: nextChange.content,
          type: "replace",
        });
        i++;
      } else {
        // delete only
        rows.push({
          leftLineNumber: change.lineNumber,
          leftContent: change.content,
          rightLineNumber: null,
          rightContent: null,
          type: "delete",
        });
      }
    } else if (change.type === "insert") {
      // insert only
      rows.push({
        leftLineNumber: null,
        leftContent: null,
        rightLineNumber: change.lineNumber,
        rightContent: change.content,
        type: "insert",
      });
    }
    i++;
  }
  return (
    <>
      {rows.map((row, index) => (
        <tr
          key={index}
          className={clsx(
            classes.hunk,
            row.type === "insert" && classes.insert,
            row.type === "delete" && classes.delete,
            row.type === "replace" && classes.replace,
          )}
        >
          <td>{row.leftLineNumber !== null ? row.leftLineNumber : ""}</td>
          <td>{row.leftContent}</td>
          <td>{row.rightLineNumber !== null ? row.rightLineNumber : ""}</td>
          <td>{row.rightContent}</td>
        </tr>
      ))}
    </>
  );
}

export function DiffViewer({ diff }: DiffViewerProps) {
  return (
    <div className={classes.container}>
      {diff.map((file, index) => (
        <FileViewer key={index} file={file} />
      ))}
    </div>
  );
}

import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent,
  NumericInput,
  TextArea,
} from "@blueprintjs/core";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

export interface SectionData {
  search: string;
  label: string;
  limit: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 50;

export interface SectionDialogProps {
  title: string;
  isOpen: boolean;
  section?: SectionData;
  onClose: () => void;
  onSubmit: (v: SectionData) => void;
  onDelete?: () => void;
}

export default function SectionDialog({
  title,
  section,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}: SectionDialogProps) {
  const [data, setData] = useState<SectionData>({label: "", search: "", limit: DEFAULT_LIMIT});
  const [isDeleting, setDeleting] = useState(false);

  const handleOpening = () => {
    if (section) {
      setData(section);
    }
  };
  const handleSubmit = () => {
    if (isValid()) {
      onSubmit(data);
      onClose();
    }
  };
  const handleDelete = () => {
    onDelete && onDelete();
    onClose();
  };
  const isValid = () => data.label.trim().length > 0 && data.search.trim().length > 0;

  return (
    <>
      <Dialog
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        onOpening={handleOpening}
      >
        <DialogBody>
          <FormGroup label="Section label" labelInfo="(required)">
            <InputGroup
              value={data.label}
              onChange={(e) => setData(v => ({ ...v, label: e.target.value }))}
            />
          </FormGroup>
          <FormGroup
            label="Search query"
            labelInfo="(required)"
            helperText={
              <a
                href="https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests"
                target="_blank"
              >
                Documentation on search syntax
              </a>
            }
          >
            <TextArea
              value={data.search}
              onChange={(e) => setData(v => ({ ...v, search: e.target.value }))}
              fill
            />
          </FormGroup>
          <FormGroup label="Maximum number of pull requests" labelInfo="(required)">
            <NumericInput
              value={data.limit}
              min={1}
              max={MAX_LIMIT}
              onValueChange={limit => setData(v => ({ ...v, limit }))}
            />
          </FormGroup>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                intent={Intent.PRIMARY}
                text="Submit"
                onClick={handleSubmit}
                disabled={!isValid()}
              />
              <Button text="Cancel" onClick={onClose} />
            </>
          }
        >
          {section && (
            <Button
              intent={Intent.DANGER}
              text="Delete"
              variant="minimal"
              onClick={() => setDeleting(true)}
            />
          )}
        </DialogFooter>
      </Dialog>

      {section && (
        <ConfirmDialog
          isOpen={isDeleting}
          onClose={() => setDeleting(false)}
          onSubmit={handleDelete}
        >
          Are you sure you want to delete section <em>{section.label}</em>?
        </ConfirmDialog>
      )}
    </>
  );
}

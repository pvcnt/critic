import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent,
  TextArea,
} from "@blueprintjs/core";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

export interface SectionData {
  search: string;
  label: string;
}

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
  const [label, setLabel] = useState("");
  const [search, setSearch] = useState("");
  const [isDeleting, setDeleting] = useState(false);

  const handleOpening = () => {
    setLabel(section?.label ?? "");
    setSearch(section?.search ?? "");
  };
  const handleSubmit = () => {
    if (isValid()) {
      onSubmit({ label, search });
      onClose();
    }
  };
  const handleDelete = () => {
    onDelete && onDelete();
    onClose();
  };
  const isValid = () => label.trim().length > 0 && search.trim().length > 0;

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
              value={label}
              onChange={(e) => setLabel(e.target.value)}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fill
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

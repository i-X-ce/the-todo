import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  Checkbox,
  IconButton,
  ListItem,
  Stack,
  TextField,
} from "@mui/material";
import type { TodoTask } from "../types";

type TaskItemProps = {
  task: TodoTask;
  onToggle: () => void;
  onDelete: () => void;
  onInsertBelow: () => void;
  onSave: (text: string) => void;
  shouldAutoFocus: boolean;
  onAutoFocusHandled: () => void;
  onDragStart: (event: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent<HTMLLIElement>) => void;
  onDragEnter: (event: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (event: React.DragEvent<HTMLLIElement>) => void;
};

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onInsertBelow,
  onSave,
  shouldAutoFocus,
  onAutoFocusHandled,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDrop,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(task.text);
  }, [task.text]);

  useLayoutEffect(() => {
    if (!shouldAutoFocus) {
      return;
    }

    setDraft(task.text);
    setEditing(true);
  }, [shouldAutoFocus, task.text]);

  useEffect(() => {
    if (!shouldAutoFocus || !editing) {
      return;
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const length = inputRef.current?.value.length ?? 0;
      inputRef.current?.setSelectionRange(length, length);
      onAutoFocusHandled();
    });
  }, [shouldAutoFocus, editing, onAutoFocusHandled]);

  const finishEdit = () => {
    const nextText = draft.trim();
    if (nextText) {
      onSave(nextText);
    }
    setEditing(false);
  };

  return (
    <ListItem
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      disablePadding
      sx={{
        px: 1,
        py: 0.5,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ width: "100%" }}
      >
        <DragIndicatorIcon fontSize="small" color="action" />
        <Checkbox checked={task.completed} onChange={onToggle} />
        {editing ? (
          <TextField
            autoFocus
            inputRef={inputRef}
            variant="standard"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={finishEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                finishEdit();
                onInsertBelow();
              }
              if (event.key === "Escape") {
                setDraft(task.text);
                setEditing(false);
              }
              if (event.key === "Backspace" && draft.length === 0) {
                event.preventDefault();
                onDelete();
              }
            }}
            sx={{ flex: 1 }}
          />
        ) : (
          <TextField
            variant="standard"
            value={task.text}
            onClick={() => setEditing(true)}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            sx={{
              flex: 1,
              "& .MuiInputBase-input": {
                textDecoration: task.completed ? "line-through" : "none",
                color: task.completed ? "text.secondary" : "text.primary",
                cursor: "text",
              },
            }}
          />
        )}
        <IconButton onClick={onInsertBelow} size="small" sx={{ opacity: 0.6 }}>
          <AddIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={onDelete} size="small">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
    </ListItem>
  );
}

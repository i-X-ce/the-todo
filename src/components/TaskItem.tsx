import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  Checkbox,
  IconButton,
  ListItem,
  Stack,
  TextField,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import type { TodoTask } from "../types";

const DND_TYPE = "task";

type DragTask = { index: number };

type TaskItemProps = {
  index: number;
  task: TodoTask;
  onToggle: () => void;
  onDelete: () => void;
  onSave: (text: string) => void;
  onMoveTask: (fromIndex: number, toIndex: number) => void;
};

export function TaskItem({
  index,
  task,
  onToggle,
  onDelete,
  onSave,
  onMoveTask,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);

  useEffect(() => {
    setDraft(task.text);
  }, [task.text]);

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: DND_TYPE,
      item: { index } satisfies DragTask,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: DND_TYPE,
      hover: (dragItem: DragTask) => {
        if (dragItem.index === index) {
          return;
        }
        onMoveTask(dragItem.index, index);
        dragItem.index = index;
      },
    }),
    [index, onMoveTask],
  );

  const finishEdit = () => {
    const nextText = draft.trim();
    if (nextText) {
      onSave(nextText);
    }
    setEditing(false);
  };

  return (
    <ListItem
      ref={(node: HTMLLIElement | null) => {
        dragRef(node);
        dropRef(node);
      }}
      disablePadding
      sx={{
        opacity: isDragging ? 0.5 : 1,
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
            variant="standard"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={finishEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                finishEdit();
              }
              if (event.key === "Escape") {
                setDraft(task.text);
                setEditing(false);
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
              "& .MuiInput-underline:before": { borderBottom: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottom: "none",
              },
              "& .MuiInput-underline:after": { borderBottom: "none" },
            }}
          />
        )}
        <IconButton onClick={onDelete} size="small">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
    </ListItem>
  );
}

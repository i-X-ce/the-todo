import { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Box, List, TextField } from "@mui/material";
import type { TodoTask } from "../types";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: TodoTask[];
  onAddTask: (text: string) => void;
  onAddTaskAt: (text: string, index: number) => string;
  onUpdateTask: (taskId: string, text: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onMoveTask: (fromIndex: number, toIndex: number) => void;
};

export function TaskList({
  tasks,
  onAddTask,
  onAddTaskAt,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onMoveTask,
}: TaskListProps) {
  const [draftTask, setDraftTask] = useState("");
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [animatedParent, enableAnimations] = useAutoAnimate();

  useEffect(() => {
    enableAnimations(isSorting);
  }, [enableAnimations, isSorting]);

  const submitTask = () => {
    const text = draftTask.trim();
    if (!text) {
      return;
    }
    onAddTask(text);
    setDraftTask("");
  };

  const canMoveTask = (fromIndex: number, toIndex: number) => {
    const fromTask = tasks[fromIndex];
    if (!fromTask) {
      return false;
    }

    const firstCompletedIndex = tasks.findIndex((task) => task.completed);

    if (!fromTask.completed) {
      if (firstCompletedIndex === -1) {
        return true;
      }
      return toIndex < firstCompletedIndex;
    }

    if (firstCompletedIndex === -1) {
      return false;
    }
    return toIndex >= firstCompletedIndex;
  };

  const autoScrollWhileDragging = (event: React.DragEvent<HTMLLIElement>) => {
    const edgeThreshold = 64;
    const step = 14;
    const y = event.clientY;

    if (y < edgeThreshold) {
      window.scrollBy({ top: -step, behavior: "auto" });
      return;
    }

    if (y > window.innerHeight - edgeThreshold) {
      window.scrollBy({ top: step, behavior: "auto" });
    }
  };

  return (
    <Box sx={{ pt: 1 }}>
      <TextField
        fullWidth
        variant="standard"
        placeholder="新規ToDo"
        value={draftTask}
        onChange={(event) => setDraftTask(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            submitTask();
          }
        }}
        sx={{ px: 1, mb: 0.5 }}
      />

      <List ref={animatedParent} sx={{ py: 0 }}>
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={() => {
              const previousTask = tasks[index - 1];
              onDeleteTask(task.id);
              setFocusTaskId(previousTask?.id ?? null);
            }}
            onToggle={() => onToggleTask(task.id)}
            onSave={(text) => onUpdateTask(task.id, text)}
            onInsertBelow={() => {
              const insertedTaskId = onAddTaskAt("", index + 1);
              setFocusTaskId(insertedTaskId);
            }}
            shouldAutoFocus={focusTaskId === task.id}
            onAutoFocusHandled={() => setFocusTaskId(null)}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(index));
              setIsSorting(true);
              setDragFromIndex(index);
            }}
            onDragEnd={() => {
              setIsSorting(false);
              setDragFromIndex(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              autoScrollWhileDragging(event);
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              if (dragFromIndex === null || dragFromIndex === index) {
                return;
              }

              if (!canMoveTask(dragFromIndex, index)) {
                return;
              }

              onMoveTask(dragFromIndex, index);
              setDragFromIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
            }}
          />
        ))}
      </List>
    </Box>
  );
}

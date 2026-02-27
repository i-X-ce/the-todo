import { useMemo, useState } from "react";
import AddTaskIcon from "@mui/icons-material/AddTask";
import { Box, List, Stack, TextField, Typography } from "@mui/material";
import type { TodoTask } from "../types";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: TodoTask[];
  onAddTask: (text: string) => void;
  onUpdateTask: (taskId: string, text: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onMoveTask: (fromIndex: number, toIndex: number) => void;
};

export function TaskList({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onMoveTask,
}: TaskListProps) {
  const [draftTask, setDraftTask] = useState("");

  const taskStats = useMemo(() => {
    const completedCount = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed: completedCount,
      uncompleted: tasks.length - completedCount,
    };
  }, [tasks]);

  const submitTask = () => {
    const text = draftTask.trim();
    if (!text) {
      return;
    }
    onAddTask(text);
    setDraftTask("");
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <AddTaskIcon fontSize="small" color="action" />
        <TextField
          fullWidth
          size="small"
          placeholder="Enter でタスクを追加"
          value={draftTask}
          onChange={(event) => setDraftTask(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submitTask();
            }
          }}
        />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        未完了 {taskStats.uncompleted} / 完了 {taskStats.completed} / 合計{" "}
        {taskStats.total}
      </Typography>

      <List sx={{ mt: 1 }}>
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            index={index}
            task={task}
            onDelete={() => onDeleteTask(task.id)}
            onToggle={() => onToggleTask(task.id)}
            onSave={(text) => onUpdateTask(task.id, text)}
            onMoveTask={onMoveTask}
          />
        ))}
      </List>
    </Box>
  );
}

export type ThemeMode = "system" | "light" | "dark";

export type TodoTask = {
  id: string;
  text: string;
  completed: boolean;
};

export type TodoTab = {
  id: string;
  title: string;
  tasks: TodoTask[];
};

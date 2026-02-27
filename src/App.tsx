import { useEffect, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SettingsMenu } from "./components/SettingsMenu";
import { TabBar } from "./components/TabBar";
import { TaskList } from "./components/TaskList";
import { useTodoStore } from "./store/useTodoStore";
import "./App.css";

function App() {
  const {
    tabs,
    activeTabId,
    themeMode,
    alwaysOnTop,
    addTab,
    renameTab,
    removeTab,
    moveTab,
    setActiveTab,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    setThemeMode,
    setAlwaysOnTop,
  } = useTodoStore();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const resolvedThemeMode =
    themeMode === "system" ? (prefersDarkMode ? "dark" : "light") : themeMode;

  const activeTab = useMemo(() => {
    return tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  }, [tabs, activeTabId]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedThemeMode,
        },
      }),
    [resolvedThemeMode],
  );

  useEffect(() => {
    if (!activeTab && tabs[0]) {
      setActiveTab(tabs[0].id);
    }
  }, [activeTab, tabs, setActiveTab]);

  useEffect(() => {
    getCurrentWindow()
      .setAlwaysOnTop(alwaysOnTop)
      .catch(() => {
        // TODO: 権限エラー時のUI通知を追加する
      });
  }, [alwaysOnTop]);

  if (!activeTab) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                The ToDo
              </Typography>
              <SettingsMenu
                themeMode={themeMode}
                alwaysOnTop={alwaysOnTop}
                onChangeTheme={setThemeMode}
                onChangeAlwaysOnTop={setAlwaysOnTop}
              />
            </Toolbar>
          </AppBar>

          <Container maxWidth="md" sx={{ py: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <TabBar
                tabs={tabs}
                activeTabId={activeTab.id}
                onAddTab={addTab}
                onRemoveTab={removeTab}
                onRenameTab={renameTab}
                onSelectTab={setActiveTab}
                onMoveTab={moveTab}
              />

              <TaskList
                tasks={activeTab.tasks}
                onAddTask={(text) => addTask(activeTab.id, text)}
                onUpdateTask={(taskId, text) =>
                  updateTask(activeTab.id, taskId, text)
                }
                onDeleteTask={(taskId) => deleteTask(activeTab.id, taskId)}
                onToggleTask={(taskId) => toggleTask(activeTab.id, taskId)}
                onMoveTask={(fromIndex, toIndex) =>
                  moveTask(activeTab.id, fromIndex, toIndex)
                }
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: "block" }}
              >
                TODO: TauriのUpdater APIを接続して自動アップデート通知を実装する
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                TODO:
                タブを別ウィンドウで開く機能をTauriマルチウィンドウで実装する
              </Typography>
            </Paper>
          </Container>
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;

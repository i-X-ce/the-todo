import { useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Box, Button, CssBaseline, Menu, MenuItem, Stack } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import { IconButton, Tooltip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState, type MouseEvent } from "react";
import { SettingsDrawer } from "./components/SettingsDrawer";
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
    addTaskAt,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    setThemeMode,
    setAlwaysOnTop,
  } = useTodoStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fileMenuAnchor, setFileMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
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
    const applyAlwaysOnTop = async () => {
      try {
        await invoke("set_always_on_top", { alwaysOnTop });
      } catch (error) {
        console.error("set_always_on_top command failed:", error);
      }

      try {
        await getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
      } catch (error) {
        console.error("window.setAlwaysOnTop fallback failed:", error);
      }
    };

    void applyAlwaysOnTop();
  }, [alwaysOnTop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        setSettingsOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!activeTab) {
    return null;
  }

  const openFileMenu = (event: MouseEvent<HTMLElement>) => {
    setFileMenuAnchor(event.currentTarget);
  };

  const closeFileMenu = () => {
    setFileMenuAnchor(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ px: 1, py: 0.5, borderBottom: 1, borderColor: "divider" }}
          >
            <Button
              size="small"
              color="inherit"
              onClick={openFileMenu}
              sx={{
                minWidth: "auto",
                px: 1,
                py: 0.25,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              ファイル
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => setSettingsOpen(true)}
              sx={{
                minWidth: "auto",
                px: 1,
                py: 0.25,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              設定
            </Button>

            <Box sx={{ flex: 1 }} />

            <Tooltip title="常に手前に固定">
              <IconButton
                size="small"
                color={alwaysOnTop ? "primary" : "default"}
                onClick={() => setAlwaysOnTop(!alwaysOnTop)}
                sx={{
                  color: alwaysOnTop ? "primary.main" : "text.secondary",
                }}
              >
                <PushPinIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Menu
            anchorEl={fileMenuAnchor}
            open={Boolean(fileMenuAnchor)}
            onClose={closeFileMenu}
          >
            <MenuItem
              onClick={() => {
                addTab();
                closeFileMenu();
              }}
            >
              新しいタブ
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSettingsOpen(true);
                closeFileMenu();
              }}
            >
              設定を開く
            </MenuItem>
          </Menu>

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
            onAddTaskAt={(text, index) => addTaskAt(activeTab.id, text, index)}
            onUpdateTask={(taskId, text) =>
              updateTask(activeTab.id, taskId, text)
            }
            onDeleteTask={(taskId) => deleteTask(activeTab.id, taskId)}
            onToggleTask={(taskId) => toggleTask(activeTab.id, taskId)}
            onMoveTask={(fromIndex, toIndex) =>
              moveTask(activeTab.id, fromIndex, toIndex)
            }
          />

          <SettingsDrawer
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            themeMode={themeMode}
            alwaysOnTop={alwaysOnTop}
            onChangeTheme={setThemeMode}
            onChangeAlwaysOnTop={setAlwaysOnTop}
          />
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;

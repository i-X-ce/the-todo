import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { TodoTab } from "../types";

type TabBarProps = {
  tabs: TodoTab[];
  activeTabId: string;
  onAddTab: () => void;
  onRemoveTab: (tabId: string) => void;
  onRenameTab: (tabId: string, title: string) => void;
  onSelectTab: (tabId: string) => void;
  onMoveTab: (fromIndex: number, toIndex: number) => void;
};

export function TabBar({
  tabs,
  activeTabId,
  onAddTab,
  onRemoveTab,
  onRenameTab,
  onSelectTab,
  onMoveTab,
}: TabBarProps) {
  const [tabListRef, enableTabAnimations] = useAutoAnimate();
  const [isTabDragging, setIsTabDragging] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [pendingDeleteTabId, setPendingDeleteTabId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    enableTabAnimations(isTabDragging);
  }, [enableTabAnimations, isTabDragging]);

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Stack direction="row" alignItems="center" sx={{ minHeight: 42 }}>
        <Tabs
          value={activeTabId}
          onChange={(_, value) => onSelectTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          slotProps={{ list: { ref: tabListRef } }}
          sx={{
            minHeight: 42,
            flex: 1,
            "& .MuiTabs-indicator": {
              height: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              draggable
              onDoubleClick={() => {
                const next = window.prompt("タブ名を編集", tab.title);
                if (next !== null) {
                  onRenameTab(tab.id, next);
                }
              }}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
                setIsTabDragging(true);
                setDragFromIndex(index);
              }}
              onDragEnd={() => {
                setIsTabDragging(false);
                setDragFromIndex(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                if (dragFromIndex === null || dragFromIndex === index) {
                  return;
                }
                onMoveTab(dragFromIndex, index);
                setDragFromIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
              }}
              disableRipple
              value={tab.id}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" noWrap>
                    {tab.title}
                  </Typography>
                  <IconButton
                    size="small"
                    disabled={tabs.length <= 1}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingDeleteTabId(tab.id);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              }
              sx={{
                minHeight: 42,
                textTransform: "none",
                px: 0.75,
                flexShrink: 0,
                minWidth: "max-content",
                maxWidth: "none",
                borderRadius: 1,
              }}
            />
          ))}
        </Tabs>
        <IconButton onClick={onAddTab} size="small" sx={{ mx: 0.5 }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Dialog
        open={pendingDeleteTabId !== null}
        onClose={() => setPendingDeleteTabId(null)}
      >
        <DialogTitle>タブを削除しますか？</DialogTitle>
        <DialogContent>このタブに含まれるToDoも削除されます。</DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDeleteTabId(null)}>
            キャンセル
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (pendingDeleteTabId) {
                onRemoveTab(pendingDeleteTabId);
              }
              setPendingDeleteTabId(null);
            }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import type { TodoTab } from "../types";

const DND_TYPE = "tab";

type TabBarProps = {
  tabs: TodoTab[];
  activeTabId: string;
  onAddTab: () => void;
  onRemoveTab: (tabId: string) => void;
  onRenameTab: (tabId: string, title: string) => void;
  onSelectTab: (tabId: string) => void;
  onMoveTab: (fromIndex: number, toIndex: number) => void;
};

type DraggableTabProps = {
  index: number;
  tab: TodoTab;
  selected: boolean;
  canDelete: boolean;
  onRemoveTab: (tabId: string) => void;
  onRenameTab: (tabId: string, title: string) => void;
  onSelectTab: (tabId: string) => void;
  onMoveTab: (fromIndex: number, toIndex: number) => void;
};

type DragTab = { index: number };

function DraggableTab({
  index,
  tab,
  selected,
  canDelete,
  onRemoveTab,
  onRenameTab,
  onSelectTab,
  onMoveTab,
}: DraggableTabProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tab.title);

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: DND_TYPE,
      item: { index } satisfies DragTab,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: DND_TYPE,
      hover: (dragItem: DragTab) => {
        if (dragItem.index === index) {
          return;
        }
        onMoveTab(dragItem.index, index);
        dragItem.index = index;
      },
    }),
    [index, onMoveTab],
  );

  return (
    <Paper
      ref={(node: HTMLDivElement | null) => {
        dragRef(node);
        dropRef(node);
      }}
      variant={selected ? "elevation" : "outlined"}
      elevation={selected ? 2 : 0}
      sx={{
        minWidth: 180,
        opacity: isDragging ? 0.5 : 1,
        px: 1,
        py: 0.5,
        cursor: "pointer",
      }}
      onClick={() => onSelectTab(tab.id)}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <DragIndicatorIcon fontSize="small" color="action" />
        {editing ? (
          <TextField
            autoFocus
            size="small"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              onRenameTab(tab.id, draft);
              setEditing(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onRenameTab(tab.id, draft);
                setEditing(false);
              }
              if (event.key === "Escape") {
                setDraft(tab.title);
                setEditing(false);
              }
            }}
            sx={{ flex: 1 }}
          />
        ) : (
          <Typography
            variant="body2"
            noWrap
            onDoubleClick={() => {
              setDraft(tab.title);
              setEditing(true);
            }}
            sx={{ flex: 1 }}
          >
            {tab.title}
          </Typography>
        )}
        <IconButton
          size="small"
          disabled={!canDelete}
          onClick={(event) => {
            event.stopPropagation();
            onRemoveTab(tab.id);
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export function TabBar({
  tabs,
  activeTabId,
  onAddTab,
  onRemoveTab,
  onRenameTab,
  onSelectTab,
  onMoveTab,
}: TabBarProps) {
  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
        {tabs.map((tab, index) => (
          <DraggableTab
            key={tab.id}
            index={index}
            tab={tab}
            selected={tab.id === activeTabId}
            canDelete={tabs.length > 1}
            onRemoveTab={onRemoveTab}
            onRenameTab={onRenameTab}
            onSelectTab={onSelectTab}
            onMoveTab={onMoveTab}
          />
        ))}
        <Tooltip title="タブを追加">
          <IconButton onClick={onAddTab}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

import DarkModeIcon from "@mui/icons-material/DarkMode";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PushPinIcon from "@mui/icons-material/PushPin";
import {
  Box,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { ThemeMode } from "../types";

type SettingsMenuProps = {
  themeMode: ThemeMode;
  alwaysOnTop: boolean;
  onChangeTheme: (value: ThemeMode) => void;
  onChangeAlwaysOnTop: (value: boolean) => void;
};

export function SettingsMenu({
  themeMode,
  alwaysOnTop,
  onChangeTheme,
  onChangeAlwaysOnTop,
}: SettingsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disableRipple>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <DarkModeIcon fontSize="small" />
            <Typography variant="body2" sx={{ minWidth: 74 }}>
              テーマ
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={themeMode}
                onChange={(event) =>
                  onChangeTheme(event.target.value as ThemeMode)
                }
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MenuItem>

        <MenuItem disableRipple>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <PushPinIcon fontSize="small" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">常に手前に固定</Typography>
            </Box>
            <Switch
              checked={alwaysOnTop}
              onChange={(event) => onChangeAlwaysOnTop(event.target.checked)}
            />
          </Stack>
        </MenuItem>
      </Menu>
    </>
  );
}

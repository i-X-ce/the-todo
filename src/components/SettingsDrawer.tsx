import DarkModeIcon from "@mui/icons-material/DarkMode";
import PushPinIcon from "@mui/icons-material/PushPin";
import {
  Box,
  Divider,
  Drawer,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import type { ThemeMode } from "../types";

type SettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  alwaysOnTop: boolean;
  onChangeTheme: (value: ThemeMode) => void;
  onChangeAlwaysOnTop: (value: boolean) => void;
};

export function SettingsDrawer({
  open,
  onClose,
  themeMode,
  alwaysOnTop,
  onChangeTheme,
  onChangeAlwaysOnTop,
}: SettingsDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 280, p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <DarkModeIcon fontSize="small" />
          <Typography variant="body2" sx={{ minWidth: 72 }}>
            テーマ
          </Typography>
          <FormControl size="small" sx={{ minWidth: 140 }}>
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

        <Stack direction="row" spacing={1} alignItems="center">
          <PushPinIcon fontSize="small" />
          <Typography variant="body2" sx={{ flex: 1 }}>
            常に手前に固定
          </Typography>
          <Switch
            checked={alwaysOnTop}
            onChange={(event) => onChangeAlwaysOnTop(event.target.checked)}
          />
        </Stack>
      </Box>
    </Drawer>
  );
}

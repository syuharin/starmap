import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker as MuiDateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { IconButton, Box, Dialog, DialogContent } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

dayjs.locale("ja");

export const DateTimePicker = ({ selectedDate, onDateChange }) => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDateChange = (newDate) => {
    onDateChange(newDate);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        color="inherit"
        sx={{ mr: 1 }}
        aria-label="日時選択"
      >
        <CalendarTodayIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Box sx={{ width: "300px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
              <MuiDateTimePicker
                label="日時を選択"
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: "100%" }}
                minDateTime={dayjs().subtract(100, "year")}
                maxDateTime={dayjs().add(100, "year")}
                ampm={false}
                format="YYYY/MM/DD HH:mm"
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const SystemPrompt = ({ systemPrompt, setSystemPrompt }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        Custom Instructions
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            setSystemPrompt(formJson.systemPrompt);
            handleClose();
          },
        }}
      >
        <DialogTitle>Custom Instructions</DialogTitle>
        <DialogContent sx={{ minWidth: "500px", maxWidth: "1000px" }}>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="systemPrompt"
            label="System Prompt"
            fullWidth
            multiline
            rows={10}
            defaultValue={systemPrompt}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SystemPrompt;

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

const emptyForm = { task_name: "", description: "", priority: "Medium", status: "Pending", due_date: "" };

const TaskFormDialog = ({ open, onClose, onSubmit, initialData, submitting, projects = [], showProjectSelect = false }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              task_name: initialData.task_name || "",
              description: initialData.description || "",
              priority: initialData.priority || "Medium",
              status: initialData.status || "Pending",
              due_date: initialData.due_date || "",
              project_id: initialData.project_id || "",
            }
          : { ...emptyForm, project_id: "" }
      );
      setErrors({});
      setApiError("");
    }
  }, [open, initialData]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.task_name.trim()) errs.task_name = "Task name is required";
    if (showProjectSelect && !form.project_id) errs.project_id = "Please select a project";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setApiError("");
    if (!validate()) return;
    try {
      await onSubmit(form);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Edit Task" : "Create Task"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {apiError && <Alert severity="error">{apiError}</Alert>}
          <TextField
            label="Task Name"
            value={form.task_name}
            onChange={handleChange("task_name")}
            error={Boolean(errors.task_name)}
            helperText={errors.task_name}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            minRows={2}
          />
          {showProjectSelect && (
            <TextField label="Project" select value={form.project_id} onChange={handleChange("project_id")} error={Boolean(errors.project_id)} helperText={errors.project_id} fullWidth required>
              {projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}
            </TextField>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Priority" select value={form.priority} onChange={handleChange("priority")} fullWidth>
              {PRIORITY_OPTIONS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Status" select value={form.status} onChange={handleChange("status")} fullWidth>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="Due Date"
            type="date"
            value={form.due_date || ""}
            onChange={handleChange("due_date")}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Save Changes" : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormDialog;

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

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed"];

const emptyForm = { name: "", description: "", status: "Not Started", start_date: "", end_date: "", organization_id: "" };
const today = new Date().toISOString().slice(0, 10);

const ProjectFormDialog = ({ open, onClose, onSubmit, initialData, submitting, organizations = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              name: initialData.name || "",
              description: initialData.description || "",
              status: initialData.status || "Not Started",
              start_date: initialData.start_date || "",
              end_date: initialData.end_date || "",
              organization_id: initialData.organization_id || "",
            }
          : emptyForm
      );
      setErrors({});
      setApiError("");
    }
  }, [open, initialData]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required";
    if (!initialData && !form.organization_id) errs.organization_id = "Select an organization";
    if (form.start_date && form.start_date < today) errs.start_date = "Start date cannot be in the past";
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      errs.end_date = "End date cannot be before start date";
    }
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
      <DialogTitle>{initialData ? "Edit Project" : "Create Project"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {apiError && <Alert severity="error">{apiError}</Alert>}
          <TextField label="Organization" select value={form.organization_id} onChange={handleChange("organization_id")} fullWidth required disabled={Boolean(initialData)} error={Boolean(errors.organization_id)} helperText={errors.organization_id || (initialData ? "A project's organization cannot be changed." : "Example: Product Team. Only members can see this project.")}>
            {!initialData && <MenuItem value="" disabled>Select an organization (example: Product Team)</MenuItem>}
            {organizations.map((organization) => <MenuItem key={organization.id} value={organization.id}>{organization.name}</MenuItem>)}
          </TextField>
          <TextField
            label="Project Name"
            placeholder="Example: Website redesign"
            value={form.name}
            onChange={handleChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            required
          />
          <TextField
            label="Description"
            placeholder="Example: Refresh the company website before launch."
            value={form.description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField label="Status" select value={form.status} onChange={handleChange("status")} fullWidth>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
            <Stack spacing={0.75} sx={{ flex: 1, width: "100%" }}>
              <label htmlFor="project-start-date">Start date</label>
              <TextField id="project-start-date" type="date" value={form.start_date || ""} onChange={handleChange("start_date")} error={Boolean(errors.start_date)} helperText={errors.start_date || "Choose today or a future date."} inputProps={{ min: today }} fullWidth />
            </Stack>
            <Stack spacing={0.75} sx={{ flex: 1, width: "100%" }}>
              <label htmlFor="project-end-date">End date</label>
              <TextField id="project-end-date" type="date" value={form.end_date || ""} onChange={handleChange("end_date")} error={Boolean(errors.end_date)} helperText={errors.end_date || "Must be on or after the start date."} inputProps={{ min: form.start_date || today }} fullWidth />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Save Changes" : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectFormDialog;

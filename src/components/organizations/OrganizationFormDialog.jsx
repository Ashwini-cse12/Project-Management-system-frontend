import { useEffect, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";

const OrganizationFormDialog = ({ open, onClose, onSubmit, submitting }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setName(""); setError(""); } }, [open]);
  const submit = async () => {
    if (!name.trim()) return setError("Organization name is required");
    setError("");
    try { await onSubmit({ name: name.trim() }); } catch (err) { setError(err?.response?.data?.message || "Unable to create organization."); }
  };
  return <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Create organization</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required fullWidth label="Organization name" value={name} onChange={(event) => setName(event.target.value)} helperText="Only organization members can see its projects." />
    </Stack></DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={onClose} disabled={submitting}>Cancel</Button><Button variant="contained" onClick={submit} disabled={submitting}>{submitting ? "Creating..." : "Create organization"}</Button></DialogActions>
  </Dialog>;
};
export default OrganizationFormDialog;

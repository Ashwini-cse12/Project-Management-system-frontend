import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, TextField, Typography } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/ToastProvider";

const emptyPassword = { current_password: "", new_password: "", confirm_password: "" };
const actionButtonSx = { minWidth: 150, height: 42 };

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const [section, setSection] = useState("profile");
  const [profile, setProfile] = useState({ full_name: "", phone: "", company: "", avatar_url: null });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState(emptyPassword);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setProfile({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      company: user?.company || "",
      avatar_url: user?.avatar_url || null,
    });
  }, [user]);

  const clearNotice = () => {
    setMessage("");
    setError("");
  };

  const readAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Choose a JPG, PNG, GIF, or WebP image smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, avatar_url: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    clearNotice();
    try {
      await updateProfile(profile);
      const successMessage = "Your profile has been updated everywhere.";
      setMessage(successMessage);
      showToast(successMessage);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to save your profile.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    clearNotice();

    if (passwords.new_password !== passwords.confirm_password) {
      const message = "New password and confirmation do not match.";
      setError(message);
      showToast(message, "error");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwords);
      setPasswords(emptyPassword);
      const successMessage = "Your password has been changed successfully.";
      setMessage(successMessage);
      showToast(successMessage);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to change password.";
      setError(message);
      showToast(message, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const changeSection = (nextSection) => {
    setSection(nextSection);
    clearNotice();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1320, mx: "auto", pb: 4 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={750}>Settings</Typography>
        <Typography color="text.secondary" mt={0.5}>Manage your personal profile and account security.</Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "230px minmax(0, 1fr)" },
          overflow: "hidden",
          minHeight: 560,
          borderColor: "#E1EAF0",
          borderRadius: 2,
          boxShadow: "0 4px 14px rgba(23, 43, 61, 0.04)",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#F7FAFC", borderRight: { md: "1px solid #E5ECF0" }, borderBottom: { xs: "1px solid #E5ECF0", md: 0 } }}>
          <Typography fontWeight={700} sx={{ px: 1.25, mb: 1.25 }}>Settings</Typography>
          <List disablePadding>
            <ListItemButton selected={section === "profile"} onClick={() => changeSection("profile")} sx={{ borderRadius: 1.5, mb: 0.75, minHeight: 46 }}>
              <ListItemIcon sx={{ minWidth: 36 }}><PersonOutlineIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <ListItemButton selected={section === "security"} onClick={() => changeSection("security")} sx={{ borderRadius: 1.5, minHeight: 46 }}>
              <ListItemIcon sx={{ minWidth: 36 }}><SecurityOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Security" />
            </ListItemButton>
          </List>
        </Box>

        <Box sx={{ p: { xs: 2.25, sm: 3.5 }, minWidth: 0 }}>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {section === "profile" ? (
            <Box component="form" onSubmit={saveProfile}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Profile</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>Manage the details displayed across your workspace.</Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.25} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 3.5 }}>
                <Avatar src={profile.avatar_url || undefined} alt={profile.full_name} sx={{ width: 78, height: 78, bgcolor: "primary.main", fontSize: 28, flexShrink: 0 }}>
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                    <Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />} sx={actionButtonSx}>
                      Upload avatar
                      <input hidden type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={readAvatar} />
                    </Button>
                    {profile.avatar_url && (
                      <Button color="inherit" onClick={() => setProfile((current) => ({ ...current, avatar_url: null }))} sx={actionButtonSx}>
                        Remove
                      </Button>
                    )}
                  </Stack>
                  <Typography display="block" variant="caption" color="text.secondary" mt={0.75}>
                    JPG, PNG, GIF, or WebP. Maximum size 2 MB.
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2.25, maxWidth: 980 }}>
                <TextField label="Full name" value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} required fullWidth />
                <TextField label="Email address" value={user?.email || ""} disabled fullWidth />
                <TextField label="Phone number" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} fullWidth />
                <TextField label="Company" value={profile.company} onChange={(event) => setProfile((current) => ({ ...current, company: event.target.value }))} fullWidth />
              </Box>

              <Divider sx={{ my: 3 }} />
              <Stack direction="row" justifyContent="flex-end" sx={{ maxWidth: 980 }}>
                <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} disabled={saving} sx={actionButtonSx}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={savePassword} sx={{ maxWidth: 620 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Security</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>Change your password to keep your account secure.</Typography>
              </Box>

              <Stack spacing={2.25}>
                <TextField label="Current password" type="password" value={passwords.current_password} onChange={(event) => setPasswords((current) => ({ ...current, current_password: event.target.value }))} required fullWidth />
                <TextField label="New password" type="password" value={passwords.new_password} onChange={(event) => setPasswords((current) => ({ ...current, new_password: event.target.value }))} helperText="Use 8+ characters with uppercase, lowercase, number, and symbol." required fullWidth />
                <TextField label="Confirm new password" type="password" value={passwords.confirm_password} onChange={(event) => setPasswords((current) => ({ ...current, confirm_password: event.target.value }))} required fullWidth />
              </Stack>

              <Divider sx={{ my: 3 }} />
              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained" startIcon={<LockResetOutlinedIcon />} disabled={changingPassword} sx={actionButtonSx}>
                  {changingPassword ? "Updating..." : "Update"}
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;

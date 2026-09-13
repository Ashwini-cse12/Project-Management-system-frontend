import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Link, TextField, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AuthLayout from "../components/auth/AuthLayout";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Enter a valid email address"); return; }
    setError(""); setSubmitted(true);
  };
  return <AuthLayout eyebrow="PASSWORD RESET" title="Forgot password?" subtitle="Enter your email and we'll help you get back into your workspace.">
    {submitted && <Alert severity="success" sx={{ mb: 2 }}>If an account exists for this email, password reset instructions will be sent.</Alert>}
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography component="label" htmlFor="reset-email" display="block" fontWeight={600} fontSize="0.9rem" mb={0.9}>Email address</Typography>
      <TextField id="reset-email" type="email" placeholder="you@example.com" fullWidth value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} error={Boolean(error)} helperText={error} autoFocus sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }} />
      <Button type="submit" fullWidth variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, py: 1.45, borderRadius: 2, boxShadow: "0 10px 22px rgba(59, 115, 149, 0.24)", fontSize: "1rem" }}>Send reset link</Button>
    </Box>
    <Typography variant="body2" textAlign="center" color="text.secondary" mt={4}>Remember your password? <Link component={RouterLink} to="/login" fontWeight={600} underline="hover">Back to sign in</Link></Typography>
  </AuthLayout>;
};

export default ForgotPasswordPage;

import { Box, CircularProgress } from "@mui/material";

const LoadingSpinner = ({ fullHeight = true }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    sx={{ minHeight: fullHeight ? "60vh" : "120px" }}
  >
    <CircularProgress color="primary" />
  </Box>
);

export default LoadingSpinner;
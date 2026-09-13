import { Card, CardContent, Typography, Box } from "@mui/material";

const StatCard = ({ label, value, icon, color = "primary" }) => (
  <Card variant="outlined" sx={{ boxShadow: "none", borderColor: "#E7EDF1" }}>
    <CardContent sx={{ p: "20px !important" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;

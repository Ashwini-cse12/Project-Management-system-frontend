import { Box, Stack, Typography } from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";

const Brand = () => (
  <Stack direction="row" spacing={1.75} alignItems="center">
    <Box aria-hidden="true" sx={{ width: 46, height: 46, display: "grid", placeItems: "center", borderRadius: "14px", bgcolor: "rgba(159, 214, 239, 0.14)", border: "1px solid rgba(200, 236, 250, 0.22)" }}>
      <AccountTreeOutlinedIcon sx={{ color: "#B5E4F8", fontSize: 29 }} />
    </Box>
    <Typography fontWeight={700} fontSize="1.25rem" letterSpacing="-0.02em">ProjectFlow</Typography>
  </Stack>
);

const Feature = ({ icon, title, description }) => (
  <Box sx={{ display: "flex", gap: 1.75, alignItems: "center", px: 2, py: 1.5, borderRadius: 2.5, border: "1px solid rgba(203, 236, 248, 0.14)", bgcolor: "rgba(255, 255, 255, 0.07)" }}>
    <Box sx={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 2, bgcolor: "rgba(181, 228, 248, 0.13)", color: "#B5E4F8" }}>{icon}</Box>
    <Box>
      <Typography fontWeight={600} fontSize="0.94rem">{title}</Typography>
      <Typography color="rgba(225, 242, 249, 0.68)" fontSize="0.8rem">{description}</Typography>
    </Box>
  </Box>
);

const AuthLayout = ({ children, eyebrow, title, subtitle }) => (
  <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 0, sm: 2, lg: 5 }, py: { xs: 0, sm: 2 }, bgcolor: "#06131E", backgroundImage: "radial-gradient(rgba(114, 166, 190, .2) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
    <Box sx={{ width: "100%", maxWidth: "1500px", minHeight: { md: "calc(100dvh - 32px)" }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" }, overflow: "hidden", borderRadius: { xs: 0, sm: 3, lg: "42px" }, bgcolor: "#fff", boxShadow: "0 28px 70px rgba(0, 0, 0, .34)" }}>
      <Box sx={{ display: { xs: "none", md: "flex" }, position: "relative", overflow: "hidden", color: "#fff", p: { md: 5, lg: 6 }, flexDirection: "column", justifyContent: "center", background: "radial-gradient(circle at 76% 76%, rgba(52, 139, 181, .66) 0, rgba(52, 139, 181, 0) 32%), linear-gradient(145deg, #163247 0%, #214C65 58%, #326D8D 100%)", "&::before": { content: '\"\"', position: "absolute", inset: 0, opacity: 0.3, backgroundImage: "linear-gradient(rgba(191, 232, 247, .17) 1px, transparent 1px), linear-gradient(90deg, rgba(191, 232, 247, .17) 1px, transparent 1px)", backgroundSize: "36px 36px" }, "&::after": { content: '\"\"', position: "absolute", width: 420, height: 420, border: "1px solid rgba(184, 224, 239, .15)", borderRadius: "50%", right: -120, bottom: -90, boxShadow: "0 0 0 48px rgba(184, 224, 239, .035), 0 0 0 112px rgba(184, 224, 239, .025)" } }}>
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
          <Brand />
          <Typography component="h1" sx={{ fontSize: { md: "2.45rem", lg: "3rem" }, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.045em", mt: 6, mb: 2 }}>Bring every project into focus.</Typography>
          <Typography sx={{ maxWidth: 510, color: "rgba(225, 242, 249, 0.76)", fontSize: "1.05rem", lineHeight: 1.7, mb: 4.5 }}>Plan work, align your team, and turn every milestone into meaningful progress — all in one place.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.5, mb: 4.25 }}>{[['Projects', 'In one workspace'], ['Tasks', 'Clearly owned'], ['Progress', 'Always visible']].map(([number, label]) => <Box key={number} sx={{ minWidth: 0, px: 1, py: 1.5, textAlign: "center", border: "1px solid rgba(203, 236, 248, 0.15)", borderRadius: 2.5, bgcolor: "rgba(255, 255, 255, 0.07)" }}><Typography fontWeight={700} fontSize="1.05rem">{number}</Typography><Typography fontSize="0.72rem" color="rgba(225, 242, 249, 0.68)">{label}</Typography></Box>)}</Box>
          <Stack spacing={1.25}><Feature icon={<TaskAltOutlinedIcon fontSize="small" />} title="Keep work on track" description="Create tasks, set priorities, and meet every deadline." /><Feature icon={<CalendarMonthOutlinedIcon fontSize="small" />} title="Plan with confidence" description="See milestones and team activity in one clear view." /></Stack>
        </Box>
      </Box>
      <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 5, md: 6, lg: 8 }, bgcolor: "#fff" }}>
        <Box sx={{ width: "100%", maxWidth: 460 }}>
          <Box sx={{ display: { md: "none" }, color: "secondary.main", mb: 5 }}><Brand /></Box>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}>{eyebrow}</Typography>
          <Typography component="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "2.2rem", sm: "2.65rem" }, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.1, color: "#17212B" }}>{title}</Typography>
          <Typography color="text.secondary" fontSize="1.04rem" mb={4}>{subtitle}</Typography>
          {children}
        </Box>
      </Box>
    </Box>
  </Box>
);

export default AuthLayout;

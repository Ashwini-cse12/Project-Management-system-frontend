import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";
import { getOrganizations } from "../../api/organizationApi";
import theme from "../../theme/theme";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Projects", path: "/projects", icon: <FolderIcon /> },
  { label: "My Tasks", path: "/tasks", icon: <AssignmentIcon /> },
  { label: "Calendar", path: "/calendar", icon: <CalendarMonthIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon /> },
];

const ProjectFlowLogo = () => (
  <Box
    aria-hidden="true"
    sx={{
      width: 32,
      height: 32,
      mr: 1.25,
      display: "grid",
      placeItems: "center",
      borderRadius: "10px",
      bgcolor: "#4F9BBE",
      boxShadow: "0 5px 12px rgba(79, 155, 190, 0.28)",
      flexShrink: 0,
    }}
  >
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.25" y="4" width="7.5" height="6.5" rx="1.5" stroke="white" strokeWidth="1.8" />
      <path d="M6.4 7.15L7.55 8.3L9.55 6.25" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13.25" y="13.5" width="7.5" height="6.5" rx="1.5" stroke="white" strokeWidth="1.8" />
      <path d="M10.75 7.25H13.2C14.3 7.25 15.2 8.15 15.2 9.25V13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 15.75V17.75M15.95 16.75H18.05" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </Box>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

  useEffect(() => {
    if (!user?.id) return undefined;
    const storageKey = `selectedOrganization:${user.id}`;
    const selectOrganization = (organization) => {
      setSelectedOrganizationId(organization.id);
      localStorage.setItem(storageKey, String(organization.id));
    };
    const loadOrganizations = async () => {
      try {
        const response = await getOrganizations();
        const list = response.data.data;
        setOrganizations(list);
        const savedId = Number(localStorage.getItem(storageKey));
        setSelectedOrganizationId(list.some((organization) => organization.id === savedId) ? savedId : list[0]?.id || null);
      } catch {
        setOrganizations([]);
      }
    };
    const handleOrganizationCreated = (event) => {
      const organization = event.detail;
      if (!organization?.id) return loadOrganizations();
      setOrganizations((current) => [organization, ...current.filter((item) => item.id !== organization.id)]);
      selectOrganization(organization);
    };
    loadOrganizations();
    window.addEventListener("organization-created", handleOrganizationCreated);
    return () => window.removeEventListener("organization-created", handleOrganizationCreated);
  }, [user?.id]);

  const selectedOrganization = organizations.find((organization) => organization.id === selectedOrganizationId) || organizations[0];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box sx={{ mt: 1.5, px: 0.5, flexGrow: 1, display: "flex", flexDirection: "column", color: "rgba(255, 255, 255, 0.76)" }}>
      <Tooltip title={selectedOrganization?.name || "Create an organization from the dashboard"} placement="right">
        <Box sx={{ mx: 1.5, mb: 1.5, px: 1.25, py: 1.1, borderRadius: 2, display: "flex", alignItems: "center", gap: 1.1, bgcolor: "rgba(255, 255, 255, 0.08)" }}>
          <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: "#EF5350", fontWeight: 700, fontSize: 14 }}>
            {selectedOrganization?.name?.charAt(0).toUpperCase() || "O"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap fontWeight={700} fontSize="0.9rem" color="#fff">{selectedOrganization?.name || "No organization"}</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.66)">{organizations.length} workspace{organizations.length === 1 ? "" : "s"}</Typography>
          </Box>
        </Box>
      </Tooltip>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: 2.5,
              mb: 0.75,
              minHeight: 48,
              color: "rgba(255, 255, 255, 0.76)",
              "& .MuiListItemIcon-root": { color: "inherit" },
              "&.Mui-selected": {
                bgcolor: "rgba(110, 182, 218, 0.28)",
                color: "#ffffff",
                "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                "&:hover": { bgcolor: "rgba(110, 182, 218, 0.35)" },
              },
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", px: 1, pb: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2.5, minHeight: 48, color: "rgba(255, 255, 255, 0.8)", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" } }}>
          <ListItemIcon sx={{ color: "inherit" }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" color="secondary" sx={{ zIndex: (t) => t.zIndex.drawer + 1, boxShadow: "0 2px 8px rgba(8, 23, 36, 0.24)" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <ProjectFlowLogo />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Project Management System
          </Typography>
          <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ p: 0 }} aria-label="Open user menu">
            <Avatar src={user?.avatar_url || undefined} alt={user?.full_name || "User"} sx={{ width: 38, height: 38, bgcolor: "primary.main", fontWeight: 600 }}>
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} slotProps={{ paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2 } } }}>
            <MenuItem disabled sx={{ opacity: "1 !important", color: "text.secondary" }}>{user?.full_name}</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, bgcolor: "#152433" } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", bgcolor: "#152433" } }}
          open
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;

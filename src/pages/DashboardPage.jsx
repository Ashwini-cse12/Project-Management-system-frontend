import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, Divider, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getDashboardStats } from "../api/dashboardApi";
import { getTasks } from "../api/taskApi";
import { getProjects } from "../api/projectApi";
import { createOrganization, getOrganizations } from "../api/organizationApi";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import OrganizationFormDialog from "../components/organizations/OrganizationFormDialog";
import { useToast } from "../components/common/ToastProvider";

const panelStyle = { border: "1px solid #E5ECF0", boxShadow: "none", borderRadius: 1, bgcolor: "#fff" };
const actionButtonSx = { minWidth: 150, height: 42 };

const Stat = ({ label, value, caption, icon, tone }) => (
  <Paper sx={{ ...panelStyle, p: 2.4, minWidth: 0 }}>
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" fontWeight={700} mt={0.7}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{caption}</Typography>
      </Box>
      <Box sx={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 2, bgcolor: tone, color: "primary.main", flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Paper>
);

const SectionTitle = ({ title, action }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.7 }}>
    <Typography fontWeight={700}>{title}</Typography>
    {action}
  </Stack>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [organizationOpen, setOrganizationOpen] = useState(false);
  const [creatingOrganization, setCreatingOrganization] = useState(false);

  const load = () => Promise.all([getDashboardStats(), getTasks({ limit: 100 }), getProjects({ limit: 100 }), getOrganizations()])
    .then(([stats, tasks, projects]) => setData({ stats: stats.data.data, tasks: tasks.data.data, projects: projects.data.data }))
    .catch((err) => setError(err?.response?.data?.message || "Failed to load dashboard."))
    .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const { stats, tasks, projects } = data || { stats: {}, tasks: [], projects: [] };
  const query = search.trim().toLowerCase();
  const matches = (item, fields) => !query || fields.some((field) => item[field]?.toLowerCase().includes(query));
  const visibleProjects = projects.filter((project) => matches(project, ["name", "description"]));
  const visibleTasks = tasks.filter((task) => matches(task, ["task_name", "description"]));
  const today = new Date().toISOString().slice(0, 10);
  const openTasks = visibleTasks.filter((task) => task.status !== "Completed");
  const overdue = openTasks.filter((task) => task.due_date && task.due_date < today);
  const upcoming = openTasks
    .filter((task) => !task.due_date || task.due_date >= today)
    .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"))
    .slice(0, 4);
  const activeProjects = visibleProjects.filter((project) => project.status === "In Progress").slice(0, 4);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const submitOrganization = async (form) => {
    setCreatingOrganization(true);
    try {
      const response = await createOrganization(form);
      window.dispatchEvent(new CustomEvent("organization-created", { detail: response.data.data }));
      showToast("Organization created successfully.");
      setOrganizationOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || "Unable to create organization.", "error");
      throw err;
    } finally {
      setCreatingOrganization(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" }, gap: 2, mb: 2, alignItems: "start" }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Welcome back, {firstName}</Typography>
          <Typography color="text.secondary" mt={0.5}>Here's what is happening with your projects today.</Typography>
        </Box>
        <Stack direction="row" spacing={1} justifyContent={{ xs: "stretch", sm: "end" }}>
          <Button variant="outlined" startIcon={<BusinessOutlinedIcon />} onClick={() => setOrganizationOpen(true)} sx={actionButtonSx}>
            Organization
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/projects")} sx={actionButtonSx}>
            New Project
          </Button>
        </Stack>
      </Box>

      <TextField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects and tasks..." fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
      {query && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Showing {visibleProjects.length} projects and {visibleTasks.length} tasks matching "{search}".</Typography>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 2, mb: 2.5, "@media (max-width: 1250px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }, "@media (max-width: 760px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }, "@media (max-width: 460px)": { gridTemplateColumns: "1fr" } }}>
        <Stat label="Total Projects" value={stats.total_projects || 0} caption="in your organizations" icon={<FolderOutlinedIcon />} tone="#E8F3FF" />
        <Stat label="Completed Projects" value={projects.filter((p) => p.status === "Completed").length} caption="of total projects" icon={<CheckCircleOutlinedIcon />} tone="#E8F8F0" />
        <Stat label="My Tasks" value={stats.total_tasks || 0} caption="across visible projects" icon={<AssignmentOutlinedIcon />} tone="#F7ECFF" />
        <Stat label="In Progress" value={stats.tasks_in_progress || 0} caption="tasks underway" icon={<TrendingUpOutlinedIcon />} tone="#EEF2FF" />
        <Stat label="Overdue" value={overdue.length} caption="need attention" icon={<WarningAmberOutlinedIcon />} tone="#FFF3DF" />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(300px, .95fr)", gap: 2.5, "@media (max-width: 900px)": { gridTemplateColumns: "1fr" } }}>
        <Stack spacing={2.5}>
          <Paper sx={panelStyle}>
            <SectionTitle title="Project Overview" action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/projects")}>View all</Button>} />
            <Divider />
            {activeProjects.length ? (
              <Stack divider={<Divider />}>
                {activeProjects.map((project) => (
                  <Stack key={project.id} direction="row" justifyContent="space-between" sx={{ px: 2.5, py: 1.4 }}>
                    <Box>
                      <Typography fontWeight={600}>{project.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{project.end_date ? `Due ${project.end_date}` : "No due date"}</Typography>
                    </Box>
                    <Chip label="In progress" size="small" color="primary" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography fontWeight={600}>No matching active projects</Typography>
                <Typography variant="body2" color="text.secondary">Create a project to start planning work.</Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={panelStyle}>
            <SectionTitle title="Recent Activity" />
            <Divider />
            <Stack sx={{ p: 2.25 }} spacing={1.6}>
              {[...visibleProjects, ...visibleTasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4).map((item) => (
                <Stack key={`${item.id}-${item.task_name || item.name}`} direction="row" spacing={1.4}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", mt: 0.8, bgcolor: item.task_name ? "warning.main" : "primary.main" }} />
                  <Typography variant="body2"><b>{item.task_name ? "Task created:" : "Project created:"}</b> {item.task_name || item.name}</Typography>
                </Stack>
              ))}
              {!visibleProjects.length && !visibleTasks.length && <Typography color="text.secondary" variant="body2">No matching activity.</Typography>}
            </Stack>
          </Paper>
        </Stack>

        <Stack spacing={2.5}>
          <Paper sx={panelStyle}>
            <SectionTitle title="My Tasks" action={<Chip label={openTasks.length} size="small" color="primary" />} />
            <Divider />
            <Stack spacing={1} sx={{ p: 1.5 }}>
              {upcoming.length ? upcoming.map((task) => (
                <Box key={task.id} sx={{ p: 1.25, borderRadius: 2, bgcolor: "#F7FAFC" }}>
                  <Typography fontWeight={600} variant="body2">{task.task_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{task.due_date ? `Due ${task.due_date}` : "No due date"}</Typography>
                </Box>
              )) : <Typography color="text.secondary" variant="body2">No open tasks</Typography>}
            </Stack>
          </Paper>
          <Paper sx={panelStyle}>
            <SectionTitle title="Overdue" action={<Chip label={overdue.length} size="small" color="error" />} />
            <Divider />
            <Box sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">{overdue.length ? `${overdue.length} task(s) need attention.` : "No overdue tasks"}</Typography></Box>
          </Paper>
          <Paper sx={panelStyle}>
            <SectionTitle title="In Progress" action={<Chip label={stats.projects_in_progress || 0} size="small" color="success" />} />
            <Divider />
            <Box sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">{stats.projects_in_progress || 0} projects currently in progress.</Typography></Box>
          </Paper>
        </Stack>
      </Box>

      <OrganizationFormDialog open={organizationOpen} onClose={() => setOrganizationOpen(false)} onSubmit={submitOrganization} submitting={creatingOrganization} />
    </Box>
  );
};

export default DashboardPage;

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ProjectFormDialog from "../components/projects/ProjectFormDialog";
import { createProject, deleteProject, getProjectSummary, getProjects, updateProject } from "../api/projectApi";
import { getOrganizations } from "../api/organizationApi";
import { useToast } from "../components/common/ToastProvider";

const STATUS_FILTERS = ["All", "Not Started", "In Progress", "Completed"];
const PROJECTS_PER_PAGE = 4;

const statusStyle = {
  "Not Started": { label: "Not started", color: "default" },
  "In Progress": { label: "Active", color: "success" },
  Completed: { label: "Completed", color: "primary" },
};

const primaryButtonSx = { minWidth: 150, height: 42 };

const StatCard = ({ label, value, icon, tint, iconColor }) => (
  <Card variant="outlined" sx={{ borderColor: "#E3EBF0", boxShadow: "none", borderRadius: 2 }}>
    <CardContent sx={{ p: "16px !important" }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 1.5, bgcolor: tint, color: iconColor }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: 10 }}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={750}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const ProjectsPage = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, completed: 0, not_started: 0 });
  const [organizations, setOrganizations] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuProject, setMenuProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: PROJECTS_PER_PAGE };
      if (search) params.search = search;
      if (status !== "All") params.status = status;

      const [projectResponse, summaryResponse] = await Promise.all([getProjects(params), getProjectSummary()]);
      setProjects(projectResponse.data.data);
      setMeta(projectResponse.data.meta);
      setSummary(summaryResponse.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 250);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  useEffect(() => {
    getOrganizations()
      .then((res) => setOrganizations(res.data.data))
      .catch(() => setError("Failed to load organizations."));
  }, []);

  const openCreate = () => {
    if (!organizations.length) {
      const message = "Create an organization from the dashboard before creating a project.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    setEditingProject(null);
    setFormOpen(true);
  };

  const openMenu = (event, project) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuProject(project);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuProject(null);
  };

  const viewProject = () => {
    setViewingProject(menuProject);
    closeMenu();
  };

  const editProject = () => {
    setEditingProject(menuProject);
    setFormOpen(true);
    closeMenu();
  };

  const deleteFromMenu = () => {
    setDeletingId(menuProject?.id);
    setConfirmOpen(true);
    closeMenu();
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        showToast("Project updated successfully.");
      } else {
        await createProject(formData);
        showToast("Project created successfully.");
      }
      setFormOpen(false);
      fetchProjects();
    } catch (err) {
      showToast(err?.response?.data?.message || "Unable to save project.", "error");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(deletingId);
      showToast("Project deleted successfully.");
      setConfirmOpen(false);
      if (projects.length === 1 && page > 1) setPage(page - 1);
      else fetchProjects();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete project.";
      setError(message);
      showToast(message, "error");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1320, mx: "auto", pb: 4 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" }, gap: 2, alignItems: "center", mb: 2.5 }}>
        <Typography variant="h5" fontWeight={750}>
          Projects Dashboard
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ ...primaryButtonSx, justifySelf: { xs: "stretch", sm: "end" } }}>
          Create Project
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 1.75, mb: 2.25 }}>
        <StatCard label="TOTAL PROJECTS" value={summary.total} icon={<FolderOutlinedIcon />} tint="#EEF8FF" iconColor="#2877A8" />
        <StatCard label="ACTIVE PROJECTS" value={summary.active} icon={<CheckCircleOutlinedIcon />} tint="#ECF9F0" iconColor="#319455" />
        <StatCard label="NOT STARTED" value={summary.not_started} icon={<PendingActionsOutlinedIcon />} tint="#FFF6E6" iconColor="#DD8B18" />
        <StatCard label="COMPLETED" value={summary.completed} icon={<TaskAltOutlinedIcon />} tint="#F0F3FF" iconColor="#4B6DCD" />
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.75} sx={{ mb: 2.25 }}>
        <TextField
          placeholder="Search by project name..."
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select label="Status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} sx={{ minWidth: { md: 190 } }}>
          {STATUS_FILTERS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <LoadingSpinner fullHeight={false} />
      ) : projects.length === 0 ? (
        <Alert severity="info">No projects found. Create your first project to get started.</Alert>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(280px, 320px))" }, gap: 2.25, alignItems: "stretch" }}>
            {projects.map((project) => {
              const presentation = statusStyle[project.status] || statusStyle["Not Started"];
              return (
                <Card
                  key={project.id}
                  onClick={() => setViewingProject(project)}
                  sx={{
                    minHeight: 205,
                    width: "100%",
                    maxWidth: 320,
                    cursor: "pointer",
                    position: "relative",
                    border: "1px solid #E5ECF0",
                    borderRadius: 2,
                    boxShadow: "0 5px 15px rgba(23, 43, 61, 0.06)",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <IconButton aria-label={`Actions for ${project.name}`} size="small" onClick={(event) => openMenu(event, project)} sx={{ position: "absolute", top: 18, right: 18, zIndex: 2 }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <CardContent sx={{ p: 2.2, pr: 7, height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box>
                      <Typography fontWeight={750} noWrap>{project.name}</Typography>
                      <Typography variant="caption" color="text.secondary">PROJECT-{String(project.id).padStart(4, "0")}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, minHeight: 39, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {project.description || "No description provided."}
                    </Typography>
                    <Box sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid #EDF1F4" }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1} noWrap>
                        {project.start_date || "No start date"} - {project.end_date || "No end date"}
                      </Typography>
                      <Chip label={presentation.label} color={presentation.color} size="small" />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5} sx={{ mt: 3, pt: 2, borderTop: "1px solid #E5ECF0" }}>
            <Typography variant="body2" color="text.secondary">
              Showing {projects.length} of {meta.total} projects
            </Typography>
            {meta.totalPages > 1 && <Pagination count={meta.totalPages} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" />}
          </Stack>
        </>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={viewProject}><VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1.2 }} />View project</MenuItem>
        <MenuItem onClick={editProject}><EditOutlinedIcon fontSize="small" sx={{ mr: 1.2 }} />Edit project</MenuItem>
        <MenuItem onClick={deleteFromMenu} sx={{ color: "error.main" }}><DeleteIcon fontSize="small" sx={{ mr: 1.2 }} />Delete project</MenuItem>
      </Menu>

      <ProjectFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} initialData={editingProject} submitting={submitting} organizations={organizations} />
      <ConfirmDialog open={confirmOpen} title="Delete Project" message="This will permanently delete the project and all of its tasks. This action cannot be undone." onConfirm={handleConfirmDelete} onCancel={() => setConfirmOpen(false)} loading={deleting} />

      <Dialog open={Boolean(viewingProject)} onClose={() => setViewingProject(null)} fullWidth maxWidth="sm">
        <DialogTitle>Project details</DialogTitle>
        <DialogContent dividers>
          {viewingProject && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">{viewingProject.name}</Typography>
                <Typography variant="body2" color="text.secondary">PROJECT-{String(viewingProject.id).padStart(4, "0")}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2">Description</Typography>
                <Typography color="text.secondary">{viewingProject.description || "No description provided."}</Typography>
              </Box>
              <Stack direction="row" spacing={5}>
                <Box>
                  <Typography variant="subtitle2">Start date</Typography>
                  <Typography color="text.secondary">{viewingProject.start_date || "Not set"}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">End date</Typography>
                  <Typography color="text.secondary">{viewingProject.end_date || "Not set"}</Typography>
                </Box>
              </Stack>
              <Chip label={viewingProject.status} size="small" sx={{ alignSelf: "flex-start" }} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingProject(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;

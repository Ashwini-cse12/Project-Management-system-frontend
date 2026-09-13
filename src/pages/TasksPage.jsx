import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { createTask, deleteTask, getTasks, updateTask, completeTask } from "../api/taskApi";
import { getProjects } from "../api/projectApi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import TaskFormDialog from "../components/tasks/TaskFormDialog";
import { useToast } from "../components/common/ToastProvider";

const STATUS_FILTERS = ["All", "Pending", "In Progress", "Completed"];
const PRIORITY_FILTERS = ["All", "Low", "Medium", "High"];
const TASKS_PER_PAGE = 5;

const priorityColor = (priority) => (priority === "High" ? "error" : priority === "Medium" ? "warning" : "default");
const statusColor = (status) => (status === "Completed" ? "success" : status === "In Progress" ? "primary" : "warning");
const primaryButtonSx = { minWidth: 150, height: 42 };

const StatCard = ({ label, value, icon, tint, iconColor }) => (
  <Card variant="outlined" sx={{ borderColor: "#E3EBF0", borderRadius: 2, boxShadow: "none" }}>
    <CardContent sx={{ p: "16px !important" }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 1.5, bgcolor: tint, color: iconColor }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: 10, lineHeight: 1.2 }}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={750} lineHeight={1.2}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const TasksPage = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskRes, projectRes] = await Promise.all([getTasks({ limit: 100 }), getProjects({ limit: 100 })]);
      setTasks(taskRes.data.data);
      setProjects(projectRes.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter]);

  const projectName = (id) => projects.find((project) => Number(project.id) === Number(id))?.name || "Project";

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const query = search.trim().toLowerCase();
    return (!query || [task.task_name, task.description, projectName(task.project_id)].some((value) => value?.toLowerCase().includes(query)))
      && (statusFilter === "All" || task.status === statusFilter)
      && (priorityFilter === "All" || task.priority === priorityFilter);
  }), [tasks, search, statusFilter, priorityFilter, projects]);

  const totalPages = Math.max(Math.ceil(visibleTasks.length / TASKS_PER_PAGE), 1);
  const paginatedTasks = visibleTasks.slice((page - 1) * TASKS_PER_PAGE, page * TASKS_PER_PAGE);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    inProgress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length,
  }), [tasks]);

  const openCreate = () => {
    if (!projects.length) {
      const message = "Create a project before adding a task.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
        showToast("Task updated successfully.");
      } else {
        await createTask({ ...formData, project_id: Number(formData.project_id) });
        showToast("Task created successfully.");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || "Unable to save task.", "error");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = async (task) => {
    if (task.status === "Completed") return;
    try {
      await completeTask(task.id);
      showToast("Task marked as completed.");
      load();
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to update the task.";
      setError(message);
      showToast(message, "error");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(deletingId);
      showToast("Task deleted successfully.");
      setConfirmOpen(false);
      load();
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to delete the task.";
      setError(message);
      showToast(message, "error");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ maxWidth: 1320, mx: "auto", pb: 4 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" }, gap: 2, alignItems: "center", mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={750}>My Tasks</Typography>
          <Typography color="text.secondary">Manage tasks across all your projects in one place.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ ...primaryButtonSx, justifySelf: { xs: "stretch", sm: "end" } }}>
          Create Task
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 1.75, mb: 2.25 }}>
        <StatCard label="TOTAL TASKS" value={stats.total} icon={<AssignmentOutlinedIcon />} tint="#EEF8FF" iconColor="#2877A8" />
        <StatCard label="PENDING" value={stats.pending} icon={<PendingActionsOutlinedIcon />} tint="#FFF6E6" iconColor="#DD8B18" />
        <StatCard label="IN PROGRESS" value={stats.inProgress} icon={<TrendingUpOutlinedIcon />} tint="#EEF2FF" iconColor="#4B6DCD" />
        <StatCard label="COMPLETED" value={stats.completed} icon={<TaskAltOutlinedIcon />} tint="#ECF9F0" iconColor="#319455" />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.75} sx={{ mb: 2.25 }}>
        <TextField
          placeholder="Search by task, project, or description..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: { md: 180 } }}>
          {STATUS_FILTERS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} sx={{ minWidth: { md: 180 } }}>
          {PRIORITY_FILTERS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F7FAFC" }}>
                <TableCell padding="checkbox" />
                <TableCell sx={{ fontWeight: 700 }}>TASK</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PROJECT</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PRIORITY</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>DUE DATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.map((task) => (
                <TableRow key={task.id} hover sx={{ opacity: task.status === "Completed" ? 0.65 : 1 }}>
                  <TableCell padding="checkbox"><Checkbox checked={task.status === "Completed"} onChange={() => toggle(task)} /></TableCell>
                  <TableCell>
                    <Typography fontWeight={600} sx={{ textDecoration: task.status === "Completed" ? "line-through" : "none" }}>{task.task_name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260, display: "block" }}>{task.description || "No description"}</Typography>
                  </TableCell>
                  <TableCell>{projectName(task.project_id)}</TableCell>
                  <TableCell><Chip label={task.priority} size="small" color={priorityColor(task.priority)} /></TableCell>
                  <TableCell><Chip label={task.status} size="small" color={statusColor(task.status)} variant="outlined" /></TableCell>
                  <TableCell>{task.due_date || "Not set"}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label={`View ${task.task_name}`} size="small" onClick={() => setViewingTask(task)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                    <IconButton aria-label={`Edit ${task.task_name}`} size="small" onClick={() => { setEditingTask(task); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton aria-label={`Delete ${task.task_name}`} size="small" color="error" onClick={() => { setDeletingId(task.id); setConfirmOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!visibleTasks.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No tasks match your search or filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5} sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #E5ECF0" }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedTasks.length} of {visibleTasks.length} tasks
          </Typography>
          {totalPages > 1 && <Pagination count={totalPages} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" />}
        </Stack>
      </Paper>

      <TaskFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editingTask} submitting={submitting} projects={projects} showProjectSelect={!editingTask} />
      <ConfirmDialog open={confirmOpen} title="Delete Task" message="This will permanently delete this task. This action cannot be undone." onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} loading={deleting} />

      <Dialog open={Boolean(viewingTask)} onClose={() => setViewingTask(null)} fullWidth maxWidth="sm">
        <DialogTitle>Task details</DialogTitle>
        <DialogContent dividers>
          {viewingTask && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">{viewingTask.task_name}</Typography>
                <Typography variant="body2" color="text.secondary">{projectName(viewingTask.project_id)}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2">Description</Typography>
                <Typography color="text.secondary">{viewingTask.description || "No description provided."}</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box>
                  <Typography variant="subtitle2">Priority</Typography>
                  <Chip label={viewingTask.priority} color={priorityColor(viewingTask.priority)} size="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip label={viewingTask.status} color={statusColor(viewingTask.status)} variant="outlined" size="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Due date</Typography>
                  <Typography color="text.secondary">{viewingTask.due_date || "Not set"}</Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksPage;

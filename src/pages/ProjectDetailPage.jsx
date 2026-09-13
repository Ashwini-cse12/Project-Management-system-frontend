import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  Alert,
  Checkbox,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Breadcrumbs,
  Link,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import TaskFormDialog from "../components/tasks/TaskFormDialog";
import { getProject } from "../api/projectApi";
import { getTasks, createTask, updateTask, completeTask, deleteTask } from "../api/taskApi";

const PRIORITY_FILTERS = ["All", "Low", "Medium", "High"];
const STATUS_FILTERS = ["All", "Pending", "In Progress", "Completed"];

const priorityColor = (priority) => {
  if (priority === "High") return "error";
  if (priority === "Medium") return "warning";
  return "default";
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projectRes, tasksRes] = await Promise.all([
        getProject(id),
        getTasks({
          project_id: id,
          ...(statusFilter !== "All" && { status: statusFilter }),
          ...(priorityFilter !== "All" && { priority: priorityFilter }),
          limit: 100,
        }),
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load project.");
    } finally {
      setLoading(false);
    }
  }, [id, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask({ ...formData, project_id: Number(id) });
      }
      setFormOpen(false);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    if (task.status === "Completed") return;
    try {
      await completeTask(task.id);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update task.");
    }
  };

  const handleDeleteClick = (taskId) => {
    setDeletingId(taskId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(deletingId);
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete task.");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!project) {
    return <Alert severity="error">{error || "Project not found."}</Alert>;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component="button" underline="hover" color="inherit" onClick={() => navigate("/projects")}>
          Projects
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
        <IconButton size="small" onClick={() => navigate("/projects")}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          {project.name}
        </Typography>
        <Chip label={project.status} size="small" />
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={3} ml={5}>
        {project.description || "No description provided."}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} mb={2}>
        <Typography variant="h6">Tasks</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Task
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 180 }}>
          {STATUS_FILTERS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} sx={{ minWidth: 180 }}>
          {PRIORITY_FILTERS.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {tasks.length === 0 ? (
        <Alert severity="info">No tasks match these filters.</Alert>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {tasks.map((task, idx) => (
              <ListItem
                key={task.id}
                divider={idx < tasks.length - 1}
                sx={{ opacity: task.status === "Completed" ? 0.6 : 1 }}
              >
                <Checkbox
                  checked={task.status === "Completed"}
                  onChange={() => handleToggleComplete(task)}
                  sx={{ mr: 1 }}
                />
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ textDecoration: task.status === "Completed" ? "line-through" : "none" }}>
                        {task.task_name}
                      </Typography>
                      <Chip label={task.priority} size="small" color={priorityColor(task.priority)} />
                      <Chip label={task.status} size="small" variant="outlined" />
                    </Stack>
                  }
                  secondary={
                    <>
                      {task.description && <>{task.description} · </>}
                      {task.due_date ? `Due ${task.due_date}` : "No due date"}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" onClick={() => openEdit(task)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(task.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <TaskFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        submitting={submitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Task"
        message="This will permanently delete this task. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </Box>
  );
};

export default ProjectDetailPage;
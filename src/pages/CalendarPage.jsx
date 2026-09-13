import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { getProjects } from "../api/projectApi";
import { getTasks } from "../api/taskApi";
import LoadingSpinner from "../components/common/LoadingSpinner";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const YearMonth = ({ year, month, eventsByDate, onSelectDate }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  return <Paper variant="outlined" sx={{ p: 2, borderColor: "#DCE7EE", minWidth: 0 }}>
    <Typography fontWeight={700} mb={1.25}>{new Date(year, month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Typography>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", textAlign: "center", rowGap: 0.45 }}>
      {weekdays.map((day) => <Typography key={day} variant="caption" color="text.secondary" fontWeight={600} sx={{ pb: 0.4 }}>{day}</Typography>)}
      {cells.map((day, index) => { if (!day) return <Box key={`blank-${index}`} />; const key = dateKey(year, month, day); const dayEvents = eventsByDate[key] || []; const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day; const hasProject = dayEvents.some((event) => event.kind === "Project due"); const hasTask = dayEvents.some((event) => event.kind === "Task due"); return <Tooltip key={key} title={dayEvents.length ? dayEvents.map((event) => `${event.kind}: ${event.title}`).join(" | ") : ""} disableHoverListener={!dayEvents.length}><Box component="button" type="button" onClick={() => dayEvents.length && onSelectDate(key)} sx={{ border: 0, bgcolor: dayEvents.length ? "#F2F8FC" : "transparent", cursor: dayEvents.length ? "pointer" : "default", color: "text.primary", minHeight: 34, borderRadius: 1.25, font: "inherit", position: "relative", fontWeight: isToday ? 700 : 400, outline: isToday ? "2px solid #3B7395" : "none", outlineOffset: -2, "&:hover": dayEvents.length ? { bgcolor: "#E3F0F7" } : {} }}>{day}<Box sx={{ height: 5, display: "flex", justifyContent: "center", gap: "3px", mt: 0.15 }}>{hasProject && <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "primary.main" }} />}{hasTask && <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "warning.main" }} />}</Box></Box></Tooltip>; })}
    </Box>
  </Paper>;
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [year, setYear] = useState(new Date().getFullYear()); const [selectedDate, setSelectedDate] = useState(null);
  useEffect(() => { Promise.all([getProjects({ limit: 100 }), getTasks({ limit: 100 })]).then(([projects, tasks]) => { const projectEvents = projects.data.data.filter((project) => project.end_date).map((project) => ({ id: `project-${project.id}`, date: project.end_date, title: project.name, description: project.description, kind: "Project due" })); const taskEvents = tasks.data.data.filter((task) => task.due_date).map((task) => ({ id: `task-${task.id}`, date: task.due_date, title: task.task_name, description: task.description, status: task.status, kind: "Task due" })); setEvents([...projectEvents, ...taskEvents]); }).catch((err) => setError(err?.response?.data?.message || "Failed to load calendar.")).finally(() => setLoading(false)); }, []);
  const eventsByDate = useMemo(() => events.filter((event) => Number(event.date.slice(0, 4)) === year).reduce((groups, event) => ({ ...groups, [event.date]: [...(groups[event.date] || []), event] }), {}), [events, year]);
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  if (loading) return <LoadingSpinner />;
  return <Box sx={{ maxWidth: 1320, mx: "auto", pb: 4 }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2.5 }}><Box><Stack direction="row" spacing={1} alignItems="center"><CalendarMonthIcon color="primary" /><Typography variant="h5" fontWeight={750}>Calendar</Typography></Stack><Typography color="text.secondary">Project and task due dates for the full year.</Typography></Box><Stack direction="row" alignItems="center" spacing={0.5}><IconButton aria-label="Previous year" onClick={() => setYear((value) => value - 1)}><ChevronLeftIcon /></IconButton><Button variant="outlined" onClick={() => setYear(new Date().getFullYear())}>{year}</Button><IconButton aria-label="Next year" onClick={() => setYear((value) => value + 1)}><ChevronRightIcon /></IconButton></Stack></Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.25 }}><Chip icon={<FolderOutlinedIcon />} label="Project due date" color="primary" variant="outlined" /><Chip icon={<AssignmentOutlinedIcon />} label="Task due date" color="warning" variant="outlined" /><Typography variant="body2" color="text.secondary" sx={{ alignSelf: { sm: "center" } }}>Click a marked day to view its due items.</Typography></Stack>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>{Array.from({ length: 12 }, (_, month) => <YearMonth key={month} year={year} month={month} eventsByDate={eventsByDate} onSelectDate={setSelectedDate} />)}</Box>
    {!Object.keys(eventsByDate).length && <Paper variant="outlined" sx={{ p: 3, mt: 2, textAlign: "center" }}><Typography color="text.secondary">No project or task due dates are scheduled for {year}.</Typography></Paper>}
    <Dialog open={Boolean(selectedDate)} onClose={() => setSelectedDate(null)} fullWidth maxWidth="sm"><DialogTitle>{selectedDate && formatDate(selectedDate)}</DialogTitle><DialogContent dividers><Stack spacing={1.5}>{selectedEvents.map((event) => <Paper key={event.id} variant="outlined" sx={{ p: 1.75, borderLeft: "4px solid", borderColor: event.kind === "Project due" ? "primary.main" : "warning.main" }}><Stack direction="row" justifyContent="space-between" spacing={2}><Box><Typography variant="caption" color="text.secondary">{event.kind}</Typography><Typography fontWeight={600}>{event.title}</Typography>{event.description && <Typography variant="body2" color="text.secondary">{event.description}</Typography>}</Box>{event.status && <Chip label={event.status} size="small" />}</Stack></Paper>)}</Stack></DialogContent><DialogActions><Button onClick={() => setSelectedDate(null)}>Close</Button></DialogActions></Dialog>
  </Box>;
};
export default CalendarPage;

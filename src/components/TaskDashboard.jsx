import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  RingProgress,
  Text,
  Stack,
  Paper,
  Badge,
  Group,
  Grid,
  Button,
  Modal,
  TextInput,
  ActionIcon,
  FileButton,
  Textarea
} from '@mantine/core';
import { IconPlus, IconDownload, IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import { initDB, getAllTasks, saveAllTasks, clearAllTasks } from '../services/db';
import TaskItem from './TaskItem';

const TASK_COLORS = [
  { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', ring: '#8b5cf6' },
  { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', ring: '#ec4899' },
  { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', ring: '#06b6d4' },
  { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', ring: '#10b981' },
  { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', ring: '#f59e0b' },
];

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addTaskModalOpened, setAddTaskModalOpened] = useState(false);
  const [editTaskModalOpened, setEditTaskModalOpened] = useState(false);
  const [importModalOpened, setImportModalOpened] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [importData, setImportData] = useState('');
  const [notification, setNotification] = useState(null);

  // Initialize DB and load tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        await initDB();
        const savedTasks = await getAllTasks();
        if (savedTasks.length === 0) {
          // Initialize with default task if DB is empty
          const defaultTasks = [
            {
              id: '1',
              title: 'My First Task',
              completed: false,
              subtasks: [],
            },
          ];
          await saveAllTasks(defaultTasks);
          setTasks(defaultTasks);
        } else {
          setTasks(savedTasks);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        showNotification('Failed to load tasks', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveTasksToDB = async (updatedTasks) => {
    try {
      await saveAllTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
      showNotification('Failed to save tasks', 'error');
    }
  };

  const handleToggle = async (taskId, parentId = null) => {
    const updatedTasks = tasks.map((task) => {
      if (parentId) {
        // Toggle subtask
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === taskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return task;
      } else {
        // Toggle parent task
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            subtasks: task.subtasks.map((st) => ({
              ...st,
              completed: newCompleted,
            })),
          };
        }
        return task;
      }
    });
    await saveTasksToDB(updatedTasks);
  };

  const handleAddTask = async () => {
    if (taskTitle.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: taskTitle.trim(),
        completed: false,
        subtasks: [],
      };
      const updatedTasks = [...tasks, newTask];
      await saveTasksToDB(updatedTasks);
      setTaskTitle('');
      setAddTaskModalOpened(false);
      showNotification('Task added successfully');
    }
  };

  const handleEditTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskTitle(task.title);
      setEditingTaskId(taskId);
      setEditTaskModalOpened(true);
    }
  };

  const handleSaveEditTask = async () => {
    if (taskTitle.trim() && editingTaskId) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTaskId ? { ...task, title: taskTitle.trim() } : task
      );
      await saveTasksToDB(updatedTasks);
      setTaskTitle('');
      setEditingTaskId(null);
      setEditTaskModalOpened(false);
      showNotification('Task updated successfully');
    }
  };

  const handleAddSubtask = async (parentId, subtaskTitle) => {
    if (subtaskTitle.trim()) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === parentId) {
          const newSubtask = {
            id: `${parentId}-${Date.now()}`,
            title: subtaskTitle.trim(),
            completed: false,
          };
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask],
          };
        }
        return task;
      });
      await saveTasksToDB(updatedTasks);
    }
  };

  const handleEditSubtask = async (parentId, subtaskId, newTitle) => {
    if (newTitle.trim()) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, title: newTitle.trim() } : st
            ),
          };
        }
        return task;
      });
      await saveTasksToDB(updatedTasks);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    await saveTasksToDB(updatedTasks);
    showNotification('Task deleted successfully');
  };

  const handleDeleteSubtask = async (parentId, subtaskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
        };
      }
      return task;
    });
    await saveTasksToDB(updatedTasks);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Tasks exported successfully');
  };

  const handleImport = async () => {
    try {
      let importedTasks;
      if (importData.trim()) {
        // Import from textarea
        importedTasks = JSON.parse(importData);
      } else {
        return;
      }

      // Validate the imported data
      if (!Array.isArray(importedTasks)) {
        showNotification('Invalid data format', 'error');
        return;
      }

      await saveAllTasks(importedTasks);
      setTasks(importedTasks);
      setImportData('');
      setImportModalOpened(false);
      showNotification('Tasks imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Failed to import tasks. Please check the format.', 'error');
    }
  };

  const handleFileImport = async (file) => {
    try {
      const text = await file.text();
      const importedTasks = JSON.parse(text);

      if (!Array.isArray(importedTasks)) {
        showNotification('Invalid data format', 'error');
        return;
      }

      await saveAllTasks(importedTasks);
      setTasks(importedTasks);
      showNotification('Tasks imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Failed to import tasks. Please check the file format.', 'error');
    }
  };

  const getTaskProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    const completed = task.subtasks.filter((st) => st.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return '#ef4444';
    if (progress < 60) return '#f59e0b';
    if (progress < 90) return '#3b82f6';
    return '#10b981';
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="md" c="white" fw={800}>
              🎮 Gamified Task Dashboard
            </Title>
            <Text c="gray.4" size="lg" fw={500}>
              Track your progress and level up your productivity
            </Text>
          </div>
          <Group gap="sm">
            <FileButton onChange={handleFileImport} accept="application/json">
              {(props) => (
                <Button
                  {...props}
                  leftSection={<IconUpload size={18} />}
                  variant="light"
                  size="md"
                >
                  Import File
                </Button>
              )}
            </FileButton>
            <Button
              leftSection={<IconUpload size={18} />}
              onClick={() => setImportModalOpened(true)}
              variant="light"
              size="md"
            >
              Import JSON
            </Button>
            <Button
              leftSection={<IconDownload size={18} />}
              onClick={handleExport}
              variant="light"
              size="md"
            >
              Export
            </Button>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => {
                setTaskTitle('');
                setAddTaskModalOpened(true);
              }}
              size="md"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Add Task
            </Button>
          </Group>
        </Group>

        {loading ? (
          <Text c="gray.4" ta="center" size="lg">
            Loading tasks...
          </Text>
        ) : tasks.length === 0 ? (
          <Text c="gray.4" ta="center" size="lg">
            No tasks yet. Add your first task to get started!
          </Text>
        ) : (
          <Stack gap="lg">
            {tasks.map((task, index) => {
            const progress = getTaskProgress(task);
            const taskColor = TASK_COLORS[index % TASK_COLORS.length];
            const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
            const totalSubtasks = task.subtasks?.length || 0;

            return (
              <Paper
                key={task.id}
                p="lg"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <Grid gutter="lg" align="center">
                  <Grid.Col span={{ base: 12, sm: 3 }}>
                    <Stack align="center" gap="sm">
                      <RingProgress
                        size={140}
                        thickness={12}
                        sections={[{ value: progress, color: getProgressColor(progress) }]}
                        label={
                          <Text ta="center" fw={700} size="lg" c="white">
                            {Math.round(progress)}%
                          </Text>
                        }
                      />
                      <Badge
                        size="md"
                        variant="light"
                        style={{
                          background: taskColor.gradient,
                          color: 'white',
                          border: 'none',
                        }}
                      >
                        {completedSubtasks}/{totalSubtasks} done
                      </Badge>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 9 }}>
                    <TaskItem
                      task={task}
                      onToggle={handleToggle}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onAddSubtask={handleAddSubtask}
                      onEditSubtask={handleEditSubtask}
                      onDeleteSubtask={handleDeleteSubtask}
                      level={0}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>
            );
            })}
          </Stack>
        )}
      </Stack>

      {notification && (
        <Paper
          p="md"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            background: notification.type === 'error'
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: 300,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Group gap="sm" justify="space-between">
            <Group gap="xs">
              <IconCheck size={18} color="white" />
              <Text c="white" fw={500} size="sm">
                {notification.message}
              </Text>
            </Group>
            <ActionIcon
              variant="subtle"
              color="white"
              onClick={() => setNotification(null)}
              size="sm"
              style={{ color: 'white' }}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Paper>
      )}

      {/* Add Task Modal */}
      <Modal
        opened={addTaskModalOpened}
        onClose={() => {
          setAddTaskModalOpened(false);
          setTaskTitle('');
        }}
        title="Add New Task"
        centered
        styles={{
          content: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          header: {
            background: 'transparent',
          },
          title: {
            color: 'white',
          },
        }}
      >
        <Stack gap="md">
          <TextInput
            placeholder="Enter task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTask();
              }
            }}
            autoFocus
            styles={{
              input: {
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
              },
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setAddTaskModalOpened(false);
                setTaskTitle('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Add Task
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        opened={editTaskModalOpened}
        onClose={() => {
          setEditTaskModalOpened(false);
          setTaskTitle('');
          setEditingTaskId(null);
        }}
        title="Edit Task"
        centered
        styles={{
          content: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          header: {
            background: 'transparent',
          },
          title: {
            color: 'white',
          },
        }}
      >
        <Stack gap="md">
          <TextInput
            placeholder="Enter task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEditTask();
              }
            }}
            autoFocus
            styles={{
              input: {
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
              },
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setEditTaskModalOpened(false);
                setTaskTitle('');
                setEditingTaskId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditTask}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Import Modal */}
      <Modal
        opened={importModalOpened}
        onClose={() => {
          setImportModalOpened(false);
          setImportData('');
        }}
        title="Import Tasks"
        centered
        size="lg"
        styles={{
          content: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          header: {
            background: 'transparent',
          },
          title: {
            color: 'white',
          },
        }}
      >
        <Stack gap="md">
          <Text c="gray.4" size="sm">
            Paste your JSON data below or use the Import button to select a file
          </Text>
          <Textarea
            placeholder='Paste JSON data here, e.g., [{"id":"1","title":"Task 1","completed":false,"subtasks":[]}]'
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            minRows={8}
            styles={{
              input: {
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontFamily: 'monospace',
              },
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setImportModalOpened(false);
                setImportData('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Import
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default TaskDashboard;


import { useState } from 'react';
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
  ActionIcon
} from '@mantine/core';
import { IconPlus, IconEdit } from '@tabler/icons-react';
import TaskItem from './TaskItem';

const TASK_COLORS = [
  { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', ring: '#8b5cf6' },
  { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', ring: '#ec4899' },
  { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', ring: '#06b6d4' },
  { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', ring: '#10b981' },
  { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', ring: '#f59e0b' },
];

function TaskDashboard() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Project Setup',
      completed: false,
      subtasks: [
        { id: '1-1', title: 'Initialize repository', completed: true },
        { id: '1-2', title: 'Set up development environment', completed: true },
        { id: '1-3', title: 'Configure CI/CD pipeline', completed: false },
        { id: '1-4', title: 'Write documentation', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Feature Development',
      completed: false,
      subtasks: [
        { id: '2-1', title: 'Design user interface', completed: true },
        { id: '2-2', title: 'Implement core functionality', completed: false },
        { id: '2-3', title: 'Add unit tests', completed: false },
        { id: '2-4', title: 'Performance optimization', completed: false },
      ],
    },
    {
      id: '3',
      title: 'Testing & Deployment',
      completed: false,
      subtasks: [
        { id: '3-1', title: 'Run integration tests', completed: false },
        { id: '3-2', title: 'Fix bugs', completed: false },
        { id: '3-3', title: 'Deploy to staging', completed: false },
        { id: '3-4', title: 'Deploy to production', completed: false },
      ],
    },
  ]);

  const [addTaskModalOpened, setAddTaskModalOpened] = useState(false);
  const [editTaskModalOpened, setEditTaskModalOpened] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');

  const handleToggle = (taskId, parentId = null) => {
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
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
    });
  };

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: taskTitle.trim(),
        completed: false,
        subtasks: [],
      };
      setTasks([...tasks, newTask]);
      setTaskTitle('');
      setAddTaskModalOpened(false);
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

  const handleSaveEditTask = () => {
    if (taskTitle.trim() && editingTaskId) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTaskId ? { ...task, title: taskTitle.trim() } : task
        )
      );
      setTaskTitle('');
      setEditingTaskId(null);
      setEditTaskModalOpened(false);
    }
  };

  const handleAddSubtask = (parentId, subtaskTitle) => {
    if (subtaskTitle.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
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
        })
      );
    }
  };

  const handleEditSubtask = (parentId, subtaskId, newTitle) => {
    if (newTitle.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === parentId) {
            return {
              ...task,
              subtasks: task.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, title: newTitle.trim() } : st
              ),
            };
          }
          return task;
        })
      );
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleDeleteSubtask = (parentId, subtaskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          };
        }
        return task;
      })
    );
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
      </Stack>

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
    </Container>
  );
}

export default TaskDashboard;


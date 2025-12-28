import { useState } from 'react';
import {
  Checkbox,
  Collapse,
  Text,
  Group,
  Badge,
  Paper,
  ActionIcon,
  Modal,
  TextInput,
  Button,
  Stack
} from '@mantine/core';
import {
  IconChevronDown,
  IconPlus,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';

function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask,
  level = 0,
  parentId = null
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [addSubtaskModalOpened, setAddSubtaskModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(task.id);
  };

  const handleSubtaskToggle = (subtaskId) => {
    onToggle(subtaskId, task.id);
  };

  const handleAddSubtaskClick = () => {
    setSubtaskTitle('');
    setAddSubtaskModalOpened(true);
  };

  const handleSaveSubtask = () => {
    if (subtaskTitle.trim()) {
      onAddSubtask(task.id, subtaskTitle);
      setSubtaskTitle('');
      setAddSubtaskModalOpened(false);
    }
  };

  const handleEditSubtaskClick = (subtaskId, currentTitle) => {
    setSubtaskTitle(currentTitle);
    setEditingSubtaskId(subtaskId);
    setEditModalOpened(true);
  };

  const handleSaveEditSubtask = () => {
    if (subtaskTitle.trim() && editingSubtaskId && parentId) {
      onEditSubtask(parentId, editingSubtaskId, subtaskTitle);
      setSubtaskTitle('');
      setEditingSubtaskId(null);
      setEditModalOpened(false);
    }
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const hasSubtasks = totalSubtasks > 0;
  const isParentTask = level === 0;

  return (
    <Paper
      p="md"
      mb="xs"
      style={{
        marginLeft: level * 24,
        backgroundColor: level > 0
          ? 'rgba(255, 255, 255, 0.03)'
          : 'transparent',
        border: level > 0
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : 'none',
        backdropFilter: level > 0 ? 'blur(10px)' : 'none',
      }}
      radius="md"
      withBorder={level > 0}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" style={{ flex: 1 }}>
          <Checkbox
            checked={task.completed}
            onChange={handleToggle}
            size="md"
            radius="sm"
          />
          <Text
            fw={level === 0 ? 600 : 500}
            size={level === 0 ? 'md' : 'sm'}
            td={task.completed ? 'line-through' : 'none'}
            c={task.completed ? 'gray.6' : 'gray.1'}
            style={{ flex: 1 }}
          >
            {task.title}
          </Text>
          {hasSubtasks && (
            <Badge
              variant="light"
              size="sm"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {completedSubtasks}/{totalSubtasks}
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          {isParentTask && (
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={handleAddSubtaskClick}
              size="sm"
            >
              <IconPlus size={16} />
            </ActionIcon>
          )}
          {!isParentTask && parentId && (
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => handleEditSubtaskClick(task.id, task.title)}
              size="sm"
            >
              <IconEdit size={16} />
            </ActionIcon>
          )}
          {isParentTask && onEdit && (
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => onEdit(task.id)}
              size="sm"
            >
              <IconEdit size={16} />
            </ActionIcon>
          )}
          {isParentTask && onDelete && (
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onDelete(task.id)}
              size="sm"
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
          {!isParentTask && onDeleteSubtask && parentId && (
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onDeleteSubtask(parentId, task.id)}
              size="sm"
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
          {hasSubtasks && (
            <IconChevronDown
              size={18}
              style={{
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                color: '#cbd5e1',
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          )}
        </Group>
      </Group>
      {hasSubtasks && (
        <Collapse in={isExpanded} mt="sm">
          <div style={{ marginLeft: 16 }}>
            {task.subtasks.map((subtask) => (
              <TaskItem
                key={subtask.id}
                task={subtask}
                onToggle={handleSubtaskToggle}
                onEditSubtask={onEditSubtask}
                onDeleteSubtask={onDeleteSubtask}
                level={level + 1}
                parentId={task.id}
              />
            ))}
          </div>
        </Collapse>
      )}

      {/* Add Subtask Modal */}
      <Modal
        opened={addSubtaskModalOpened}
        onClose={() => {
          setAddSubtaskModalOpened(false);
          setSubtaskTitle('');
        }}
        title="Add Subtask"
        centered
        size="sm"
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
            placeholder="Enter subtask title"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveSubtask();
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
                setAddSubtaskModalOpened(false);
                setSubtaskTitle('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubtask}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Add Subtask
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Subtask Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSubtaskTitle('');
          setEditingSubtaskId(null);
        }}
        title="Edit Subtask"
        centered
        size="sm"
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
            placeholder="Enter subtask title"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEditSubtask();
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
                setEditModalOpened(false);
                setSubtaskTitle('');
                setEditingSubtaskId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditSubtask}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

export default TaskItem;

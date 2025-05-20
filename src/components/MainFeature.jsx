import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { getIcon } from '../utils/iconUtils';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';

// Import required icons
const PlusIcon = getIcon('plus');
const CheckIcon = getIcon('check');
const TrashIcon = getIcon('trash');
const EditIcon = getIcon('edit');
const CalendarIcon = getIcon('calendar');
const AlertCircleIcon = getIcon('alert-circle');
const ChevronDownIcon = getIcon('chevron-down');
const ChevronUpIcon = getIcon('chevron-up');
const FlagIcon = getIcon('flag');
const ListTodoIcon = getIcon('list-todo');

const MainFeature = ({ activeTab }) => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Tagged tasks state
  const [tags, setTags] = useState('');

  // Track editing state
  const [editingTask, setEditingTask] = useState(null);
  const [isValidated, setIsValidated] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: 'medium',
  });
  
  // Filter for displaying tasks based on active tab
  const filteredTasks = tasks; // Server filtering is handled in fetchTasksFromServer

  // Fetch tasks from the server when component mounts or activeTab changes
  useEffect(() => {
    const fetchTasksFromServer = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Apply filters based on activeTab
        const options = {};
        
        if (activeTab === 'completed') {
          options.completed = true;
        }
        
        // Fetch tasks with filters
        const data = await fetchTasks(options);
        
        // Transform the data format to match component expectations
        const formattedTasks = data.map(task => ({
          id: task.Id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          createdAt: task.CreatedOn,
          dueDate: task.dueDate,
          priority: task.priority
        }));
        
        setTasks(formattedTasks);
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
        toast.error("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasksFromServer();
  }, [activeTab]);

  // Handle input changes for the task form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new task or update an existing one
  const handleSubmit = async (e) => {
    setSubmitting(true);
    e.preventDefault();
    
    // Form validation
    if (!formData.title.trim()) {
      setIsValidated(false);
      setSubmitting(false);
      toast.error("Task title is required!");
      return;
    }
    try {
      if (editingTask) {
        // Update existing task
        const taskData = {
          title: formData.title,
          description: formData.description,
          dueDate: new Date(formData.dueDate).toISOString(),
          priority: formData.priority,
          completed: editingTask.completed,
          tags: tags,
        };
        
        await updateTask(editingTask.id, taskData);
        
        // Update local state
        const updatedTasks = tasks.map(task => 
          task.id === editingTask.id ? {
            ...task,
            title: formData.title,
            description: formData.description,
            dueDate: new Date(formData.dueDate).toISOString(),
            priority: formData.priority
          } : task
        );
        
        setTasks(updatedTasks);
        toast.success("Task updated successfully!");
        setEditingTask(null);
      } else {
        // Add new task
        const taskData = {
          title: formData.title,
          description: formData.description,
          dueDate: new Date(formData.dueDate).toISOString(),
          priority: formData.priority,
          tags: tags
        };
        
        const newTaskData = await createTask(taskData);
        
        // Format the returned task to match component structure
        const newTask = {
          id: newTaskData.Id,
          title: newTaskData.title,
          description: newTaskData.description,
          completed: newTaskData.completed,
          createdAt: newTaskData.CreatedOn,
          dueDate: newTaskData.dueDate,
          priority: newTaskData.priority
        };
        
        setTasks([...tasks, newTask]);
        toast.success("Task added successfully!");
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        priority: 'medium'
      });
      setTags('');
      setIsValidated(true);
      setShowForm(false);
    } catch (error) {
      console.error("Task operation failed:", error);
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
    } finally {
      setSubmitting(false);
      setShowForm(false);
    }
  };

  const toggleTaskCompletion = async (id) => {
    setLoadingAction(true);
    try {
      const task = tasks.find(t => t.id === id);
      const newStatus = !task.completed;
      
      // Update task completion status
      await updateTask(id, {
        ...task,
        completed: newStatus
      });
      
      // Update local state
      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, completed: newStatus } : task
      );
      
      setTasks(updatedTasks);
      toast.info(`Task marked as ${newStatus ? 'completed' : 'incomplete'}`);
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");  
    } finally {
      setLoadingAction(false);
    }
    
  };

  const handleDeleteTask = async (id) => {
    setLoadingAction(true);
    try {
      // Delete task from server
      await deleteTask(id);
      
      // Update local state
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    } finally {
      setLoadingAction(false);
    }    
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
      priority: task.priority
    });
    setShowForm(true);
  };

  // Priority colors for visual feedback
  const priorityColors = {
    high: 'text-red-500 dark:text-red-400',
    medium: 'text-yellow-500 dark:text-yellow-400',
    low: 'text-green-500 dark:text-green-400',
  };

  return (
    <div className="p-4 md:p-6">
      {/* Form toggle button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => {
          if (editingTask) {
            setEditingTask(null);
            setFormData({
              title: '',
              description: '',
              dueDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
              priority: 'medium'
            });
          }
          setShowForm(!showForm);
        }}
        className={`mb-4 w-full btn ${
          !showForm ? 'btn-primary' : 'btn-outline'
        } flex items-center justify-center space-x-2`}
      >
        {!showForm ? (
          <>
            <PlusIcon className="w-5 h-5" />
            <span>New Task</span>
          </>
        ) : (
          <>
            <ChevronUpIcon className="w-5 h-5" />
            <span>Hide Form</span>
          </>
        )}
      </motion.button>

      {/* Task form */}
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="mb-6 card p-4">
              <h3 className="text-lg font-semibold mb-4">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-surface-700 dark:text-surface-300 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`input ${!isValidated && !formData.title ? 'border-red-500 dark:border-red-400' : ''}`}
                  placeholder="Enter task title"
                />
                {!isValidated && !formData.title && (
                  <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircleIcon className="w-4 h-4 mr-1" />
                    Title is required
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                  <label className="block text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input min-h-[80px]"
                    placeholder="Enter task description"
                  />
              </div>
              
              <div className="mb-4">
                <label className="block text-surface-700 dark:text-surface-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  name="tags"
                  onChange={(e) => setTags(e.target.value)}
                  className="input"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-surface-700 dark:text-surface-300 mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="input pl-10"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-surface-700 dark:text-surface-300 mb-2">
                    Priority
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
                      <FlagIcon className="w-5 h-5" />
                    </div>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="input pl-10 appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      dueDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                      priority: 'medium'
                    });
                    setIsValidated(true);
                  }}
                  className="btn btn-outline"
                >
                  {submitting && (
                    <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  )}
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading ? (
        /* Tasks list */
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-3 text-surface-600 dark:text-surface-400">Loading tasks...</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : error ? (
        /* Error state */
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                <AlertCircleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-surface-600 dark:text-surface-300">
                Failed to load tasks
              </h3>
              <p className="text-surface-500 mt-2 mb-4">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Retry
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Task list */
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                  <ListTodoIcon className="w-8 h-8 text-surface-400" />
                </div>
                <h3 className="text-lg font-medium text-surface-600 dark:text-surface-300">
                  {activeTab === 'all' 
                    ? "No tasks yet" 
                    : "No completed tasks"}
                </h3>
                <p className="text-surface-500 mt-2">
                  {activeTab === 'all'
                    ? "Create your first task to get started"
                    : "Complete some tasks to see them here"}
                </p>
              </motion.div>
            ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`task-item ${task.completed ? 'border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10' : ''}`}
              >
                <div className="flex items-start">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    disabled={loadingAction}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600'
                        : 'border-surface-300 dark:border-surface-600'
                    } flex items-center justify-center mr-3 mt-0.5 transition-colors`}
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
                  </button>
                  
                  <div className="flex-grow">
                    <h3 className={`font-medium ${
                      task.completed ? 'line-through text-surface-400 dark:text-surface-500' : 'text-surface-800 dark:text-surface-100'
                    }`}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className={`mt-1 text-sm ${
                        task.completed ? 'text-surface-400 dark:text-surface-500' : 'text-surface-600 dark:text-surface-400'
                      }`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <div className={`px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center ${priorityColors[task.priority]}`}>
                        <FlagIcon className="w-3 h-3 mr-1" />
                        <span className="capitalize">{task.priority}</span>
                      </div>
                      
                      <div className="px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <span>
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex space-x-1 ml-2">
                    <button
                      onClick={() => startEditing(task)}
                      className="p-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
                      aria-label="Edit task"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-surface-500 hover:text-red-600 dark:text-surface-400 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete task"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MainFeature;
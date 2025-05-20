import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

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

const MainFeature = ({ activeTab }) => {
  // Get tasks from localStorage or use default tasks
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [
      {
        id: 1,
        title: 'Complete the project proposal',
        description: 'Write up the initial draft for the client meeting',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
      },
      {
        id: 2,
        title: 'Schedule team meeting',
        description: 'Discuss project timeline and assign tasks',
        completed: true,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
      },
    ];
  });

  // Form state for new task
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: 'medium',
  });
  
  // Track editing state
  const [editingTask, setEditingTask] = useState(null);
  const [isValidated, setIsValidated] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Filter for displaying tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return task.completed;
    return true;
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Handle input changes for the task form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new task or update an existing one
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.title.trim()) {
      setIsValidated(false);
      toast.error("Task title is required!");
      return;
    }
    
    if (editingTask) {
      // Update existing task
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
      const newTask = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        priority: formData.priority
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
    
    setIsValidated(true);
    setShowForm(false);
  };

  // Mark a task as complete or incomplete
  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    
    setTasks(updatedTasks);
    
    const task = tasks.find(t => t.id === id);
    const newStatus = !task.completed;
    
    toast.info(`Task marked as ${newStatus ? 'completed' : 'incomplete'}`);
  };

  // Delete a task
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    toast.success("Task deleted successfully!");
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
      <AnimatePresence>
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

      {/* Tasks list */}
      <div className="space-y-3">
        <AnimatePresence>
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
                    className={`flex-shrink-0 w-6 h-6 rounded-full border ${
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
                      onClick={() => deleteTask(task.id)}
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
  );
};

export default MainFeature;
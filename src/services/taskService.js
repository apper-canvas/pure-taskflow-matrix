/**
 * Service for handling all task-related operations with the Apper backend
 */

// Initialize ApperClient
const initializeClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Table name from the provided schema
const TABLE_NAME = 'task';

/**
 * Fetch tasks with optional filtering
 * @param {Object} options - Filter options
 * @returns {Promise} - Promise resolving to task list
 */
export const fetchTasks = async (options = {}) => {
  try {
    const apperClient = initializeClient();
    
    const { completed, searchTerm } = options;
    
    // Build where clause for filtering
    const whereConditions = [];
    
    if (completed !== undefined) {
      whereConditions.push({
        fieldName: "completed",
        operator: "ExactMatch",
        values: [completed]
      });
    }
    
    if (searchTerm) {
      whereConditions.push({
        fieldName: "title",
        operator: "Contains",
        values: [searchTerm]
      });
    }
    
    const params = {
      fields: ["Id", "Name", "title", "description", "completed", "dueDate", "priority", "Tags", "CreatedOn"],
      where: whereConditions.length > 0 ? whereConditions : undefined,
      orderBy: [{ field: "dueDate", direction: "ASC" }]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - The task data to create
 * @returns {Promise} - Promise resolving to created task
 */
export const createTask = async (taskData) => {
  try {
    const apperClient = initializeClient();
    
    // Only include updateable fields
    const params = {
      records: [{
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        completed: false,
        // Add other updateable fields from the schema
        Name: taskData.title, // Setting Name to match title for consistency
        Tags: taskData.tags || ""
      }]
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error("Failed to create task");
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {number} taskId - The ID of the task to update
 * @param {Object} taskData - The updated task data
 * @returns {Promise} - Promise resolving to updated task
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const apperClient = initializeClient();
    
    // Only include updateable fields
    const params = {
      records: [{
        Id: taskId,
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        completed: taskData.completed,
        Name: taskData.title, // Setting Name to match title for consistency
        Tags: taskData.tags || ""
      }]
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error("Failed to update task");
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {number} taskId - The ID of the task to delete
 * @returns {Promise} - Promise resolving to success status
 */
export const deleteTask = async (taskId) => {
  try {
    const apperClient = initializeClient();
    
    const params = {
      RecordIds: [taskId]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (response && response.success) {
      return true;
    }
    
    throw new Error("Failed to delete task");
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};
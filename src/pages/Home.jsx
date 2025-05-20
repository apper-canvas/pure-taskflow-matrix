import { useState } from 'react';
import { motion } from 'framer-motion';
import MainFeature from '../components/MainFeature';
import { getIcon } from '../utils/iconUtils';

const CheckCircleIcon = getIcon('check-circle');
const ListTodoIcon = getIcon('list-todo');

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <motion.h1 
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-surface-800 dark:text-surface-50 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to TaskFlow
        </motion.h1>
        <motion.p 
          className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Organize your tasks, boost your productivity, and achieve your goals with our intuitive task management app.
        </motion.p>
      </div>
      
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card dark:shadow-none border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="border-b border-surface-200 dark:border-surface-700">
          <div className="flex p-4">
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-center font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <div className="flex items-center justify-center space-x-2">
                <ListTodoIcon className="w-5 h-5" />
                <span>All Tasks</span>
              </div>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-center font-medium transition-all ${
                activeTab === 'completed' 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              <div className="flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Completed</span>
              </div>
            </button>
          </div>
        </div>
        
        <MainFeature activeTab={activeTab} />
      </div>
    </div>
  );
};

export default Home;
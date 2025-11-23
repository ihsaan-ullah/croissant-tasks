import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import type { TaskSummary } from '../types';
import { FilterBar } from './FilterBar';
import type { FilterState } from './FilterBar';
import { TaskRow } from './TaskRow';
import './TaskIndex.css';

const TASKS_PER_PAGE = 20;

export const TaskIndex: React.FC = () => {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    topics: [],
    dataTypes: [],
    modelTypes: [],
    metrics: [],
    verifiedOnly: false
  });
  const taskListRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<FilterState>(filters);

  // Keep filtersRef in sync with filters state
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch tasks with pagination - use ref to avoid dependency issues
  const fetchTasks = useCallback(async (page: number, append: boolean = false, explicitFilters?: FilterState) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Use explicit filters if provided (from filter change), otherwise use ref
      const currentFilters = explicitFilters || filtersRef.current;
      const params: Record<string, string> = {
        page: page.toString(),
        limit: TASKS_PER_PAGE.toString(),
      };
      
      if (currentFilters.searchText) {
        params.search_text = currentFilters.searchText;
      }
      if (currentFilters.verifiedOnly) {
        params.verified_only = 'true';
      }
      if (currentFilters.topics.length > 0) {
        params.topics = currentFilters.topics.join(',');
      }
      if (currentFilters.dataTypes.length > 0) {
        params.data_types = currentFilters.dataTypes.join(',');
      }
      if (currentFilters.modelTypes.length > 0) {
        params.model_types = currentFilters.modelTypes.join(',');
      }
      if (currentFilters.metrics.length > 0) {
        params.metrics = currentFilters.metrics.join(',');
      }
      
      const response = await axios.get('/tasks', { params });
      
      if (response.data && response.data.tasks) {
        if (append) {
          setTasks(prev => [...prev, ...response.data.tasks]);
        } else {
          setTasks(response.data.tasks);
        }
        
        setTotalTasks(response.data.total || 0);
        setHasMore(page < (response.data.total_pages || 0));
        setCurrentPage(page);
      } else {
        console.error('Unexpected response format:', response.data);
        setTasks([]);
        setTotalTasks(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setTotalTasks(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // Empty deps - use ref instead

  // Initial load and filter changes
  useEffect(() => {
    // Explicitly pass filters to ensure we use the exact filter state that triggered this effect
    setCurrentPage(1);
    setTasks([]);
    setHasMore(true);
    fetchTasks(1, false, filters);
    // fetchTasks is stable (empty deps), filters triggers the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!taskListRef.current || loading || loadingMore || !hasMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = taskListRef.current;
      // Load more when user is 200px from bottom
      if (scrollHeight - scrollTop - clientHeight < 200) {
        fetchTasks(currentPage + 1, true);
      }
    };

    const listElement = taskListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
    // fetchTasks is stable, currentPage/hasMore/loading/loadingMore trigger updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, hasMore, loading, loadingMore]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    // FilterBar already prevents duplicate calls, so we can always update
    // Update ref immediately so fetchTasks has the latest filters
    filtersRef.current = newFilters;
    setFilters(newFilters);
  }, []);

  return (
    <div className="task-index">
      <FilterBar onFilterChange={handleFilterChange} filters={filters} />
      
      <div className="task-list-container">
        <div className="task-list-header">
          <span className="task-count">{loading && tasks.length === 0 ? 'Searching...' : `${totalTasks} tasks`}</span>
        </div>
        
        <div className="task-list" ref={taskListRef}>
          {loading && tasks.length === 0 ? (
            <div className="task-index-loading">
              <div>Loading tasks...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="no-tasks">No tasks match the current filters.</div>
          ) : (
            <>
              {tasks.map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
              {loadingMore && (
                <div className="loading-more">Loading more tasks...</div>
              )}
              {!hasMore && tasks.length > 0 && (
                <div className="no-more-tasks">No more tasks to load.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { TaskSummary, TaskDetail as TaskDetailType } from '../types';
import { TaskGraph } from './TaskGraph';
import './TaskRow.css';

interface TaskRowProps {
  task: TaskSummary;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
  const [taskDetail, setTaskDetail] = useState<TaskDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [runPlatform, setRunPlatform] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`/tasks/${task.id}`);
        setTaskDetail(response.data);
      } catch (error) {
        console.error('Error fetching task detail:', error);
      }
    };
    fetchDetail();
  }, [task.id]);

  const handleDownload = () => {
    if (!taskDetail) return;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(taskDetail, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `croissant-task-${task.id}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRunMock = async (platform: string = 'local') => {
    setRunning(true);
    setRunPlatform(platform);
    try {
      await axios.post(`/tasks/${task.id}/run`, null, {
        params: { platform }
      });
      setTimeout(() => {
        setRunning(false);
        setRunPlatform(null);
      }, 2000);
    } catch (error) {
      setRunning(false);
      setRunPlatform(null);
    }
  };

  return (
    <div className="task-row">
      <div className="task-row-header">
        <h3 className="task-title">{task.name}</h3>
      </div>
      <div className="task-row-content">
        {/* Left: Thumbnail */}
        <div className="task-thumbnail">
          <a 
            href={task.openreview_url || `https://openreview.net/forum?id=${task.id.replace('croissant-task-', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="thumbnail-link"
            title="View on OpenReview"
          >
            <div className="paper-icon">📄</div>
            <div className="paper-label">Link to Paper</div>
          </a>
        </div>

        {/* Middle: Inline Graph */}
        <div className="task-graph-container">
          {taskDetail ? (
            <TaskGraph taskDetail={taskDetail} />
          ) : (
            <div className="graph-loading">Loading graph...</div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="task-actions">
          <button onClick={handleDownload} className="action-btn" title="Download Task JSON">
            Download Croissant Task
          </button>
          <button 
            onClick={() => handleRunMock('local')} 
            disabled={running}
            className="action-btn primary"
            title="Run Task (Mock)"
          >
            {running && runPlatform === 'local' ? 'Running...' : 'Run (Mock)'}
          </button>
          <div className="platform-dropdown">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleRunMock(e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={running}
              className="platform-select"
            >
              <option value="">Run on Platform...</option>
              <option value="codabench">Codabench</option>
              <option value="kaggle">Kaggle</option>
              <option value="openml">OpenML</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};


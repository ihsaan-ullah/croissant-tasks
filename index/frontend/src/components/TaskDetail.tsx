import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { TaskDetail as TaskDetailType } from '../types';
import './TaskDetail.css';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId }) => {
  const [task, setTask] = useState<TaskDetailType | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`/tasks/${taskId}`);
        setTask(response.data);
        
        // Parse graph for ReactFlow
        const graph = response.data['@graph'] || [];
        const implementation = response.data['cr:TaskProblem']['cr:implementation'];
        
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        
        let yOffset = 50;
        
        // 1. Inputs
        if (implementation['cr:input']) {
          implementation['cr:input'].forEach((inputRef: any) => {
            const inputId = inputRef['@id'];
            const inputObj = graph.find((item: any) => item['@id'] === inputId);
            const label = inputObj ? inputObj.name : inputId;
            
            newNodes.push({
              id: inputId,
              data: { label: `Input: ${label}` },
              position: { x: 50, y: yOffset },
              style: { background: '#eef', border: '1px solid #99f', width: 180 }
            });
            
            // Connect to Implementation Node
            newEdges.push({
              id: `e-${inputId}-impl`,
              source: inputId,
              target: 'implementation-node',
              animated: true,
            });
            
            yOffset += 100;
          });
        }
        
        // 2. Implementation Node (Central)
        newNodes.push({
          id: 'implementation-node',
          data: { label: 'Implementation (Code)' },
          position: { x: 350, y: yOffset / 2 },
          style: { background: '#efe', border: '1px solid #9f9', width: 180 }
        });
        
        // 3. Output
        if (implementation['cr:output']) {
            const outputId = implementation['cr:output']['@id'];
            const outputObj = graph.find((item: any) => item['@id'] === outputId);
            const label = outputObj ? outputObj.name : outputId;
            
            newNodes.push({
              id: outputId,
              data: { label: `Output: ${label}` },
              position: { x: 650, y: yOffset / 2 },
              style: { background: '#fee', border: '1px solid #f99', width: 180 }
            });
            
             newEdges.push({
              id: `e-impl-${outputId}`,
              source: 'implementation-node',
              target: outputId,
              animated: true,
            });
        }

        setNodes(newNodes);
        setEdges(newEdges);
        
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };
    
    if (taskId) fetchTask();
  }, [taskId]);

  const handleRunMock = async () => {
    setRunning(true);
    try {
      await axios.post(`/tasks/${taskId}/run`);
      alert('Task execution simulated successfully!');
    } catch (error) {
      alert('Error running task');
    } finally {
      setRunning(false);
    }
  };
  
  const handleDownload = () => {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(task, null, 2)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = `croissant-task-${taskId}.json`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
  };

  if (!task) return <div>Loading details...</div>;

  // Check if we're in inline mode (onBack is a no-op or empty function)
  // In this specific app context, we can infer it or pass a prop, but for now let's 
  // render a simplified header if it's embedded.
  
  return (
    <div className="task-detail" style={{ height: '100%', padding: '0' }}>
       {/* Only show full header/back button if NOT inline (optional logic) */}
       {/* For now, we adapt to fill parent container */}
       
      <div className="detail-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px',
          borderBottom: '1px solid #eee'
        }}>
        <div className="actions">
             <button onClick={handleDownload} className="action-btn" style={{ fontSize: '12px', padding: '6px 12px' }}>Download JSON</button>
             <button onClick={handleRunMock} disabled={running} className="action-btn primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                {running ? 'Running...' : 'Run (Mock)'}
             </button>
        </div>
      </div>
      
      <div className="flow-container" style={{ flex: 1, minHeight: 0, height: 'calc(100% - 60px)' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};


import React, { useEffect, useRef, useCallback } from 'react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, Handle, Position } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import type { TaskDetail as TaskDetailType } from '../types';
import './TaskGraph.css';
import 'reactflow/dist/style.css';

interface TaskGraphProps {
  taskDetail: TaskDetailType;
}

// Custom Node Component with Clickable Links
const CustomNode = ({ data }: { data: any }) => {
  const isLink = data.url && data.url !== '#';
  
  const handleClick = (e: React.MouseEvent) => {
    if (isLink) {
      e.preventDefault();
      e.stopPropagation();
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent React Flow from starting pan when clicking on node
    if (isLink) {
      e.stopPropagation();
    }
  };
  
  // Determine handle positions based on node type
  const isInput = data.type === 'input';
  const isOutput = data.type === 'output';
  const isImplementation = data.type === 'implementation';
  
  return (
    <div 
      className={`custom-node ${data.type || ''} ${isLink ? 'clickable' : ''}`}
      style={{ cursor: isLink ? 'pointer' : 'default' }}
      title={isLink ? `Click to open: ${data.url}` : ''}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Input nodes: handle on right, output nodes: handle on left, implementation: both */}
      {!isOutput && <Handle type="source" position={Position.Right} id="source" />}
      {!isInput && <Handle type="target" position={Position.Left} id="target" />}
      
      <div className="node-label">{data.label}</div>
      {data.description && (
        <div className="node-description">{data.description}</div>
      )}
      {isLink && <div className="node-link-indicator" title="Click to open link">↗</div>}
    </div>
  );
};

// Define nodeTypes outside component to prevent recreation warnings
const nodeTypes = {
  custom: CustomNode,
};

export const TaskGraph: React.FC<TaskGraphProps> = ({ taskDetail }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);
  const edgesInitialized = useRef(false);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    const nodeData = node.data as any;
    if (nodeData?.url && nodeData.url !== '#') {
      event.preventDefault();
      event.stopPropagation();
      window.open(nodeData.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Calculate evenly distributed node positions
  const calculateNodePositions = useCallback((nodeCount: number, containerWidth: number) => {
    if (nodeCount === 0) return [];
    
    const nodeWidth = 200; // Approximate node width including spacing
    const padding = 40; // Padding on each side
    const availableWidth = containerWidth - (padding * 2);
    const totalNodeWidth = nodeCount * nodeWidth;
    
    // If nodes fit comfortably, space them evenly
    if (totalNodeWidth <= availableWidth) {
      const spacing = (availableWidth - totalNodeWidth) / (nodeCount + 1);
      return Array.from({ length: nodeCount }, (_, i) => {
        return padding + spacing + (i * (nodeWidth + spacing));
      });
    } else {
      // If nodes don't fit, distribute evenly across available width
      const spacing = availableWidth / (nodeCount + 1);
      return Array.from({ length: nodeCount }, (_, i) => {
        return padding + (spacing * (i + 1));
      });
    }
  }, []);

  // Recalculate positions when container resizes
  useEffect(() => {
    const handleResize = () => {
      if (nodes.length > 0 && containerRef.current) {
        const graph = taskDetail['@graph'] || [];
        const implementation = taskDetail['cr:TaskProblem']?.['cr:implementation'];
        if (!implementation) return;
        
        const containerWidth = containerRef.current.getBoundingClientRect().width || 800;
        const yCenter = 100;
        const padding = 40;
        const availableWidth = containerWidth - (padding * 2);
        
        // Separate nodes by type
        const inputNodes = nodes.filter(n => n.data.type === 'input');
        const implementationNodes = nodes.filter(n => n.data.type === 'implementation');
        const outputNodes = nodes.filter(n => n.data.type === 'output');
        
        // Left section: inputs
        const leftSectionWidth = availableWidth * 0.4;
        const inputXPositions = inputNodes.length > 0 
          ? calculateNodePositions(inputNodes.length, leftSectionWidth).map(x => padding + x)
          : [];
        
        // Center section: implementations stacked vertically
        const centerX = padding + leftSectionWidth + (availableWidth * 0.2);
        const implementationSpacing = 120;
        const implementationStartY = yCenter - ((implementationNodes.length - 1) * implementationSpacing) / 2;
        
        // Right section: outputs
        const rightSectionStartX = padding + leftSectionWidth + (availableWidth * 0.2) + 180;
        const rightSectionWidth = availableWidth * 0.4;
        const outputXPositions = outputNodes.length > 0
          ? calculateNodePositions(outputNodes.length, rightSectionWidth).map(x => rightSectionStartX + x)
          : [];
        
        setNodes((prevNodes) => 
          prevNodes.map((node) => {
            const nodeType = node.data.type;
            if (nodeType === 'input') {
              const index = inputNodes.findIndex(n => n.id === node.id);
              return { ...node, position: { x: inputXPositions[index], y: yCenter } };
            } else if (nodeType === 'implementation') {
              const index = implementationNodes.findIndex(n => n.id === node.id);
              return { ...node, position: { x: centerX - 90, y: implementationStartY + (index * implementationSpacing) } };
            } else if (nodeType === 'output') {
              const index = outputNodes.findIndex(n => n.id === node.id);
              return { ...node, position: { x: outputXPositions[index], y: yCenter } };
            }
            return node;
          })
        );
        
        setTimeout(() => {
          if (reactFlowInstance.current) {
            reactFlowInstance.current.setViewport({ x: 0, y: 0, zoom: 1.0 });
          }
        }, 50);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes.length, taskDetail, calculateNodePositions]);

  useEffect(() => {
    const graph = taskDetail['@graph'] || [];
    const implementation = taskDetail['cr:TaskProblem']?.['cr:implementation'];
    
    if (!implementation) return;

    // Wait for container to be ready
    if (!containerRef.current) {
      setTimeout(() => {
        // Retry after a short delay
      }, 100);
      return;
    }

    const containerWidth = containerRef.current.getBoundingClientRect().width || 800;
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    const yCenter = 100; // Center vertically in the canvas
    
    // Collect all nodes first
    const nodeList: Array<{ id: string; label: string; description: string; url: string; type: string }> = [];
    
    // Input nodes (data only - exclude reference implementations which are code)
    if (implementation['cr:input']) {
      const inputs = implementation['cr:input'];
      inputs.forEach((inputRef: any) => {
        const inputId = inputRef['@id'];
        const inputObj = graph.find((item: any) => item['@id'] === inputId);
        const label = inputObj ? (inputObj.name || inputId) : inputId;
        const url = inputObj?.url || '#';
        
        // Check if this is a reference implementation (code) vs data
        const isReferenceImpl = label.toLowerCase().includes('reference') || 
                                label.toLowerCase().includes('repo root') ||
                                label.toLowerCase().includes('implementation');
        
        nodeList.push({
          id: inputId,
          label: label,
          description: inputObj?.description || '',
          url: url,
          type: isReferenceImpl ? 'implementation' : 'input'
        });
      });
    }
    
    // Implementation node
    nodeList.push({
      id: 'implementation-node',
      label: 'Implementation',
      description: 'Code Repository',
      url: taskDetail['cr:TaskProblem']?.url || '#',
      type: 'implementation'
    });
    
    // Output node
    if (implementation['cr:output']) {
      const outputId = implementation['cr:output']['@id'];
      const outputObj = graph.find((item: any) => item['@id'] === outputId);
      const label = outputObj ? (outputObj.name || outputId) : outputId;
      
      nodeList.push({
        id: outputId,
        label: label,
        description: outputObj?.description || '',
        url: '#',
        type: 'output'
      });
    }
    
    // Separate nodes by type for layout
    const inputNodes = nodeList.filter(n => n.type === 'input');
    const implementationNodes = nodeList.filter(n => n.type === 'implementation');
    const outputNodes = nodeList.filter(n => n.type === 'output');
    
    // Calculate positions: inputs on left, implementations stacked in center, outputs on right
    const padding = 40;
    const nodeWidth = 200;
    const availableWidth = containerWidth - (padding * 2);
    
    // Left section: inputs
    const leftSectionWidth = availableWidth * 0.4; // 40% for inputs
    const inputXPositions = inputNodes.length > 0 
      ? calculateNodePositions(inputNodes.length, leftSectionWidth).map(x => padding + x)
      : [];
    
    // Center section: implementations stacked vertically at same x
    const centerX = padding + leftSectionWidth + (availableWidth * 0.2); // Center of middle section
    const implementationSpacing = 120; // Vertical spacing between implementation nodes
    const implementationStartY = yCenter - ((implementationNodes.length - 1) * implementationSpacing) / 2;
    
    // Right section: outputs
    const rightSectionStartX = padding + leftSectionWidth + (availableWidth * 0.2) + 180; // After center section
    const rightSectionWidth = availableWidth * 0.4; // 40% for outputs
    const outputXPositions = outputNodes.length > 0
      ? calculateNodePositions(outputNodes.length, rightSectionWidth).map(x => rightSectionStartX + x)
      : [];
    
    // Create nodes with sequential horizontal layout
    // Input nodes on the left
    inputNodes.forEach((nodeInfo, index) => {
      newNodes.push({
        id: nodeInfo.id,
        type: 'custom',
        data: {
          label: nodeInfo.label,
          description: nodeInfo.description,
          url: nodeInfo.url,
          type: nodeInfo.type
        },
        position: { x: inputXPositions[index], y: yCenter },
      });
    });
    
    // Implementation nodes stacked vertically at center x position
    implementationNodes.forEach((nodeInfo, index) => {
      newNodes.push({
        id: nodeInfo.id,
        type: 'custom',
        data: {
          label: nodeInfo.label,
          description: nodeInfo.description,
          url: nodeInfo.url,
          type: nodeInfo.type
        },
        position: { x: centerX - 90, y: implementationStartY + (index * implementationSpacing) },
      });
    });
    
    // Output nodes on the right
    outputNodes.forEach((nodeInfo, index) => {
      newNodes.push({
        id: nodeInfo.id,
        type: 'custom',
        data: {
          label: nodeInfo.label,
          description: nodeInfo.description,
          url: nodeInfo.url,
          type: nodeInfo.type
        },
        position: { x: outputXPositions[index], y: yCenter },
      });
    });
    
    // Create directed edges: inputs -> all implementation nodes -> outputs
    if (implementationNodes.length > 0 && newNodes.length > 0) {
      const nodeIdSet = new Set(newNodes.map(n => n.id));
      
      // Connect all input nodes to ALL implementation nodes
      inputNodes.forEach(inputNode => {
        implementationNodes.forEach(implNode => {
          if (nodeIdSet.has(inputNode.id) && nodeIdSet.has(implNode.id)) {
            newEdges.push({
              id: `e-${inputNode.id}-${implNode.id}`,
              source: inputNode.id,
              target: implNode.id,
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#2563eb', strokeWidth: 3 },
              markerEnd: { 
                type: 'arrowclosed', 
                width: 12, // 40% smaller: 20 * 0.6 = 12
                height: 12,
                color: '#2563eb' // Same color as edge
              },
            });
          }
        });
      });
      
      // Connect ALL implementation nodes to all output nodes
      implementationNodes.forEach(implNode => {
        outputNodes.forEach(outputNode => {
          if (nodeIdSet.has(implNode.id) && nodeIdSet.has(outputNode.id)) {
            newEdges.push({
              id: `e-${implNode.id}-${outputNode.id}`,
              source: implNode.id,
              target: outputNode.id,
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#2563eb', strokeWidth: 3 },
              markerEnd: { 
                type: 'arrowclosed', 
                width: 12, // 40% smaller: 20 * 0.6 = 12
                height: 12,
                color: '#2563eb' // Same color as edge
              },
            });
          }
        });
      });
    }

    // Ensure all nodes have valid positions
    newNodes.forEach(node => {
      if (!node.position || (node.position.x === undefined || node.position.y === undefined)) {
        console.warn('Node missing position:', node.id);
        node.position = { x: 0, y: 0 };
      }
    });
    
    // Set nodes and edges together - React Flow should handle this
    setNodes(newNodes);
    setEdges(newEdges);
    edgesInitialized.current = true;
    
    // Debug: log to verify
    if (newEdges.length > 0) {
      console.log(`✅ Set ${newEdges.length} edges:`, newEdges.map(e => `${e.source} -> ${e.target}`));
      console.log('✅ Node positions:', newNodes.map(n => `${n.id}@(${n.position.x},${n.position.y})`));
    }
    
    // Set viewport after React Flow processes everything
    setTimeout(() => {
      if (reactFlowInstance.current && newNodes.length > 0) {
        reactFlowInstance.current.setViewport({ x: 0, y: 0, zoom: 1.0 });
      }
    }, 200);
  }, [taskDetail, calculateNodePositions]);

  const onInit = (instance: any) => {
    reactFlowInstance.current = instance;
    // Ensure viewport is set after initialization
    instance.setViewport({ x: 0, y: 0, zoom: 1.0 });
  };

  return (
    <div className="task-graph" ref={containerRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={{}}
        defaultEdgeOptions={{
          animated: true,
          type: 'smoothstep',
          style: { 
            strokeWidth: 3,
            stroke: '#2563eb',
          },
          markerEnd: {
            type: 'arrowclosed',
            width: 12, // 40% smaller: 20 * 0.6 = 12
            height: 12,
            color: '#2563eb', // Same color as edge
          },
        }}
        minZoom={0.3}
        maxZoom={2.0}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnDoubleClick={false}
        zoomOnPinch={true}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        fitView={false}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};


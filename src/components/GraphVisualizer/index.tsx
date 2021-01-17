import { useCallback, useEffect, useRef } from 'react';
import { Graph } from 'components/Graph';
import { GraphNodeId, GraphRelId } from 'components/Graph/types';

import styles from './index.module.css';

const DEFAULT_NODE_RADIUS = 10;
const DEFAULT_LABEL_PAD_X = DEFAULT_NODE_RADIUS + 4;
const DEFAULT_LABEL_PAD_Y = 4;
const DEFAULT_NODE_COLOR = '#000';
const DEFAULT_REL_COLOR = '#000';

// const DATA_TYPE_REL = '1';
const DATA_TYPE_NODE = '2';
const DATA_TYPE_LABEL = '3';

const EVENT_START_DRAGGING_NODE = 'GraphVisualizer.event.startDraggingNode';

type RelsEls = Record<GraphRelId, SVGLineElement | null>;
type NodesEls = Record<GraphNodeId, SVGCircleElement | null>;
type LabelsEls = Record<GraphNodeId, SVGTextElement | null>;

export interface GraphVisualizerProps {
    graph: Graph;
    onNodeClick: (nodeId: GraphNodeId) => void;
}

export interface GraphVisualizerState {
    isNodeMoving: boolean;
    isCanvasMoving: boolean;
    currentNodeId?: GraphNodeId;
    currentNodeEl?: SVGCircleElement;
    currentLabelEl?: SVGTextElement;
    x?: number;
    y?: number;
    mouseX?: number;
    mouseY?: number;
}

function renderRels(graph: Graph, relsEls: RelsEls) {
    const { rels, nodes } = graph;

    return <>
        {Object.keys(rels).map((relId) => {
            const rel = rels[relId];
            const nodeFrom = nodes[rel.from];
            const nodeTo = nodes[rel.to];
            const color = DEFAULT_REL_COLOR;

            return <line
                key={relId}
                ref={(el) => relsEls[relId] = el}
                x1={nodeFrom.x}
                y1={nodeFrom.y}
                x2={nodeTo.x}
                y2={nodeTo.y}
                stroke={color}
            />;
        })}
    </>;
}

function renderNodes(graph: Graph, nodesEls: NodesEls) {
    const { nodes } = graph;

    return <>
        {Object.keys(nodes).map((nodeId) => {
            const node = nodes[nodeId];
            const radius = DEFAULT_NODE_RADIUS;
            const color = node.color || DEFAULT_NODE_COLOR;

            return <circle
                key={nodeId}
                ref={(el) => nodesEls[nodeId] = el}
                data-type={DATA_TYPE_NODE}
                data-id={nodeId}
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={color}
            />;
        })}
    </>;
}

function renderLabels(graph: Graph, labelsEls: LabelsEls) {
    const { nodes } = graph;

    return <>
        {Object.keys(nodes).map((nodeId) => {
            const node = nodes[nodeId];
            const { label } = node;

            if (!label) {
                return null;
            }

            return <text
                key={nodeId}
                ref={(el) => labelsEls[nodeId] = el}
                data-type={DATA_TYPE_LABEL}
                data-id={nodeId}
                x={node.x + DEFAULT_NODE_RADIUS + 4}
                y={node.y + 4}
            >{label}</text>;
        })}
    </>;
}

export function GraphVisualizer({ graph, onNodeClick }: GraphVisualizerProps) {
    const stateRef = useRef<GraphVisualizerState>({
        isNodeMoving: false,
        isCanvasMoving: false,
    });

    const canvasRef = useRef<SVGSVGElement>(null);

    const relsEls: RelsEls = {}; // eslint-disable-line react-hooks/exhaustive-deps
    const nodesEls: NodesEls = {}; // eslint-disable-line react-hooks/exhaustive-deps
    const labelsEls: LabelsEls = {}; // eslint-disable-line react-hooks/exhaustive-deps

    const startDraggingNodeById = useCallback((
        nodeId: GraphNodeId,
        mouseX: number,
        mouseY: number,
    ) => {
        const state = stateRef.current;

        if (state.isNodeMoving) {
            return;
        }

        const node = graph.nodes[nodeId];

        state.isNodeMoving = true;
        state.currentNodeId = nodeId;
        state.currentNodeEl = nodesEls[nodeId]!;
        state.currentLabelEl = labelsEls[nodeId]!;
        state.x = node.x;
        state.y = node.y;
        state.mouseX = mouseX;
        state.mouseY = mouseY;
    }, [
        graph.nodes,
        nodesEls,
        labelsEls,
    ]);

    const startDraggingCanvas = useCallback((
        mouseX: number,
        mouseY: number,
    ) => {
        const state = stateRef.current;

        if (state.isCanvasMoving) {
            return;
        }

        state.isCanvasMoving = true;
        state.x = graph.canvas.x;
        state.y = graph.canvas.y;
        state.mouseX = mouseX;
        state.mouseY = mouseY;
    }, [graph]);

    const onStartDraggingNode = useCallback((event: Event) => {
        const { nodeId, mouseX, mouseY } = (event as CustomEvent).detail;
        startDraggingNodeById(nodeId, mouseX, mouseY);
    }, [startDraggingNodeById]);

    useEffect(() => {
        const state = stateRef.current;

        const x = (event: MouseEvent) =>
            state.x! + event.clientX - state.mouseX!;

        const y = (event: MouseEvent) =>
            state.y! + event.clientY - state.mouseY!;

        function onMouseDown(event: MouseEvent) {
            const target = (event.target as SVGElement | null)!;
            const { id, type } = target?.dataset;

            if (type === DATA_TYPE_NODE || type === DATA_TYPE_LABEL) {
                startDraggingNodeById(id!, event.clientX, event.clientY);
            } else {
                const tagName = target.tagName.toLowerCase();

                if (tagName === 'svg' || tagName === 'html' || tagName === 'body') {
                    startDraggingCanvas(event.clientX, event.clientY);
                }
            }
        }

        function onMouseMove(event: MouseEvent) {
            if (state.isNodeMoving) {
                const nodeId = state.currentNodeId!;

                if (!state.currentNodeEl) {
                    state.currentNodeEl = nodesEls[nodeId]!;
                }

                if (!state.currentLabelEl) {
                    state.currentLabelEl = labelsEls[nodeId]!;
                }

                const nodeEl = state.currentNodeEl!;
                const labelEl = state.currentLabelEl!;

                const newX = x(event);
                const newY = y(event);

                if (nodeEl) {
                    nodeEl.setAttribute('cx', String(newX));
                    nodeEl.setAttribute('cy', String(newY));
                }

                if (labelEl) {
                    labelEl.setAttribute('x', String(newX + DEFAULT_LABEL_PAD_X));
                    labelEl.setAttribute('y', String(newY + DEFAULT_LABEL_PAD_Y));
                }

                for (const relId in graph.relsFromNode[nodeId]) {
                    const relEl = relsEls[relId]!;

                    relEl.setAttribute('x1', String(newX));
                    relEl.setAttribute('y1', String(newY));
                }

                for (const relId in graph.relsToNode[nodeId]) {
                    const relEl = relsEls[relId]!;

                    relEl.setAttribute('x2', String(newX));
                    relEl.setAttribute('y2', String(newY));
                }
            } else if (state.isCanvasMoving) {
                const newX = x(event);
                const newY = y(event);

                const style = canvasRef.current!.style;

                style.left = newX + 'px';
                style.top = newY + 'px';
            }
        }

        function onMouseUp(event: MouseEvent) {
            if (state.isNodeMoving) {
                const nodeId = state.currentNodeId!;

                const newX = x(event);
                const newY = y(event);

                graph.setNodeFields(nodeId, {
                    x: newX,
                    y: newY,
                });

                state.isNodeMoving = false;

                const deltaX = Math.abs(state.x! - newX);
                const deltaY = Math.abs(state.y! - newY);

                if (deltaX < 3 && deltaY < 3) {
                    onNodeClick(state.currentNodeId!);
                }
            } else if (state.isCanvasMoving) {
                graph.setCanvasPos(x(event), y(event));
                state.isCanvasMoving = false;
            }
        }

        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return function unmount() {
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [
        graph,
        onNodeClick,
        relsEls,
        nodesEls,
        labelsEls,
        startDraggingNodeById,
        startDraggingCanvas,
    ]);

    useEffect(() => {
        window.addEventListener(EVENT_START_DRAGGING_NODE, onStartDraggingNode);

        return function unmount() {
            window.removeEventListener(EVENT_START_DRAGGING_NODE, onStartDraggingNode);
        };
    }, [onStartDraggingNode]);

    return (
        <svg
            ref={canvasRef}
            xmlns="http://www.w3.org/2000/svg"
            className={styles.GraphVisualizer}
            style={{
                left: graph.canvas.x + 'px',
                top: graph.canvas.y + 'px',
            }}
        >
            {renderRels(graph, relsEls)}
            {renderNodes(graph, nodesEls)}
            {renderLabels(graph, labelsEls)}
        </svg>
    );
}

GraphVisualizer.startDraggingNodeById = function(
    nodeId: GraphNodeId,
    mouseX: number,
    mouseY: number,
) {
    const event = new CustomEvent(EVENT_START_DRAGGING_NODE, {
        detail: {
            nodeId,
            mouseX,
            mouseY,
        },
    });

    window.dispatchEvent(event);
}

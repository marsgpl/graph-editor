export type GraphNodeId = string;
export type GraphRelId = string;

export interface GraphNode {
    x: number;
    y: number;
    label?: string;
    color?: string;
}

export interface GraphRel {
    from: GraphNodeId;
    to: GraphNodeId;
}

export type GraphNodes = Record<GraphNodeId, GraphNode>;
export type GraphRels = Record<GraphRelId, GraphRel>;
export type GraphRelsByNodeId = Record<GraphNodeId, Record<GraphRelId, true>>;

export interface GraphCanvas {
    x: number;
    y: number;
    scale: number;
}

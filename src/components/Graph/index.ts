import { GraphStorage } from 'components/GraphStorage';
import { GraphCanvas, GraphNode, GraphNodeId, GraphNodes, GraphRelId, GraphRels, GraphRelsByNodeId } from './types';

export class Graph {
    public relsFromNode: GraphRelsByNodeId = {};
    public relsToNode: GraphRelsByNodeId = {};

    constructor(
        public canvas: GraphCanvas,
        public nodes: GraphNodes,
        public rels: GraphRels,
        protected storage?: GraphStorage,
    ) {
        this.indexRels();
    }

    protected indexRels() {
        const { rels, nodes, relsFromNode, relsToNode } = this;

        for (const nodeId in nodes) {
            relsFromNode[nodeId] = {};
            relsToNode[nodeId] = {};
        }

        for (const relId in rels) {
            const { from, to } = rels[relId];

            relsFromNode[from][relId] = true;
            relsToNode[to][relId] = true;
        }
    }

    public setNodeFields(nodeId: GraphNodeId, fields: Partial<GraphNode>) {
        const { nodes } = this;

        const node = nodes[nodeId];

        if (fields.label !== undefined) {
            node.label = fields.label;
        }

        if (fields.color !== undefined) {
            node.color = fields.color;
        }

        if (fields.x !== undefined) {
            node.x = fields.x;
        }

        if (fields.y !== undefined) {
            node.y = fields.y;
        }

        this.storage?.saveNodes(nodes);
    }

    public setCanvasPos(x: number, y: number) {
        const { canvas } = this;

        canvas.x = x;
        canvas.y = y;

        this.storage?.saveCanvas(canvas);
    }

    public static createId() {
        return Math.random() + ':' + performance.now() + ':' + Date.now();
    }

    public createNode(x: number, y: number) {
        const { nodes, relsFromNode, relsToNode } = this;

        const nodeId = Graph.createId();

        nodes[nodeId] = { x, y };

        relsFromNode[nodeId] = {};
        relsToNode[nodeId] = {};

        this.storage?.saveNodes(nodes);

        return nodeId;
    }

    public createRel(fromNodeId: GraphNodeId, toNodeId: GraphNodeId) {
        const { rels, relsFromNode, relsToNode } = this;

        for (const relId in rels) {
            const { from, to } = rels[relId];

            if (
                (from === fromNodeId && to === toNodeId) ||
                (from === toNodeId && to === fromNodeId)
            ) {
                return;
            }
        }

        const relId = Graph.createId();

        rels[relId] = {
            from: fromNodeId,
            to: toNodeId,
        };

        relsFromNode[fromNodeId][relId] = true;
        relsToNode[toNodeId][relId] = true;

        this.storage?.saveRels(rels);

        return relId;
    }

    public deleteNode(nodeId: GraphNodeId) {
        const { nodes, rels, relsFromNode, relsToNode } = this;

        let relsAltered = false;

        delete nodes[nodeId];

        for (const relId in relsFromNode[nodeId]) {
            const rel = rels[relId];

            if (rel) {
                delete relsToNode[rel.to][relId];
                delete rels[relId];
                relsAltered = true;
            }
        }

        for (const relId in relsToNode[nodeId]) {
            const rel = rels[relId];

            if (rel) {
                delete relsFromNode[rel.from][relId];
                delete rels[relId];
                relsAltered = true;
            }
        }

        delete relsFromNode[nodeId];
        delete relsToNode[nodeId];

        this.storage?.saveNodes(nodes);

        if (relsAltered) {
            this.storage?.saveRels(rels);
        }
    }

    public deleteRel(relId: GraphRelId) {
        const { rels, relsFromNode, relsToNode } = this;

        delete rels[relId];

        for (const nodeId in relsFromNode) {
            delete relsFromNode[nodeId][relId];
        }

        for (const nodeId in relsToNode) {
            delete relsToNode[nodeId][relId];
        }

        this.storage?.saveRels(rels);
    }
}

import { GraphCanvas, GraphNodes, GraphRels } from 'components/Graph/types';

const DEFAULT_CANVAS: GraphCanvas = {
    x: 0,
    y: 0,
    scale: 1,
};

const DEMO_NODES: GraphNodes = {
    'nodeId1': {
        x: 230,
        y: 240,
        label: 'water',
        color: '#3196cc'
    },
    'nodeId2': {
        x: 420,
        y: 320,
        label: 'ice',
        color: '#9de8f5',
    },
};

const DEMO_RELS: GraphRels = {
    'relId1': {
        from: 'nodeId1',
        to: 'nodeId2',
    },
};

export class GraphStorage {
    protected canvasKey: string;
    protected nodesKey: string;
    protected relsKey: string;

    constructor(protected name: string) {
        this.canvasKey = `GraphStorage.canvas:${name}`;
        this.nodesKey = `GraphStorage.nodes:${name}`;
        this.relsKey = `GraphStorage.rels:${name}`;
    }

    public loadCanvas(): GraphCanvas {
        const json = localStorage.getItem(this.canvasKey);
        return json ? JSON.parse(json) : DEFAULT_CANVAS;
    }

    public loadNodes(): GraphNodes {
        const json = localStorage.getItem(this.nodesKey);
        return json ? JSON.parse(json) : DEMO_NODES;
    }

    public loadRels(): GraphRels {
        const json = localStorage.getItem(this.relsKey);
        return json ? JSON.parse(json) : DEMO_RELS;
    }

    public saveCanvas(canvas: GraphCanvas) {
        localStorage.setItem(this.canvasKey, JSON.stringify(canvas));
    }

    public saveNodes(nodes: GraphNodes) {
        localStorage.setItem(this.nodesKey, JSON.stringify(nodes));
    }

    public saveRels(rels: GraphRels) {
        localStorage.setItem(this.relsKey, JSON.stringify(rels));
    }
}

import { useCallback, useMemo, useState } from 'react';

import styles from './index.module.css';

import { Graph } from 'components/Graph';
import { GraphVisualizer } from 'components/GraphVisualizer';
import { Button } from 'components/Button';
import { EditGraphNodePopup } from 'components/EditGraphNodePopup';
import { GraphStorage } from 'components/GraphStorage';
import { GraphNodeId } from 'components/Graph/types';

export function App() {
    const [isAddNodeButtonVisible, setAddNodeButtonVisibility] = useState(true);
    const [editGraphNodePopupNodeId, setEditGraphNodePopupNodeId] = useState<GraphNodeId | null>(null);

    const graphStorage = useMemo(() => new GraphStorage('main'), []);

    const graph = useMemo(() => new Graph(
        graphStorage.loadCanvas(),
        graphStorage.loadNodes(),
        graphStorage.loadRels(),
        graphStorage,
    ), [graphStorage]);

    const startAddingNode = useCallback((event: React.MouseEvent) => {
        setAddNodeButtonVisibility(false);

        const x = event.clientX;
        const y = event.clientY;

        const nodeId = graph.createNode(
            x - graph.canvas.x,
            y - graph.canvas.y);

        GraphVisualizer.startDraggingNodeById(nodeId, x, y);

        setTimeout(() => {
            setAddNodeButtonVisibility(true);
        }, 500);
    }, [graph]);

    const onNodeClick = useCallback((nodeId: GraphNodeId) => {
        setEditGraphNodePopupNodeId(nodeId);
    }, []);

    return (
        <>
            <GraphVisualizer
                graph={graph}
                onNodeClick={onNodeClick}
            />

            {!isAddNodeButtonVisible ? null : <Button
                theme="grey"
                size="med"
                classNames={[styles.AddNodeButton]}
                onClick={startAddingNode}
            >Add node</Button>}

            <EditGraphNodePopup
                graph={graph}
                nodeId={editGraphNodePopupNodeId}
                setNodeId={setEditGraphNodePopupNodeId}
            />
        </>
    );
}

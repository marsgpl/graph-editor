import { useCallback, useMemo, useRef, useState } from 'react';

import { GraphNodeId, GraphRelId } from 'components/Graph/types';
import { Popup } from 'components/Popup';
import { Button } from 'components/Button';
import { Graph } from 'components/Graph';
import { InputText } from 'components/InputText';
import { AddGraphRelPopup } from 'components/AddGraphRelPopup';

import formStyles from 'components/Form/index.module.css';
import styles from './index.module.css';

export interface EditGraphNodePopupProps {
    graph: Graph;
    nodeId: GraphNodeId | null;
    setNodeId: (nodeId: GraphNodeId | null) => void;
}

export function EditGraphNodePopup({ graph, nodeId, setNodeId }: EditGraphNodePopupProps) {
    const isVisible = nodeId !== null;

    const [addGraphRelPopupNodeId, setAddGraphRelPopupNodeId] = useState<GraphNodeId | null>(null);
    const [, updateState] = useState({});

    const labelRef = useRef<HTMLInputElement>(null);
    const colorRef = useRef<HTMLInputElement>(null);

    const node = useMemo(() => graph.nodes[nodeId!], [nodeId, graph.nodes]);

    const hide = useCallback(() =>
        setNodeId(null),
    [setNodeId]);

    const deleteNode = useCallback(() => {
        graph.deleteNode(nodeId!);
        hide();
    }, [
        graph,
        nodeId,
        hide,
    ]);

    const saveNode = useCallback(() => {
        const label = labelRef.current?.value.trim() || '';
        const color = colorRef.current?.value.trim() || '';

        graph.setNodeFields(nodeId!, {
            label,
            color,
        });

        hide();
    }, [
        graph,
        nodeId,
        hide,
    ]);

    const showAddRelPopup = useCallback(() => {
        setAddGraphRelPopupNodeId(nodeId);
    }, [nodeId]);

    const removeRel = useCallback((event: React.MouseEvent<HTMLElement>) => {
        const relId = (event.target as HTMLElement).dataset.id;

        graph.deleteRel(relId!);

        updateState({});
    }, [graph]);

    const renderRelById = useCallback((relId: GraphRelId) => {
        const rels = graph.rels;
        const nodes = graph.nodes;

        const rel = rels[relId];
        const nodeFrom = nodes[rel.from];
        const nodeTo = nodes[rel.to];

        return (
            <div className={styles.RelRow} key={relId}>
                <label>
                    {nodeFrom.label || rel.from}
                    &nbsp;
                    {'->'}
                    &nbsp;
                    {nodeTo.label || rel.to}
                </label>

                <span className={styles.RelRowGrow} />

                <Button
                    size="small"
                    theme="yellow"
                    onClick={removeRel}
                    attributes={{
                        'data-id': relId,
                    }}
                >x</Button>
            </div>
        );
    }, [graph.rels, graph.nodes, removeRel]);

    const renderRels = useCallback(() => (
        <>
            {Object.keys(graph.relsToNode[nodeId!]).map(renderRelById)}
            {Object.keys(graph.relsFromNode[nodeId!]).map(renderRelById)}
        </>
    ), [
        graph.relsToNode,
        graph.relsFromNode,
        nodeId,
        renderRelById,
    ]);

    const renderBody = useCallback(() => {
        return <>
            <label className={formStyles.Row}>
                <div className={formStyles.RowLabel}>Label</div>
                <InputText ref={labelRef} initialValue={node.label} />
            </label>

            <label className={formStyles.Row}>
                <div className={formStyles.RowLabel}>Color</div>
                <InputText ref={colorRef} initialValue={node.color} />
            </label>

            <div className={formStyles.Row}>
                <div className={formStyles.RowLabel}>Rels</div>

                {renderRels()}

                <Button
                    classNames={[styles.AddRelButton]}
                    theme="yellow"
                    size="med"
                    onClick={showAddRelPopup}
                >Add rel</Button>
            </div>

            <div className={formStyles.Buttons}>
                <Button theme="grey" size="big" onClick={deleteNode}>Delete</Button>
                <span className={formStyles.ButtonsGrow}></span>
                <Button theme="yellow" size="big" onClick={saveNode}>Save</Button>
            </div>
        </>;
    }, [
        node,
        deleteNode,
        saveNode,
        renderRels,
        showAddRelPopup,
    ]);

    if (!isVisible) {
        return null;
    }

    return <>
        <Popup
            title={node.label || "Edit node"}
            body={renderBody()}
            isVisible={isVisible}
            setVisibility={hide}
            maxWidth={500}
        />

        <AddGraphRelPopup
            graph={graph}
            nodeId={addGraphRelPopupNodeId}
            setNodeId={setAddGraphRelPopupNodeId}
        />
    </>;
}

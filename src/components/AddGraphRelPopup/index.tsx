import { useCallback } from 'react';

import { Graph } from 'components/Graph';
import { GraphNodeId } from 'components/Graph/types';
import { Popup } from 'components/Popup';
import { InputText } from 'components/InputText';
import { InputTextDropdown } from 'components/InputTextDropdown';

import styles from 'components/Form/index.module.css';

export interface AddGraphRelPopupProps {
    graph: Graph;
    nodeId: GraphNodeId | null;
    setNodeId: (nodeId: GraphNodeId | null) => void;
}

export function AddGraphRelPopup({ graph, nodeId, setNodeId }: AddGraphRelPopupProps) {
    const isVisible = nodeId !== null;

    const hide = useCallback(() =>
        setNodeId(null),
    [setNodeId]);

    const onInput = useCallback((value: string) => {
        value = value.trim().toLowerCase();

        if (!value.length) {
            return [];
        }

        const found: Record<GraphNodeId, true> = {};
        const nodes = graph.nodes;

        for (const nid in nodes) {
            if (nodeId === nid) {
                continue;
            }

            const node = nodes[nid];

            if (!node.label || !(node.label.toLowerCase().includes(value))) {
                continue;
            }

            found[nid] = true;
        }

        return Object.keys(found);
    }, [graph.nodes, nodeId]);

    const renderRowContent = useCallback((nodeId: GraphNodeId) => {
        const node = graph.nodes[nodeId];
        return node.label || nodeId;
    }, [graph.nodes]);

    const onRowSelect = useCallback((selectedNodeId: GraphNodeId) => {
        graph.createRel(nodeId!, selectedNodeId);
        hide();
    }, [graph, hide, nodeId]);

    const renderBody = useCallback(() => {
        const node = graph.nodes[nodeId!];

        return <>
            <label className={styles.Row}>
                <div className={styles.RowLabel}>From</div>
                <InputText disabled={true} initialValue={node.label || nodeId || ''} />
            </label>

            <label className={styles.Row}>
                <div className={styles.RowLabel}>To</div>
                <InputTextDropdown
                    onInput={onInput}
                    renderRowContent={renderRowContent}
                    onRowSelect={onRowSelect}
                    placeholder="Node label.."
                />
            </label>

            <div style={{height:'20px'}}></div>
        </>;
    }, [
        graph.nodes,
        nodeId,
        onInput,
        renderRowContent,
        onRowSelect,
    ]);

    if (!isVisible) {
        return null;
    }

    return <Popup
        title="Add rel"
        body={renderBody()}
        isVisible={isVisible}
        setVisibility={hide}
        maxWidth={460}
        marginTop={20}
    />;
}

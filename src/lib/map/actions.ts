import type { Writable } from "svelte/store";

import type { AnnotatedMap } from "./AnnotatedMap";
import type { MapLine, MapMarker, MapSelection } from "./layers";



export type MapActionType = "createNode" | "createEdge" | "deleteNode" | "deleteEdge";

export abstract class MapAction {
    public abstract execute(map: AnnotatedMap, currentSelection: Writable<MapSelection>): void;
    public abstract inverse(): MapAction;
}

export class CreateNodeWithEdgesAction extends MapAction {
    public constructor(
        private readonly node: MapMarker,
        private readonly edges: MapLine[],
    ) { super(); }

    public execute(map: AnnotatedMap, currentSelection: Writable<MapSelection>): void {
        this.edges.forEach((e) => map.addEdgeToMap(e));
        map.addNodeToMap(this.node);
        currentSelection.update((cs) => this.node.select(cs));
    }
    public inverse(): MapAction {
        return new DeleteNodeWithEdgesAction(this.node, this.edges);
    }
}
export class DeleteNodeWithEdgesAction extends MapAction {
    public constructor(
        private readonly node: MapMarker,
        private readonly edges: MapLine[],
    ) { super(); }

    public execute(map: AnnotatedMap, currentSelection: Writable<MapSelection>): void {
        currentSelection.update((cs) => {
            return cs?.data === this.node ?
                this.node.deselect() :
                cs;
        });

        this.edges.forEach((e) => map.removeEdgeFromMap(e));
        map.removeNodeFromMap(this.node);
    }
    public inverse(): MapAction {
        return new CreateNodeWithEdgesAction(this.node, this.edges);
    }
}

export class CreateEdgeAction extends MapAction {
    public constructor(
        private readonly edge: MapLine,
    ) { super(); }

    public execute(map: AnnotatedMap, currentSelection: Writable<MapSelection>): void {
        map.addEdgeToMap(this.edge);
        currentSelection.update((cs) => this.edge.select(cs));
    }
    public inverse(): MapAction {
        return new DeleteEdgeAction(this.edge);
    }
}
export class DeleteEdgeAction extends MapAction {
    public constructor(
        private readonly edge: MapLine,
    ) { super(); }

    public execute(map: AnnotatedMap, currentSelection: Writable<MapSelection>): void {
        map.removeEdgeFromMap(this.edge);

        currentSelection.update((cs) => {
            return cs?.data === this.edge ?
                this.edge.deselect() :
                cs;
        });
    }
    public inverse(): MapAction {
        return new CreateEdgeAction(this.edge);
    }
}

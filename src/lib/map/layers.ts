import L from "leaflet";

import { BlueCrossPointIconMap, RedCrossPointIconMap } from "./icons";
import { layerGroup2array } from "./utils";



export interface MapNodeData {
    id: string;
}
export interface MapEdgeData {
    fromNodeId: string;
    toNodeId: string;
}

export interface Selectable {
    select(currentSelection: MapSelection): MapSelection;
    deselect(): null;
    delete(nodeLayers: L.LayerGroup, edgeLayers: L.LayerGroup): null;
}

export class MapMarker extends L.Marker implements Selectable {
    public constructor(
        latlng: L.LatLngExpression,
        public readonly node: MapNodeData,
    ) {
        super(latlng);
    }

    public select(currentSelection: MapSelection) {
        if(currentSelection) { currentSelection.data.deselect(); }
        const zoom = this._map.getZoom() ?? 1;
        this.setIcon(RedCrossPointIconMap.get(zoom));

        return { type: "node", data: this } as const;
    }
    public deselect() {
        const zoom = this._map.getZoom() ?? 1;
        this.setIcon(BlueCrossPointIconMap.get(zoom));

        return null;
    }
    public delete(nodeLayer: L.LayerGroup, edgeLayer: L.LayerGroup) {
        const edgesToRemove = layerGroup2array<MapLine>(
            edgeLayer,
            (ml) => ml.edge.fromNodeId === this.node.id || ml.edge.toNodeId === this.node.id,
        );
        for(const ml of edgesToRemove) {
            edgeLayer.removeLayer(ml);
        }
        nodeLayer.removeLayer(this);

        return null;
    }
}
export class MapLine extends L.Polyline implements Selectable {
    public static readonly DEFAULT_COLOR = "#3a8ece";
    public static readonly ACTIVE_COLOR = "#f00";

    public readonly edge: MapEdgeData;

    public constructor(
        from: MapMarker,
        to: MapMarker,
    ) {
        super([ from.getLatLng(), to.getLatLng() ], {
            color: MapLine.DEFAULT_COLOR,
            bubblingMouseEvents: false,
        });
        this.edge = {
            fromNodeId: from.node.id,
            toNodeId: to.node.id,
        };
    }

    public select(currentSelection: MapSelection) {
        if(currentSelection) { currentSelection.data.deselect(); }
        this.setStyle({ color: MapLine.ACTIVE_COLOR });

        return { type: "edge", data: this } as const;
    }
    public deselect() {
        this.setStyle({ color: MapLine.DEFAULT_COLOR });

        return null;
    }
    public delete(_nodeLayer: L.LayerGroup, edgeLayer: L.LayerGroup) {
        edgeLayer.removeLayer(this);

        return null;
    }
}


export type MapSelection = { type: "node"; data: MapMarker } | { type: "edge"; data: MapLine } | null;

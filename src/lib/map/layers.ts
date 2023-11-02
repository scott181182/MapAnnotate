import L from "leaflet";

import { BlueCrossPointIconMap, RedCrossPointIconMap } from "./icons";



export interface MapNodeData {
    id: string;
    meta: Record<string, string>;
}
export interface MapEdgeData {
    fromNodeId: string;
    toNodeId: string;
    meta: Record<string, string>;
}

export interface Selectable {
    select(currentSelection: MapSelection): MapSelection;
    deselect(): null;

    isSelected(): boolean;
}

export class MapMarker extends L.Marker implements Selectable {
    private selected = false;

    public constructor(
        latlng: L.LatLngExpression,
        public readonly node: MapNodeData,
    ) {
        super(latlng);

        this.on("add", () => {
            this.setIcon(BlueCrossPointIconMap.get(this._map?.getZoom() ?? 1));
        });
    }

    public updateZoom(zoom: number) {
        if(this.selected) {
            this.setIcon(RedCrossPointIconMap.get(zoom));
        } else {
            this.setIcon(BlueCrossPointIconMap.get(zoom));
        }
    }

    public isSelected(): boolean { return this.selected; }

    public select(currentSelection: MapSelection) {
        if(currentSelection) { currentSelection.data.deselect(); }
        const zoom = this._map.getZoom() ?? 1;
        this.setIcon(RedCrossPointIconMap.get(zoom));

        this.selected = true;

        return { type: "node", data: this } as const;
    }
    public deselect() {
        if(this._map) {
            // `this._map` could be undefined if this was just removed.
            const zoom = this._map.getZoom() ?? 1;
            this.setIcon(BlueCrossPointIconMap.get(zoom));
        }

        this.selected = false;

        return null;
    }
}
export class MapLine extends L.Polyline implements Selectable {
    public static readonly DEFAULT_COLOR = "#3a8ece";
    public static readonly ACTIVE_COLOR = "#f00";

    public readonly edge: MapEdgeData;
    private selected = false;

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
            meta: {},
        };
    }

    public isSelected(): boolean { return this.selected; }

    public select(currentSelection: MapSelection) {
        if(currentSelection) { currentSelection.data.deselect(); }
        this.setStyle({ color: MapLine.ACTIVE_COLOR });

        this.selected = true;

        return { type: "edge", data: this } as const;
    }
    public deselect() {
        this.setStyle({ color: MapLine.DEFAULT_COLOR });

        this.selected = false;

        return null;
    }
}


export type MapSelection = { type: "node"; data: MapMarker } | { type: "edge"; data: MapLine } | null;

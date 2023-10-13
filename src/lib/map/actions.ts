import type { MapLine, MapMarker, MapSelection } from "./layers";



export type MapActionType = "createNode" | "createEdge" | "deleteNode" | "deleteEdge";
interface MapActionPayloadMap {
    createNode: MapMarker;
    createEdge: MapLine;
    deleteNode: MapMarker;
    deleteEdge: MapLine;
}

type MapAction = {
    action: "createNode";
    payload: MapMarker;
} | {
    action: "createEdge";
    payload: MapLine;
} | {
    action: "deleteNode";
    payload: MapMarker;
} | {
    action: "deleteEdge";
    payload: MapLine;
}

export class MapActionStack {
    private undoStack: MapAction[] = [];


    public push<A extends MapActionType>(action: A, payload: MapActionPayloadMap[A]) {
        this.undoStack.push({ action, payload } as MapAction);
    }
    public undo(nodeLayer: L.LayerGroup, edgeLayer: L.LayerGroup, currentSelection: MapSelection): MapSelection {
        const lastAction = this.undoStack.pop();
        if(!lastAction) { return currentSelection; }

        switch(lastAction.action) {
            case "createNode":
                return lastAction.payload.delete(nodeLayer, edgeLayer);
            case "createEdge":
                return lastAction.payload.delete(nodeLayer, edgeLayer);
            case "deleteNode":
                nodeLayer.addLayer(lastAction.payload);

                // TODO: re-add any deleted edges
                return lastAction.payload.select(currentSelection);
            case "deleteEdge":
                edgeLayer.addLayer(lastAction.payload);

                return lastAction.payload.select(currentSelection);
        }
    }
}

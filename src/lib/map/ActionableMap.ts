import type L from "leaflet";
import type { Writable } from "svelte/store";
import { get } from "svelte/store";

import { ReactiveStack } from "$lib/array";
import type { MapAction } from "./actions";
import { CreateEdgeAction, CreateNodeWithEdgesAction, DeleteEdgeAction, DeleteNodeWithEdgesAction  } from "./actions";
import { AnnotatedMap } from "./AnnotatedMap";
import type { MapLine, MapMarker, MapSelection } from "./layers";



export class ActionableMap {
    private map = new AnnotatedMap();
    /** Actions that have been performed that can be undone. */
    private readonly undoStack = new ReactiveStack<MapAction>();
    /** Actions that have been undone that can be redone. */
    private readonly redoStack = new ReactiveStack<MapAction>();

    public constructor(
        private currentSelection: Writable<MapSelection>,
    ) {  }

    private createClickableNode(latlng: L.LatLngExpression) {
        const node = this.map.createNode(latlng);
        node.on("click", (ev) => {
            const cs = get(this.currentSelection);
            if(ev.originalEvent.shiftKey && cs?.type === "node") {
                this.addEdge(cs.data, node);
            }
            this.currentSelection.update((sel) => node.select(sel));
        });

        return node;
    }
    private createClickableEdge(from: MapMarker, to: MapMarker) {
        const edge = this.map.createEdge(from, to);
        edge.on("click", () => {
            this.currentSelection.update((cs) => edge.select(cs));
        });

        return edge;
    }

    private performAction(action: MapAction) {
        action.execute(this.map, this.currentSelection);
        this.undoStack.push(action);
        this.redoStack.clear();
    }



    public addNode(latlng: L.LatLngExpression) {
        const node = this.createClickableNode(latlng);
        const action = new CreateNodeWithEdgesAction(node, []);

        this.performAction(action);
    }
    public addNodeWithEdge(latlng: L.LatLngExpression, from: MapMarker) {
        const node = this.createClickableNode(latlng);
        const edge = this.createClickableEdge(from, node);
        const action = new CreateNodeWithEdgesAction(node, [ edge ]);

        this.performAction(action);
    }
    public deleteNode(node: MapMarker) {
        const edges = this.map.getEdgesForNode(node);
        const action = new DeleteNodeWithEdgesAction(node, edges);

        this.performAction(action);
    }



    public addEdge(from: MapMarker, to: MapMarker) {
        const edge = this.createClickableEdge(from, to);
        const action = new CreateEdgeAction(edge);

        this.performAction(action);
    }
    public deleteEdge(edge: MapLine) {
        const action = new DeleteEdgeAction(edge);

        this.performAction(action);
    }



    public get undoLength() { return this.undoStack.length; }
    public get redoLength() { return this.redoStack.length; }

    public undo() {
        const lastAction = this.undoStack.pop();
        if(!lastAction) { return; }

        lastAction.inverse().execute(this.map, this.currentSelection);
        this.redoStack.push(lastAction);
    }
    public redo() {
        const lastRedo = this.redoStack.pop();
        if(!lastRedo) { return; }

        lastRedo.execute(this.map, this.currentSelection);
        this.undoStack.push(lastRedo);
    }



    //////////////////////////////////////////
    // Passthrough Methods for AnnotatedMap //
    //////////////////////////////////////////
    public getMap() { return this.map.getMap(); }
    public mount(container: HTMLElement) {
        this.map.mount(container);
        this.map.getMap()?.on("click", (ev) => {
            const cs = get(this.currentSelection);
            const caps = ev.originalEvent.getModifierState("CapsLock");

            if(ev.originalEvent.shiftKey && cs?.type === "node") {
                // On Shift+click and currently selecting a node, create new node connected to current node.
                this.addNodeWithEdge(ev.latlng, cs.data);
            } else if(ev.originalEvent.ctrlKey || caps) {
                // On Ctrl+click or CapsLock+click, create new node.
                this.addNode(ev.latlng);
            } else {
                // Vanilla click on map, remove current selection.
                this.currentSelection.set(cs?.data.deselect() ?? null);
            }
        });
    }
    public destroy() { this.map.destroy(); }
    public resize() { this.map.resize(); }
    public getGraph() { return this.map.getGraph(); }
}

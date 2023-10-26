import L from "leaflet";
import { v4 as uuid4 } from "uuid";

import { MapLine  , MapMarker  } from "./layers";
import { layerGroup2array } from "./utils";



const initialView: [number, number] = [39.1319066,-84.5148446];



export class AnnotatedMap {
    private map: L.Map | null = null;

    private readonly nodeLayer = L.layerGroup();
    private readonly edgeLayer = L.layerGroup();

    public constructor() {

    }

    public getMap() { return this.map; }
    public getNodes() { return layerGroup2array<MapMarker>(this.nodeLayer); }
    public getEdges() { return layerGroup2array<MapLine>(this.edgeLayer); }
    public getEdgesForNode(node: MapMarker) {
        return layerGroup2array<MapLine>(
            this.edgeLayer,
            (l) => l.edge.fromNodeId === node.node.id || l.edge.toNodeId === node.node.id,
        );
    }



    public createNode(latlng: L.LatLngExpression) {
        const mark = new MapMarker(latlng, { id: uuid4() });

        return mark;
    }
    public createEdge(from: MapMarker, to: MapMarker) {
        const line = new MapLine(from, to);

        return line;
    }

    public addNodeToMap(node: MapMarker) {
        this.nodeLayer.addLayer(node);
    }
    public removeNodeFromMap(node: MapMarker) {
        this.nodeLayer.removeLayer(node);
    }

    public addEdgeToMap(edge: MapLine) {
        this.edgeLayer.addLayer(edge);
    }
    public removeEdgeFromMap(edge: MapLine) {
        this.edgeLayer.removeLayer(edge);
    }



    public mount(container: HTMLElement) {
        this.map = L.map(container, {
            preferCanvas: true,
        }).setView(initialView, 16);

        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
                &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
                subdomains: "abcd",
                maxZoom: 19,
            },
        ).addTo(this.map);

        this.edgeLayer.addTo(this.map);
        this.nodeLayer.addTo(this.map);

        this.map.on("zoomend", () => {
            const zoom = this.map!.getZoom();
            this.nodeLayer.eachLayer((l) => {
                const mark = l as MapMarker;
                mark.updateZoom(zoom);
            });
        });
    }

    public destroy() {
        this.map?.remove();
        this.map = null;
    }

    public resize() {
        this.map?.invalidateSize();
    }



    public getGraph() {
        const markers = layerGroup2array<MapMarker>(this.nodeLayer);
        const edges = layerGroup2array<MapLine>(this.edgeLayer);

        return {
            nodes: markers.map((m) => ({
                ...m.node,
                latlng: m.getLatLng(),
            })),
            edges: edges.map((e) => ({
                ...e.edge,
            })),
        };
    }
}

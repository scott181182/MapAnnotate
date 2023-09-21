<script lang="ts">
import L, { Map as LeafletMap } from 'leaflet';
import "leaflet/dist/leaflet.css";

import { BlueCrossPointIconMap, RedCrossPointIconMap } from '$lib/map';



let map: LeafletMap | null;

const nodeLayer = L.layerGroup();
let selectedNode: L.Marker | null = null;

const edgeLayer = L.layerGroup();
let selectedEdge: L.Polyline | null = null;

const initialView: [number, number] = [39.1319066,-84.5148446];



function createMap(container: HTMLElement) {
    let m = L.map(container, {preferCanvas: true }).setView(initialView, 16);
    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
            &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
            subdomains: 'abcd',
            maxZoom: 19,
        }
    ).addTo(m);

    edgeLayer.addTo(m);
    nodeLayer.addTo(m);

    m.on("zoomend", () => {
        nodeLayer.eachLayer((l) => {
            const mark = l as L.Marker;
            if(mark === selectedNode) {
                mark.setIcon(RedCrossPointIconMap.get(m.getZoom()))
            } else {
                mark.setIcon(BlueCrossPointIconMap.get(m.getZoom()))
            }
        });
    })

    m.on("click", (ev) => {
        if(ev.originalEvent.shiftKey && selectedNode) {
            addNodeEdge(selectedNode.getLatLng(), ev.latlng);
        }
        addNodeMarker(ev.latlng);
    });
    return m;
}

function deselectNodes() {
    const zoom = map?.getZoom() ?? 1;
    if(selectedNode) {
        selectedNode.setIcon(BlueCrossPointIconMap.get(zoom))
    }
    selectedNode = null;
}
function selectNode(mark: L.Marker) {
    deselectNodes();
    deselectEdges();
    const zoom = map?.getZoom() ?? 1;
    selectedNode = mark;
    mark.setIcon(RedCrossPointIconMap.get(zoom));
}
function deselectEdges() {
    const zoom = map?.getZoom() ?? 1;
    if(selectedEdge) {
        selectedEdge.setStyle({ color: "#3a8ece" })
    }
    selectedEdge = null;
}
function selectEdge(line: L.Polyline) {
    deselectNodes();
    deselectEdges();
    selectedEdge = line;
    line.setStyle({ color: "#f00" });
}

function addNodeMarker(latlng: L.LatLngExpression) {
    const mark = L.marker(latlng, {
        icon: RedCrossPointIconMap.get(map?.getZoom() ?? 1)
    });
    mark.on("click", (ev) => {
        if(ev.originalEvent.shiftKey && selectedNode) {
            addNodeEdge(selectedNode.getLatLng(), mark.getLatLng());
        }
        selectNode(mark);
    });
    nodeLayer.addLayer(mark);
    selectNode(mark);
}
function addNodeEdge(from: L.LatLngExpression, to: L.LatLngExpression) {
    const line = L.polyline([ from, to ], {
        color: "#3a8ece"
    });
    line.on("click", () => { selectEdge(line); });
    edgeLayer.addLayer(line);
}

function mapAction(container: HTMLElement) {
    map = createMap(container);

    return {
        destroy: () => {
            map?.remove();
            map = null;
        }
    };
}

function resizeMap() {
    if(map) { map.invalidateSize(); }
}
</script>
<svelte:window on:resize={resizeMap}/>

<style>
#map {
    width: 100%;
    height: 80vh;

    display: flex;
    flex-direction: column;
    align-content: space-around;
}
</style>


<section class="container h-100">
    <div id="map" use:mapAction></div>
</section>

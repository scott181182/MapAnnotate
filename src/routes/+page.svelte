<script lang="ts">
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import { getContext } from "svelte";
import { v4 as uuid4 } from "uuid";

import { download } from "$lib/download";
import { MapActionStack } from "$lib/map/actions";
import { BlueCrossPointIconMap, RedCrossPointIconMap } from "$lib/map/icons";
import type { MapSelection } from "$lib/map/layers";
import { MapLine, MapMarker } from "$lib/map/layers";
import { layerGroup2array } from "$lib/map/utils";
import type { OnSaveContext } from "$lib/save";






let map: L.Map | null;
const initialView: [number, number] = [39.1319066,-84.5148446];

const nodeLayer = L.layerGroup();
const edgeLayer = L.layerGroup();

let currentSelection: MapSelection = null;
const actionStack = new MapActionStack();



function addNodeMarker(latlng: L.LatLngExpression) {
    const mark = new MapMarker(latlng, { id: uuid4() });
    mark.setIcon(RedCrossPointIconMap.get(map?.getZoom() ?? 1));
    mark.on("click", (ev) => {
        if(ev.originalEvent.shiftKey && currentSelection?.type === "node") {
            addNodeEdge(currentSelection.data, mark);
        }
        currentSelection = mark.select(currentSelection);
    });
    nodeLayer.addLayer(mark);
    currentSelection = mark.select(currentSelection);

    actionStack.push("createNode", mark);

    return mark;
}
function addNodeEdge(from: MapMarker, to: MapMarker) {
    const line = new MapLine(from, to);
    line.on("click", () => {
        currentSelection = line.select(currentSelection);
    });
    edgeLayer.addLayer(line);

    actionStack.push("createEdge", line);
}
function deleteSelected() {
    if(!currentSelection) { return; }

    if(currentSelection.type === "edge") {
        actionStack.push("deleteEdge", currentSelection.data);
    } else {
        actionStack.push("deleteNode", currentSelection.data);
    }
    currentSelection = currentSelection.data.delete(nodeLayer, edgeLayer);
}

function onUndo() {
    currentSelection = actionStack.undo(nodeLayer, edgeLayer, currentSelection);
}



function createMap(container: HTMLElement) {
    let m = L.map(container, { preferCanvas: true }).setView(initialView, 16);
    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
            &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
            subdomains: "abcd",
            maxZoom: 19,
        },
    ).addTo(m);

    edgeLayer.addTo(m);
    nodeLayer.addTo(m);

    m.on("zoomend", () => {
        nodeLayer.eachLayer((l) => {
            const mark = l as MapMarker;
            if(currentSelection?.data === mark) {
                mark.setIcon(RedCrossPointIconMap.get(m.getZoom()));
            } else {
                mark.setIcon(BlueCrossPointIconMap.get(m.getZoom()));
            }
        });
    });

    m.on("click", (ev) => {
        const previousMark = currentSelection;
        const newMark = addNodeMarker(ev.latlng);
        if(ev.originalEvent.shiftKey && previousMark?.type === "node") {
            addNodeEdge(previousMark.data, newMark);
        }
    });

    return m;
}



function mapAction(container: HTMLElement) {
    map = createMap(container);

    return {
        destroy: () => {
            map?.remove();
            map = null;
        },
    };
}

function resizeMap() {
    if(map) { map.invalidateSize(); }
}



function exportGraph() {
    const markers = layerGroup2array<MapMarker>(nodeLayer);
    const edges = layerGroup2array<MapLine>(edgeLayer);

    const obj = {
        nodes: markers.map((m) => ({
            ...m.node,
            latlng: m.getLatLng(),
        })),
        edges: edges.map((e) => ({
            ...e.edge,
        })),
    };

    console.log("Downloading graph!");

    download(JSON.stringify(obj, null, 4), "mapData.json", "application/json");
}

const { setOnSave } = getContext<OnSaveContext>("navbar-save");
setOnSave(exportGraph);




$: asideTitle = currentSelection ? _.startCase(currentSelection.type) : "no selection";
</script>
<svelte:window on:resize={resizeMap}/>



<div class="container-fluid h-full">
    <div class="row h-full">
        <aside class="col-3 pt-4 px-0 border-end border-dark border-2 flex flex-col">
            <div class="flex justify-between px-4">
                <h1 class="text-2xl">{asideTitle}</h1>
                <button
                    type="button"
                    class="btn btn-outline-warning"
                    disabled={currentSelection === null}
                    on:click={deleteSelected}
                >
                    <i class="bi-trash"></i>
                </button>
            </div>
            <div class="flex-grow">

            </div>
            <footer class="border-top border-dark border-2 p-2 flex justify-between">
                <h1 class="text-xl">Map Tools</h1>
                <div>
                    <button type="button" class="btn btn-secondary" on:click={onUndo}>
                        <i class="bi-arrow-counterclockwise"></i>
                    </button>
                </div>
            </footer>
        </aside>
        <section class="col-9 p-0">
            <div id="map" class="w-full h-full flex flex-col content-around" use:mapAction></div>
        </section>
    </div>
</div>

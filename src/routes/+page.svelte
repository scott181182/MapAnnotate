<script lang="ts">
import L, { Map as LeafletMap, type LatLngLiteral, type LatLngExpression } from 'leaflet';
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import { v4 as uuid4 } from "uuid";

import { BlueCrossPointIconMap, RedCrossPointIconMap, layerGroup2array } from '$lib/map';



interface MapNodeData {
    id: string;
}
interface MapEdgeData {
    fromNodeId: string;
    toNodeId: string;
}

interface Selectable {
    select(): void;
    deselect(): void;
}

class MapMarker extends L.Marker implements Selectable {
    public constructor(
        latlng: LatLngExpression,
        public readonly node: MapNodeData
    ) {
        super(latlng);
    }

    public select() {
        if(currentSelection) { currentSelection.data.deselect(); }
        const zoom = this._map.getZoom() ?? 1;
        this.setIcon(RedCrossPointIconMap.get(zoom))
        currentSelection = { type: "node", data: this };
    }
    public deselect() {
        const zoom = this._map.getZoom() ?? 1;
        this.setIcon(BlueCrossPointIconMap.get(zoom))
        currentSelection = null;
    }
}
class MapLine extends L.Polyline implements Selectable {
    public static readonly DEFAULT_COLOR = "#3a8ece";
    public static readonly ACTIVE_COLOR = "#f00";

    public readonly edge: MapEdgeData;

    public constructor(
        from: MapMarker,
        to: MapMarker,
    ) {
        super([ from.getLatLng(), to.getLatLng() ], {
            color: MapLine.DEFAULT_COLOR,
            bubblingMouseEvents: false
        });
        this.edge = {
            fromNodeId: from.node.id,
            toNodeId: to.node.id
        };
    }

    public select() {
        if(currentSelection) { currentSelection.data.deselect(); }
        this.setStyle({ color: MapLine.ACTIVE_COLOR });
        currentSelection = { type: "edge", data: this };
    }
    public deselect() {
        this.setStyle({ color: MapLine.DEFAULT_COLOR });
        currentSelection = null;
    }
}



let map: LeafletMap | null;
const initialView: [number, number] = [39.1319066,-84.5148446];

const nodeLayer = L.layerGroup();
const edgeLayer = L.layerGroup();

type CurrentSelection = { type: "node", data: MapMarker } | { type: "edge", data: MapLine };
let currentSelection: CurrentSelection | null = null;



function addNodeMarker(latlng: L.LatLngExpression) {
    const mark = new MapMarker(latlng, { id: uuid4() })
    mark.setIcon(RedCrossPointIconMap.get(map?.getZoom() ?? 1));
    mark.on("click", (ev) => {
        if(ev.originalEvent.shiftKey && currentSelection?.type === "node") {
            addNodeEdge(currentSelection.data, mark);
        }
        mark.select();
    });
    nodeLayer.addLayer(mark);
    mark.select();
    return mark;
}
function addNodeEdge(from: MapMarker, to: MapMarker) {
    console.log("New Edge!");
    const line = new MapLine(from, to);
    line.on("click", () => {
        line.select();
    });
    edgeLayer.addLayer(line);
    console.log(edgeLayer);
}
function deleteSelected() {
    if(!currentSelection) { return; }
    if(currentSelection.type === "edge") {
        edgeLayer.removeLayer(currentSelection.data);
    } else {
        const marker = currentSelection.data;
        const edgesToRemove = layerGroup2array<MapLine>(edgeLayer, (ml) => ml.edge.fromNodeId === marker.node.id || ml.edge.toNodeId === marker.node.id);
        for(const ml of edgesToRemove) {
            edgeLayer.removeLayer(ml);
        }
        nodeLayer.removeLayer(marker);
    }
    currentSelection = null;
}




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
            const mark = l as MapMarker;
            if(currentSelection?.data === mark) {
                mark.setIcon(RedCrossPointIconMap.get(m.getZoom()))
            } else {
                mark.setIcon(BlueCrossPointIconMap.get(m.getZoom()))
            }
        });
    })

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
        }
    };
}

function resizeMap() {
    if(map) { map.invalidateSize(); }
}




$: asideTitle = currentSelection ? _.startCase(currentSelection.type) : "no selection";
</script>
<svelte:window on:resize={resizeMap}/>



<div class="container-fluid h-full">
    <div class="row h-full">
        <aside class="col-3 pt-4">
            <div class="flex justify-between">
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
        </aside>
        <section class="col-9">
            <div id="map" class="w-full h-full flex flex-col content-around" use:mapAction></div>
        </section>
    </div>
</div>

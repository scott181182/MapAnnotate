<script lang="ts">
import "leaflet/dist/leaflet.css";
// eslint-disable-next-line import/no-duplicates
import { getContext } from "svelte";
// eslint-disable-next-line import/no-duplicates
import type { Writable } from "svelte/store";
// eslint-disable-next-line import/no-duplicates
import { writable  } from "svelte/store";

import { download } from "$lib/download";
import { ActionableMap } from "$lib/map/ActionableMap";
import type { MapSelection } from "$lib/map/layers";
import type { OnSaveContext } from "$lib/save";
import MapObjectDetails from "../components/MapObjectDetails.svelte";
import MapTools from "../components/MapTools.svelte";



let currentSelection: Writable<MapSelection> = writable(null);
const map = new ActionableMap(currentSelection);



function onDelete() {
    if(!$currentSelection) { return; }

    if($currentSelection.type === "edge") {
        map.deleteEdge($currentSelection.data);
    } else {
        map.deleteNode($currentSelection.data);
    }
}



function mapAction(container: HTMLElement) {
    map.mount(container);

    return {
        destroy: () => { map.destroy(); },
    };
}
function resizeMap() { map.resize(); }



function exportGraph() {
    const obj = map.getGraph();
    console.log("Downloading graph!");
    download(JSON.stringify(obj, null, 4), "mapData.json", "application/json");
}

const { setOnSave } = getContext<OnSaveContext>("navbar-save");
setOnSave(exportGraph);

</script>
<svelte:window on:resize={resizeMap}/>



<div class="container-fluid h-full">
    <div class="row h-full">
        <aside class="col-3 pt-4 px-0 border-end border-dark border-2 flex flex-col">
            <MapObjectDetails selection={$currentSelection} on:delete={onDelete}/>
            <div class="flex-grow">

            </div>
            <MapTools map={map}/>
        </aside>
        <section class="col-9 p-0">
            <div id="map" class="w-full h-full flex flex-col content-around" use:mapAction></div>
        </section>
    </div>
</div>

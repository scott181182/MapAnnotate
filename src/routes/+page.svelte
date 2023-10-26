<script lang="ts">
import "leaflet/dist/leaflet.css";
import _ from "lodash";
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

function onUndo() {
    map.undo();
}
function onRedo() {
    map.redo();
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




$: asideTitle = $currentSelection ? _.startCase($currentSelection.type) : "no selection";
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
                    on:click={onDelete}
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
                    <button type="button" class="btn btn-secondary" on:click={onRedo}>
                        <i class="bi-arrow-clockwise"></i>
                    </button>
                </div>
            </footer>
        </aside>
        <section class="col-9 p-0">
            <div id="map" class="w-full h-full flex flex-col content-around" use:mapAction></div>
        </section>
    </div>
</div>

<script lang="ts">
import type { ActionableMap } from "$lib/map/ActionableMap";



// eslint-disable-next-line import/no-mutable-exports
export let map: ActionableMap;

let canUndo = false;
let canRedo = false;

map.undoLength.subscribe((length) => canUndo = length > 0);
map.redoLength.subscribe((length) => canRedo = length > 0);

function onUndo() { map.undo(); }
function onRedo() { map.redo(); }
</script>

<footer class="border-top border-dark border-2 p-2 flex justify-between">
    <h1 class="text-xl">Map Tools</h1>
    <div>
        <button type="button" class="btn btn-secondary" on:click={onUndo} disabled={!canUndo}>
            <i class="bi-arrow-counterclockwise"></i>
        </button>
        <button type="button" class="btn btn-secondary" on:click={onRedo} disabled={!canRedo}>
            <i class="bi-arrow-clockwise"></i>
        </button>
    </div>
</footer>

<script lang="ts">
import type { ActionableMap } from "$lib/map/ActionableMap";



// eslint-disable-next-line import/no-mutable-exports
export let map: ActionableMap;

function onUndo() { map.undo(); }
function onRedo() { map.redo(); }
</script>

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

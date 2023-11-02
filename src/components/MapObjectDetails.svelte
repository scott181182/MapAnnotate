<script lang="ts">
import _ from "lodash";
import { createEventDispatcher } from "svelte";

import type { MapSelection } from "$lib/map/layers";



const dispatch = createEventDispatcher();

function onDelete() {
    dispatch("delete", { selection });
}

export let selection: MapSelection;

$: asideTitle = selection ? _.startCase(selection.type) : "no selection";

</script>



<div class="flex justify-between px-4">
    <h1 class="text-2xl">{asideTitle}</h1>
    <button
        type="button"
        class="btn btn-outline-warning"
        disabled={selection === null}
        on:click={onDelete}
    >
        <i class="bi-trash"></i>
    </button>
</div>

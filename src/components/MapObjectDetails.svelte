<script lang="ts">
import _ from "lodash";
import { createEventDispatcher } from "svelte";

import { formatLatLng } from "$lib/latlng";
import type { MapSelection } from "$lib/map/layers";



const dispatch = createEventDispatcher();

function onDelete() {
    dispatch("delete", { selection });
}

export let selection: MapSelection;

$: asideTitle = selection ? _.startCase(selection.type) : "no selection";
$: meta = selection && (selection.type === "node" ? selection.data.node.meta : selection.data.edge.meta);
$: metaEntries = meta ? Object.entries(meta) : [];
</script>


<section class="flex overflow-y-auto flex-col px-4">
    <div class="flex justify-between">
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

    {#if selection}
    <div>
        <dl>
            {#if selection.type === "node"}
            <dt>ID</dt>
            <dd>{selection.data.node.id}</dd>
            <dt>Location</dt>
            <dd>{formatLatLng(selection.data.getLatLng())}</dd>
            {:else}
            <dt>From</dt>
            <dd>{selection.data.edge.fromNodeId}</dd>
            <dt>To</dt>
            <dd>{selection.data.edge.toNodeId}</dd>
            {/if}

            {#each metaEntries as [metaKey, metaValue]}
                <dt>{metaKey}</dt>
                <dd>{metaValue}</dd>
            {/each}
        </dl>
        <div class="form-inline">
            <div class="form-group">
                <input class="form-control" placeholder="New Field"/>
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-secondary btn-sm">
                    <i class="bi-plus"></i>
                </button>
            </div>
        </div>
    </div>
    {/if}
</section>

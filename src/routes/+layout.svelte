<script lang="ts">
import { setContext } from "svelte";
import { writable } from "svelte/store";
import "../app.css";

import type { OnSaveContext, OnSaveFn } from "$lib/save";



const onSave = writable<OnSaveFn | undefined>(undefined);

setContext<OnSaveContext>("navbar-save", {
    setOnSave: (fn: OnSaveFn) => { $onSave = fn; },
});
</script>

<div class="flex flex-col h-screen">
    <header id="page-header" class="navbar navbar-dark bg-dark px-4">
        <span class="navbar-brand mb-0 h1">Map Annotate</span>
        <div>
            <button type="button" class="btn btn-primary" on:click={$onSave}>
                <i class="bi-box-arrow-down"></i>
            </button>
        </div>
    </header>
    <main style="flex-grow: 1">
        <slot></slot>
    </main>
</div>

import type { Layer, LayerGroup } from "leaflet";



export function layerGroup2array<T extends Layer = Layer>(
    layerGroup: LayerGroup,
    filterFn?: (layer: T) => boolean,
): T[] {
    const layers: T[] = [];

    layerGroup.eachLayer((l) => {
        if(filterFn && !filterFn(l as T)) {
            return;
        }

        layers.push(l as T);
    });

    return layers;
}

/* eslint-disable import/no-named-as-default-member */
import type { Layer, LayerGroup } from "leaflet";
import L from "leaflet";



export class MemoMap<K, V> {
    private map = new Map<string, V>();

    public constructor(
        private readonly keyFn: (key: K) => string,
        private readonly generatorFn: (key: K) => V,
    ) {  }

    public get(input: K) {
        const key = this.keyFn(input);

        const initVal = this.map.get(key);
        if(initVal) { return initVal; }

        const val = this.generatorFn(input);
        this.map.set(key, val);

        return val;
    }

    public fetchFn() {
        return this.get.bind(this);
    }
}

function createSizedIcon(zoom: number, url: string) {
    // Quick way to get size from zoom with the following map:
    // 19 -> 24
    // 18 -> 12
    // 17 -> 6
    // _  -> 4
    const size = zoom < 17 ? 4 : (3 << (zoom - 16));

    return L.icon({
        iconUrl: url,
        iconSize: [size, size],
        iconAnchor: [size >> 1, size >> 1],
    });
}



export const BlueCrossPointIconMap = new MemoMap<number, L.Icon>(
    (zoom) => zoom.toString(),
    (zoom) => createSizedIcon(zoom, "crosspoint-blue.png"),
);

export const RedCrossPointIconMap = new MemoMap<number, L.Icon>(
    (zoom) => zoom.toString(),
    (zoom) => createSizedIcon(zoom, "crosspoint-red.png"),
);



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

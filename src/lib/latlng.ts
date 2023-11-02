import type L from "leaflet";



const COORD_DIGITS = 5;

export function formatLatLng(latlng: L.LatLngExpression): string {
    let lat: number;
    let lng: number;

    if(Array.isArray(latlng)) {
        lat = latlng[0];
        lng = latlng[1];
    } else {
        lat = latlng.lat;
        lng = latlng.lng;
    }

    return `(${lat.toFixed(COORD_DIGITS)}, ${lng.toFixed(COORD_DIGITS)})`;
}

import { writable } from "svelte/store";



export class ReactiveStack<T> {
    public readonly length = writable(0);

    private data: T[] = [];



    public push(item: T) {
        const l = this.data.push(item);
        this.length.set(l);
    }
    public pop(): T | undefined {
        const item = this.data.pop();
        this.length.set(this.data.length);

        return item;
    }
    public clear() {
        this.data = [];
        this.length.set(0);
    }
}

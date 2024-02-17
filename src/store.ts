import { writable, get, type Writable } from "svelte/store";
import type Quest from "./_lib/Quest";

export const sessions: Writable<Quest[]> = writable([]);
export const session: Writable<Quest|null> = writable(null);

export const currentTab: Writable<null|string> = writable(null);

export const questsCache: Writable<any> = writable(null);

export const currentTask: Writable<null|number> = writable(null);


// Expose stores to window for debugging
session.subscribe(value => {
    if (value) {
        // @ts-ignore
        window.session = value;
    }
});
sessions.subscribe(value => {
    if (value) {
        // @ts-ignore
        window.sessions = value;
    }
});
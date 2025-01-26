import { writable, type Writable } from "svelte/store";
import type Quest from "./_lib/Quest";
import { type FileData as PTD } from "./_lib/files/PTD/extract";
import type { Em } from "./_lib/types/EnemySet";
import type { Script } from "./_lib/types/TalkScript";

export const sessions: Writable<Quest[]> = writable([]);
export const session: Writable<Quest|"text"|null> = writable(null);

export const currentTab: Writable<null|string> = writable(null);
export const showAreasOnMap: Writable<boolean> = writable(true);

export const questsCache: Writable<any> = writable(null);
export const textCache: Writable<null|PTD> = writable(null);

export const currentEm: Writable<null|Em> = writable(null);
export const currentTask: Writable<null|number> = writable(null);
export const currentTalkScript: Writable<null|Script> = writable(null);


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
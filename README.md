# [ac-quest-editor](https://cabalex.github.io/ac-quest-editor)

A rewrite of my previous [Astral Chain Quest Editor](https://cabalex.github.io/astral-extractor/quest-editor.html), built for ease-of-use and stability.

## Scripting

The active quest editor is exposed in `session`, and all sessions are stored in `sessions`. You also have these functions exposed in the `window`:

- `lookupHash(hash: string)` - Look up a quest hash (i.e. a flag's name).
- window.lookup = lookup;
  window.questAreaLookup = questAreaLookup;
  window.itemLookup = itemLookup;
  window.questLookup = questLookup;
  window.questUnlookup = questUnlookup;
  window.questType = questType;

<script lang="ts">
    import Blockly from 'blockly/core';
    import En from 'blockly/msg/en';
    import 'blockly/blocks';
    import 'blockly/javascript';
    import {Multiselect, MultiselectBlockDragger} from '@mit-app-inventor/blockly-plugin-workspace-multiselect';

    import BlocklyComponent, { type Locale } from './Blockly.svelte';
    import { currentTask, session } from "../store";
    import { onDestroy, onMount } from "svelte";
    import { fly } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import { blockIds, systemBlocks, ifBlocks, execBlocks, toolbox } from './blocks';
    import { Command, TaskList } from '../_lib/types/QuestData';
    import theme from './theme';

    let workspace: Blockly.WorkspaceSvg;
  
    const en: Locale = {
      rtl: false,
      msg: {
        ...En
      },
    };

    function saveTaskList() {
        let dom = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());

        if (dom.querySelector(':scope > block[type="unknown-if"]') || dom.querySelector(':scope > block[type="unknown-exec"]')) {
            alert("There are unknown blocks in the task list. Please remove them before saving.");
            return;
        }

        function parseCommands(elem: Element): Command[] {
            /*
            typeEXEC 1 means that the execution continues inside the IF block, while any other typeEXEC means that only that one is in  
            */
            let typeIF = 0;
            let typeEXEC = 0;
            let IFArgs: {[key: string]: string} = {};
            let EXECArgs: {[key: string]: string} = {};
            let commands = []
            if (elem.getAttribute('type')?.startsWith("if-")) {
                typeIF = parseInt(elem.getAttribute('type')?.split("-")[1] || "0");
            } else {
                typeEXEC = parseInt(elem.getAttribute('type')?.split("-")[1] || "0");
            }

            // parse fields of the block
            for (let field of elem.querySelectorAll(":scope > field")) {
                let name = field.getAttribute('name');
                let value = field.textContent;
                if (name === null || value === null) {
                    continue;
                }

                if (typeIF !== 0) {
                    let inputField = ifBlocks.find(b => b.type === `if-${typeIF}`)?.args0.find((f: any) => f.name === name);
                    if (inputField?.type === "field_input" || name?.includes("Hash")) {
                        value = parseInt(value || "0", 16).toString();
                    }
                    IFArgs[name] = value?.toString();
                } else {
                    let inputField = execBlocks.find(b => b.type === `exec-${typeEXEC}`)?.args0.find((f: any) => f.name === name);
                    if (inputField?.type === "field_input" || name?.includes("Hash")) {
                        value = parseInt(value || "0", 16).toString();
                    }
                    EXECArgs[name] = value?.toString();
                }
            }

            // check the next statement in the chain
            if (elem.querySelector(':scope > statement[name="execarea"]') && typeIF !== 0) {
                // If an exec area exists, it's a "connecting" IF statement
                let execArea = elem.querySelector(':scope > statement[name="execarea"]');
                let nextBlock = execArea?.querySelector(':scope > block');
                
                
                // always a "connector" statement
                if (!nextBlock) {
                    // If no elements inside, maintain EXEC 0
                    
                } else if (nextBlock?.querySelector(":scope > next > *") || nextBlock?.getAttribute("type")?.toLowerCase().startsWith('if')) {
                    // check to see if there is more than one statement in the block; if so, use EXEC 1 (connector)
                    // also happens if there's layered IF statements
                    typeEXEC = 1;
                    commands.push(...parseCommands(nextBlock))
                } else if (nextBlock) {
                    // else, use the next EXEC
                    typeEXEC = parseInt(nextBlock.getAttribute('type')?.split("-")[1] || "0");

                    // parse fields of the block
                    for (let field of nextBlock.querySelectorAll(":scope > field")) {
                        let name = field.getAttribute('name');
                        let value = field.textContent;
                        /*if (questShouldHex(field.getAttribute('name'))) {
                            fieldvalue = parseInt(fieldvalue, 16);
                        }*/
                        if (name === null || value === null) {
                            continue;
                        }

                        EXECArgs[name] = value.toString();
                    }
                }
            }

            // recursive if another block after exec or normal block
            let nextBlock = elem.querySelector(':scope > next > block');
            if (nextBlock) {
                if (typeIF !== 0 && typeEXEC === 1) {
                    // If it's not a single exec (self closing), add 0,0 to close it
                    typeEXEC = 1,
                    commands.push(new Command(0, {}, 0, {}));
                }
                commands.push(...parseCommands(nextBlock));
            }

            if (typeIF !== 0 && typeEXEC === 0) {
                // If there is no EXEC block, add a dummy one
                typeEXEC = 1,
                commands.unshift(new Command(0, {}, 0, {}));
            }
            
            return [new Command(typeIF, IFArgs, typeEXEC, EXECArgs), ...commands]
        }

        // Iterate over all TaskList header blocks
        let lineLists = [];
        for (let task of dom.querySelectorAll(':scope > block[type="task-start"]')) {
            let taskNo = parseInt(task.querySelector(':scope > field[name="taskno"]')?.textContent || "100");

            let nextBlock = task.querySelector(':scope > next')?.querySelector(':scope > block');
            if (nextBlock) {
                lineLists[taskNo] = parseCommands(nextBlock);
            } else {
                // there is nothing else here, so 0 it out
                lineLists[taskNo] = [new Command(0, {}, 0, {})];
            }
        }

        return lineLists;
    }

    // SCRIPTS
    let workspaceCache = ""
    function renderTaskList(taskList: TaskList, saveExisting=true) {
        if (saveExisting && Blockly.Xml.workspaceToDom(workspace).outerHTML !== workspaceCache) {
            saveTaskList();
        }
        // sorta inefficient and lazy method but its whatever
        let xml = '<xml>'
        
        for (let x = 0; x < taskList.lineLists.length; x++) {
            // TaskList
            xml += `<block type="task-start" inline="false" y="${x*200}"><field name="taskno">${x}</field>`
            let nested: string[] = []
            if (!taskList.lineLists[x]) {
                xml += "</block>";
                break;
            }
            for (let y = 0; y < taskList.lineLists[x].length; y++) {
                // Individual Command
                let command = taskList.lineLists[x][y];

                if (command.typeIF === 0 && command.typeEXEC === 0) {
                    // pop off the if statement, if possible
                    while (nested.includes("statement")) {
                            xml += `</${nested.pop()}>`
                    }
                    continue
                }
                
                if (!xml.endsWith('<statement name="execarea">')) {
                    xml += "<next>"
                    nested.push('next')
                }
                //taskListOutput += "<tr><th>" + taskList.LineListTree[x][y].prettyPrint().join("</th><th>").trimRight("<th>") + "</tr>";
                /*
                A NON-ZERO IF MUST ALSO HAVE AN ACCOMPANYING EXEC 1.
                */
                if (Object.keys(blockIds).includes("if-" + command.typeIF)) {
                    // Known IF
                    xml += `<block type="if-${command.typeIF}">`
                    for (let [key, value] of Object.entries(command.IFArgs)) {
                        // remember some don't have IFs at the beginning..?
                        let inputField = ifBlocks.find(b => b.type === `if-${command.typeIF}`)?.args0.find((f: any) => f.name === key);
                        if (inputField?.type === "field_input" || key.includes("Hash")) {
                            value = parseInt(value).toString(16);
                        }
                        xml += `<field name="${key}">${value}</field>`;
                    }
                    xml += '<statement name="execarea">'
                    nested.push('block', 'statement')
                } else if (command.typeIF) {
                    // Unknown IF
                    console.warn(`Unknown IF: ${command.typeIF}`, command);
                    xml += `<block type="unknown-if"><field name="typeIF">${command.typeIF}</field><statement name="execarea">`
                    nested.push('block', 'statement')
                }

                if (Object.keys(blockIds).includes("exec-" + command.typeEXEC)) {
                    xml += `<block type="exec-${command.typeEXEC}">`
                    for (let [key, value] of Object.entries(command.EXECArgs)) {
                        let inputField = execBlocks.find(b => b?.type === `exec-${command.typeEXEC}`)?.args0.find((f: any) => f.name === key);
                        if (inputField?.type === "field_input" || key.includes("Hash")) {
                            value = parseInt(value).toString(16);
                        }
                        xml += `<field name="${key}">${value}</field>`;
                    }
                    nested.push('block')
                } else if (command.typeEXEC > 1) {
                    console.warn(`Unknown EXEC: ${command.typeEXEC}`, command)
                    xml += `<block inline="false" type="unknown-exec"><field name="typeEXEC">${command.typeEXEC}</field>`
                    nested.push('block')
                }
                if (command.typeIF && command.typeEXEC != 1) {
                    nested.splice(nested.length-2, 2);
                    xml += "</block></statement>";
                }
            }
            xml += nested.map(item => `</${item}>`).reverse().join("")
            xml += "</block>"
        }
        xml += "</xml>"

        Blockly.Events.disable();
        Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.utils.xml.textToDom(xml), workspace);
        workspace.cleanUp();
        workspace.clearUndo();
        Blockly.Events.enable();
        workspaceCache = Blockly.Xml.workspaceToDom(workspace).outerHTML;
    }

    const config = {
        theme,
        toolbox,
        plugins: {
            'blockDragger': MultiselectBlockDragger
        },
        zoom: { controls: true, wheel: true },
        move: { drag: true, wheel: true },
        useDoubleClick: false,
        // Bump neighbours after dragging to avoid overlapping.
        bumpNeighbours: false,

        // Keep the fields of multiple selected same-type blocks with the same value
        multiFieldUpdate: true,

        // Use custom icon for the multi select controls.
        multiselectIcon: {
            hideIcon: false,
            weight: 3,
            enabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/select.svg',
            disabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/unselect.svg',
        },

        multiselectCopyPaste: {
            // Enable the copy/paste accross tabs feature (true by default).
            crossTab: true,
            // Show the copy/paste menu entries (true by default).
            menu: true,
        },
    }

    let timeout: number = 0;
    let saved = "";
    function onChange() {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            let saved = saveTaskList();
            if (saved && $session && $currentTask !== null && $session.questData.tasks[$currentTask])
                $session.questData.tasks[$currentTask].lineLists = saved;
        }, 1000);
        return;

        // sanity check between it and original
        let comparing = $session?.questData.tasks[$currentTask as number].lineLists;

        if (JSON.stringify(saved) !== JSON.stringify(comparing)) {
            console.log("Changes detected. (original, generated)", `${JSON.stringify(saved)}\n\n${JSON.stringify(comparing)}`);
        }
        
        return;
    }

    onMount(() => {
        // delete all blocks to prevent warn spam
        const blocks = [...systemBlocks, ...ifBlocks, ...execBlocks];
        for (let block of blocks) {
            delete Blockly.Blocks[block.type]
        }
        Blockly.defineBlocksWithJsonArray(blocks);

        // initialize plugins
        const multiselectPlugin = new Multiselect(workspace);
        multiselectPlugin.init(config);
        render();
    })

    let lastTaskRendered = -1;
    const render = () => {
        if ($session !== null && $currentTask !== null && $session.questData.tasks[$currentTask] && workspace) {
            if (lastTaskRendered !== -1) saveTaskList();
            renderTaskList($session.questData.tasks[$currentTask], false);
            lastTaskRendered = $currentTask;
        }
    }

    onDestroy(() => {
        let saved = saveTaskList();
            if (saved && $session && $currentTask !== null && $session.questData.tasks[$currentTask])
                $session.questData.tasks[$currentTask].lineLists = saved;
    })

    $: if ($currentTask !== null) render();
</script>

<div class="taskEditor" transition:fly|global={{duration: 200, x: 200, easing: cubicInOut}}>
    <BlocklyComponent
        config={config}
        locale={en}
        bind:workspace
        on:change={onChange}
    />
</div>
  
<style>
    .taskEditor {
        position: fixed;
        right: 0;
        top: 0;
        height: 100%;
        z-index: 5;
        width: calc(100% - 806px);
    }
</style>
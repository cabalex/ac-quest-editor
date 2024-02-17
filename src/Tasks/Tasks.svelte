<script lang="ts">
    import Blockly from 'blockly/core';
    import En from 'blockly/msg/en';
    import 'blockly/blocks';
    import 'blockly/javascript';
    import BlocklyComponent, { type Locale } from './Blockly.svelte';
    import { currentTask, session } from "../store";
    import { onMount } from "svelte";
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

        console.log("saving", dom)

        if (dom.querySelector('block[type="unknown-if"]') || dom.querySelector('block[type="unknown-exec"]')) {
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
            if (elem.attributes.getNamedItem('type')?.name.startsWith("if-")) {
                typeIF = parseInt(elem.getAttribute('type')?.split("-")[1] || "0");
            } else {
                typeEXEC = parseInt(elem.getAttribute('type')?.split("-")[1] || "0");
            }

            // parse fields of the block
            for (let field of elem.querySelectorAll("field")) {
                let name = field.getAttribute('name');
                let value = field.textContent;
                /*if (questShouldHex(field.getAttribute('name'))) {
                    fieldvalue = parseInt(fieldvalue, 16);
                }*/
                if (name === null || value === null) {
                    continue;
                }

                if (typeIF !== 0) {
                    IFArgs[name] = value.toString();
                } else {
                    EXECArgs[name] = value.toString();
                }
            }

            // check the next statement in the chain
            if (elem.querySelector('statement[name="execarea"]') && typeIF !== 0) {
                // If an exec area exists, it's a "connecting" IF statement
                let execArea = elem.querySelector('statement[name="execarea"]');
                let nextBlock = execArea?.querySelector('block');
                
                
                // always a "connector" statement
                if (!execArea?.querySelector("block")) {
                    // If no elements inside, maintain EXEC 0
                    
                } else if (nextBlock?.querySelector("next") || nextBlock?.getAttribute("type")?.toLowerCase().startsWith('if')) {
                    // check to see if there is more than one statement in the block; if so, use EXEC 1 (connector)
                    // also happens if there's layered IF statements
                    typeEXEC = 1;
                    commands.push(...parseCommands(nextBlock))
                } else if (nextBlock) {
                    // else, use the next EXEC
                    typeEXEC = parseInt(nextBlock.getAttribute('type')?.split("-")[1] || "0");

                    // parse fields of the block
                    for (let field of nextBlock.querySelectorAll("field")) {
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
            let nextBlock = elem.querySelector('next')?.querySelector("block");
            if (nextBlock) commands.push(...parseCommands(nextBlock))
            
            return [new Command(typeIF, IFArgs, typeEXEC, EXECArgs), ...commands]
        }

        // Iterate over all TaskList header blocks
        let lineLists = [];
        for (let task of dom.querySelectorAll('block[type="task-start"]')) {
            let taskNo = parseInt(task.querySelector('field[name="taskno"]')?.textContent || "100");

            let nextBlock = task.querySelector('next')?.querySelector('block');
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
    var workspaceCache = ""
    function renderTaskList(taskList: TaskList, saveExisting=true) {
        if (saveExisting && Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()).outerHTML != workspaceCache) {
            saveTaskList();
        }
        // sorta inefficient and lazy method but its whatever
        let xml = '<xml>'
        
        for (let x = 0; x < taskList.lineLists.length; x++) {
            // TaskList
            xml += `<block type="task-start" inline="false" y="${x*200}"><field name="taskno">${x}</field>`
            let nested = []
            for (let y = 0; y < taskList.lineLists[x].length; y++) {
                // Individual Command
                let command = taskList.lineLists[x][y];
                
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
                    for (const [key, value] of Object.entries(command.IFArgs)) {
                        if (command.typeEXEC < 2 && !key.toLowerCase().startsWith('if')) {
                            xml += `<field name="IF${key}">${value}</field>`;
                        } else {
                            xml += `<field name="${key}">${value}</field>`;
                        }
                    }
                    xml += '<statement name="execarea">'
                    nested.push('block', 'statement')
                } else if (command.typeIF) {
                    // Unknown IF
                    console.log(`Unknown IF: ${command.typeIF}`, command);
                    xml += `<block type="unknown-if"><field name="typeIF">${command.typeIF}</field><statement name="execarea">`
                    nested.push('block', 'statement')
                }

                if (Object.keys(blockIds).includes("exec-" + command.typeEXEC)) {
                    xml += `<block type="exec-${command.typeEXEC}">`
                    for (const [key, value] of Object.entries(command.EXECArgs)) {
                        xml += `<field name="${key}">${value}</field>`;
                    }
                    nested.push('block')
                } else if (command.typeEXEC > 1) {
                    console.log(`Unknown EXEC: ${command.typeEXEC}`, command)
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
        Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.utils.xml.textToDom(xml), workspace);
        workspace.cleanUp();
        workspace.clearUndo();
        workspace.trashcan?.emptyContents();
        workspaceCache = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()).outerHTML;
    }
  
  
    function onChange() {
        
    }

    onMount(() => {
        Blockly.defineBlocksWithJsonArray([...systemBlocks, ...ifBlocks, ...execBlocks]);
    })

    $: if ($session !== null && $currentTask !== null && $session.questData.tasks[$currentTask] && workspace) renderTaskList($session.questData.tasks[$currentTask], false);
</script>

<div translate="yes" class="taskEditor" transition:fly={{duration: 200, x: 200, easing: cubicInOut}}>
    <BlocklyComponent
        config={{theme, toolbox, zoom: { controls: true, wheel: true }, move: { drag: true, wheel: true }}}
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
        width: calc(100% - 797px);
    }
</style>
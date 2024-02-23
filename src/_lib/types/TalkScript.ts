import type { FileData, Node } from "../files/BXM/extract";

export default class TalkScript {
    scripts: Script[];

    constructor(scripts: Script[]) {
        this.scripts = scripts;
    }

    // Imports multiple BXM files and combines them into a single TalkScript class instance.
    // Since TalkScript_XXXX.bxm and TalkScript_speech.bxm are the same format, just
    // the "speech" version only has trigger type 2 (above the NPCs' heads), we can
    // consolidate them to be intuitive.
    static fromNodes(bxms: FileData[]) {
        // BXM file
        let scripts = [];
        for (let bxm of bxms) {
            if (bxm.data.children.length > 0 && bxm.data.children[0].name === "Info") {
                scripts.push(...bxm.data.children.map(x => Script.fromNode(x)));
            } else if (bxm.data.children.length > 0 && bxm.data.children[0].name === "StateInfo") {
                // When there is only one Info script, it just becomes the whole XML file???
                // WTF platinum??? THIS IS ONLY IN Q3430 FILE 04 OFFICER RESCUE????
                // WHERE DO I GET THE REST OF THE INFO NOW???
                scripts.push(new Script(
                    "0",
                    0,
                    "qffff",
                    0,
                    bxm.data.children.map(x => StateInfo.fromNode(x))
                ));
            }
        }
        return new TalkScript(scripts.sort((a, b) => a.triggerType - b.triggerType));
    }

    // Returns two files, the first being TalkScript and the second being TalkScript_speech.
    repack(): [{data: Node, encoding: "UTF-8"}, {data: Node, encoding: "UTF-8"}|undefined] {
        // Sort scripts out into two separate files.
        const node = {
            name: "Root",
            attributes: {},
            value: "",
            children: this.scripts.filter(x => x.triggerType !== 2).map(x => x.repack())
        }
        const speechNode = {
            name: "Root",
            attributes: {},
            value: "",
            children: this.scripts.filter(x => x.triggerType === 2).map(x => x.repack())
        }
        return [
            {data: node, encoding: "UTF-8"},
            {data: speechNode, encoding: "UTF-8"}
        ];
    }

    // TODO: implement
}


export class Script {
    objId: string;
    setType: number;
    questId: string;
    triggerType: number;
    stateInfos: StateInfo[];

    constructor(objId: string, setType: number, questId?: string, triggerType?: number, stateInfos?: StateInfo[])   {
        this.objId = objId;
        this.setType = setType;
        this.questId = questId || "qffff";
        this.triggerType = triggerType || 0;
        this.stateInfos = stateInfos || [];
    }

    static fromNode(node: Node) {
        let objId = node.children[0].value;
        let setType = parseInt(node.children[1].value);
        let questId = node.children[2].value;
        let triggerType = parseInt(node.children[3].value);
        
        let stateInfos = [];
        for (let i = 4; i < node.children.length; i++) {
            stateInfos.push(StateInfo.fromNode(node.children[i]));
        }
        return new Script(objId, setType, questId, triggerType, stateInfos);
    }

    repack() {
        const node: Node = {
            name: "Info",
            attributes: {},
            value: "",
            children: [
                { name: "ObjId", attributes: {}, children: [], value: this.objId },
                { name: "SetType", attributes: {}, children: [], value: this.setType.toString() },
                { name: "QuestId", attributes: {}, children: [], value: this.questId },
                { name: "TriggerType", attributes: {}, children: [], value: this.triggerType.toString() },
                ...(this.stateInfos.map(x => x.repack()))
            ]
        }

        return node;
    }
}

export class StateInfo {
    triggers: string[];
    no: string;
    priority: number;
    commands: StateCommand[];

    constructor(triggers: string[], no: string, priority: number, commands: StateCommand[]) {
        this.triggers = triggers;
        this.no = no;
        this.priority = priority;
        this.commands = commands;
    }

    static fromNode(node: Node) {
        let triggers = node.children[0].children.map(x => x.value);
        let no = node.children[1].value;
        let priority = parseInt(node.children[2].value);
        let commands = [];
        let lastCommandType = 0;
        for (let i = 3; i < node.children.length; i++) {
            let command = StateCommand.fromNode(node.children[i]);
            
            // command type -1 is used as a short hand for "repeat last command".
            // this expands them out so it can be properly edited.
            if (command.type === -1) {
                command.type = lastCommandType;
            } else {
                lastCommandType = command.type;
            }

            commands.push(command);
        }
        return new StateInfo(triggers, no, priority, commands);
    }

    repack() {
        const triggers = {
            name: "Trigger",
            attributes: {},
            value: "",
            children: this.triggers.map(x => {
                return {
                    name: "Conditions",
                    attributes: {},
                    value: x,
                    children: []
                }
            })
        }

        const commands = this.commands.map(x => x.repack());

        // puts it back into short-hand -1s.
        let lastCommandType = "-1";
        for (let i = 0; i < commands.length; i++) {
            if (commands[i].children[0].value === lastCommandType) {
                commands[i].children[0].value = "-1";
            } else {
                lastCommandType = commands[i].children[0].value;
            }
        }

        const node = {
            name: "StateInfo",
            attributes: {},
            value: "",
            children: [
                triggers,
                { name: "No", attributes: {}, value: this.no, children: [] },
                { name: "Priority", attributes: {}, value: this.priority.toString(), children: [] },
                ...commands
            ]
        }

        return node;
    }
}

export class StateCommand {
    type: number;
    args: [string, string, string];
    message: string;

    constructor(command: number, args?: [string, string, string], message?: string) {
        this.type = command;
        this.args = args || ["", "", ""];
        this.message = message || "";
    }

    static fromNode(node: Node) {
        let command = parseInt(node.children[0].value);
        let args: [string, string, string] = [
            node.children[1].value,
            node.children[2].value,
            node.children[3].value
        ];
        let message = node.children[4].value;
        return new StateCommand(command, args, message);
    }

    repack() {
        const node = {
            name: "CommandInfo",
            attributes: {},
            value: "",
            children: [
                { name: "Command", attributes: {}, value: this.type.toString(), children: [] },
                { name: "Param1", attributes: {}, value: this.args[0], children: [] },
                { name: "Param2", attributes: {}, value: this.args[1], children: [] },
                { name: "Param3", attributes: {}, value: this.args[2], children: [] },
                { name: "Message", attributes: {}, value: this.message, children: [] }
            ]
        }
        
        return node;
    }
}
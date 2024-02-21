import type { FileData, Node } from "../files/BXM/extract";
import Vector from "../Vector";

export default class QuestData {
    version: number;
    tasks: TaskList[];

    sub: {
        SetMainScenarioValueStr: string;
        MinLevel: number;
        MaxLevel: number;
        bSetPlStartPos: boolean;
        PlStartPos: Vector;
        PlStartRotY: number;
        bSetMainScenario: boolean;
    }

    questFlags: string[];
    saveFlags: string[];
    areas: AreaGroup[];

    constructor(bxm: FileData) {
        // BXM file
        this.version = parseInt(bxm.data.children[0].value);
        this.tasks = bxm.data.children[1].children.map(node => TaskList.fromNode(node));
        this.sub = {
            SetMainScenarioValueStr: bxm.data.children[2].attributes["SetMainScenarioValueStr"],
            MinLevel: parseInt(bxm.data.children[2].children[0].value),
            MaxLevel: parseInt(bxm.data.children[2].children[1].value),
            bSetPlStartPos: bxm.data.children[2].children[2].value == "1",
            PlStartPos: new Vector(bxm.data.children[2].children[3].value),
            PlStartRotY: Number(bxm.data.children[2].children[4].value),
            bSetMainScenario: bxm.data.children[2].children[5].value == "1"
        }

        this.questFlags = bxm.data.children[3].children.map(node => node.attributes["QuestFlagName"]);
        this.saveFlags = bxm.data.children[4].children.map(node => node.attributes["SaveFlagName"]);
        this.areas = bxm.data.children[5].children.map(node => AreaGroup.fromNode(node));
    }

    repack(): FileData {
        const node = {
            name: "QuestRoot",
            attributes: {},
            value: "",
            children: [
                {
                    name: "Version",
                    attributes: {},
                    value: this.version.toString(),
                    children: []
                },
                {
                    name: "QuestData",
                    attributes: {},
                    value: "",
                    children: this.tasks.map((task) => task.repack())
                },
                {
                    name: "QuestSub",
                    attributes: {
                        SetMainScenarioValueStr: this.sub.SetMainScenarioValueStr
                    } as { [key: string]: string },
                    value: "",
                    children: [
                        {
                            name: "MinLevel",
                            attributes: {},
                            value: this.sub.MinLevel.toString(),
                            children: []
                        },
                        {
                            name: "MaxLevel",
                            attributes: {},
                            value: this.sub.MaxLevel.toString(),
                            children: []
                        },
                        {
                            name: "bSetPlStartPos",
                            attributes: {},
                            value: this.sub.bSetPlStartPos ? "1" : "0",
                            children: []
                        },
                        {
                            name: "PlStartPos",
                            attributes: {},
                            value: this.sub.PlStartPos.repack(),
                            children: []
                        },
                        {
                            name: "PlStartRotY",
                            attributes: {},
                            value: this.sub.PlStartRotY.toFixed(6),
                            children: []
                        },
                        {
                            name: "bSetMainScenario",
                            attributes: {},
                            value: this.sub.bSetMainScenario.toString(),
                            children: []
                        }
                    ]
                },
                {
                    name: "QuestFlagNameList",
                    attributes: {},
                    value: "",
                    children: this.questFlags.map((flag) => {
                        return {
                            name: "Name",
                            attributes: {
                                "QuestFlagName": flag
                            },
                            value: "",
                            children: []
                        }
                    })
                },
                {
                    name: "SaveFlagNameList",
                    attributes: {},
                    value: "",
                    children: this.saveFlags.map((flag) => {
                        return {
                            name: "Name",
                            attributes: {
                                "SaveFlagName": flag
                            },
                            value: "",
                            children: []
                        }
                    })
                },
                {
                    name: "AreaList",
                    attributes: {},
                    value: "",
                    children: this.areas.map((area) => area.repack())
                }
            ]
        }

        return { data: node, encoding: "UTF-8" }
    }
}

export class TaskList {
    name: string;
    templateName: string;
    enabled: boolean;
    workInAdvance: boolean;
    TaskColor: number;

    lineLists: Command[][];

    constructor(name: string, templateName: string, enabled: boolean, workInAdvance: boolean, taskColor: number, lineLists: Command[][]) {
        this.name = name;
        this.templateName = templateName;
        this.enabled = enabled;
        this.workInAdvance = workInAdvance;
        this.TaskColor = taskColor;
        this.lineLists = lineLists;
    }

    static fromNode(node: Node) {
        return new TaskList(
            node.attributes["TaskName"],
            node.attributes["TemplateName"],
            node.children.find(x => x.name == "TaskEnable")?.value == "1" || false,
            node.children.find(x => x.name == "WorkInAdvance")?.value == "1" || false,
            parseInt(node.children.find(x => x.name == "TaskColor")?.value || "0"),
            node.children.find(x => x.name == "LineListTree")?.children.map((child: Node) => child.children.map(commandList => Command.fromNode(commandList))) || []
        )
    }

    repack() {
        const node: Node = {
            name: "TaskList",
            attributes: {
                TaskName: this.name,
                TemplateName: this.templateName
            },
            value: "",
            children: [
                {
                    name: "TaskEnable",
                    attributes: {},
                    value: this.enabled ? "1" : "0",
                    children: []
                },
                {
                    name: "WorkInAdvance",
                    attributes: {},
                    value: this.workInAdvance ? "1" : "0",
                    children: []
                },
                {
                    name: "TaskColor",
                    attributes: {},
                    value: this.TaskColor.toString(),
                    children: []
                },
                {
                    name: "LineListTree",
                    attributes: {},
                    value: "",
                    children: this.lineLists.map((lineList) => {
                        return {
                            name: "LineList",
                            attributes: {},
                            value: "",
                            children: lineList.map((command: Command) => command.repack())
                        }
                    })
                }
            ]
        }

        return node;
    }
}

export class Command {
    typeIF = 0;
    IFArgs: { [key: string]: string } = {};
    typeEXEC = 0;
    EXECArgs: { [key: string]: string } = {};

    constructor(typeIF: number, IFArgs: { [key: string]: string }, typeEXEC: number, EXECArgs: { [key: string]: string }) {
        this.typeIF = typeIF;
        this.IFArgs = IFArgs;
        this.typeEXEC = typeEXEC;
        this.EXECArgs = EXECArgs;
    }

    static fromNode(node: Node) {
        let mode = "if";
        let typeIF = 0;
        let typeEXEC = 0;
        const IFArgs: { [key: string]: string } = {};
        const EXECArgs: { [key: string]: string } = {};
        for (const child of node.children) {
            if (child.name == "typeIF") {
                typeIF = parseInt(child.value);
                mode = "if";
            } else if (child.name == "typeEXEC") {
                typeEXEC = parseInt(child.value);
                mode = "exec";
            } else {
                if (mode == "if") {
                    IFArgs[child.name] = child.value;
                } else {
                    EXECArgs[child.name] = child.value;
                }
            }
        }
        const command = new Command(typeIF, IFArgs, typeEXEC, EXECArgs);

        return command;
    }

    repack() {
        const node: Node = {
            name: "CommandList",
            attributes: {},
            value: "",
            children: [
                {
                    name: "typeIF",
                    attributes: {},
                    value: this.typeIF.toString(),
                    children: []
                },
                ...Object.keys(this.IFArgs).map((key) => { return { name: key, attributes: {}, value: this.IFArgs[key], children: [] } }),
                {
                    name: "typeEXEC",
                    attributes: {},
                    value: this.typeEXEC.toString(),
                    children: []
                },
                ...Object.keys(this.EXECArgs).map((key) => { return { name: key, attributes: {}, value: this.EXECArgs[key], children: [] } }),
            ]
        }

        return node;
    }
}

export class AreaGroup {
    index: number;
    name: string;
    debugDisplay: boolean;
    groups: Area[];
    
    constructor(name: string, index: number, debugDisplay: boolean, groups: Area[]) {
        this.index = index;
        this.name = name;
        this.debugDisplay = debugDisplay;
        this.groups = groups;
    }

    static fromNode(node: Node) {
        return new AreaGroup(
            node.attributes["GroupName"],
            parseInt(node.attributes["GroupIndex"]),
            node.attributes["GroupDebugDisp"] == "1",
            node.children.map((child: Node) => Area.fromNode(child))
        )
    }

    repack() {
        const node: Node = {
            name: "GroupList",
            attributes: {
                GroupIndex: this.index.toString(),
                GroupName: this.name,
                GroupDebugDisp: this.debugDisplay ? "1" : "0"
            },
            value: "",
            children: this.groups.map((group: Area) => group.repack())
        }

        return node;
    }
}

export class Area {
    index: number;
    type: number;
    center: Vector;
    points: [Vector, Vector, Vector, Vector];
    radius: number;
    height: number;
    debugDisplay: boolean;

    constructor(index: number, type: number, options?: {
        center?: Vector,
        points?: [Vector, Vector, Vector, Vector],
        radius?: number,
        height?: number,
        debugDisplay?: boolean
    }) {
        this.index = index;
        this.type = type;
        this.center = options?.center || new Vector();
        this.points = options?.points || [new Vector(), new Vector(), new Vector(), new Vector()];
        this.radius = options?.radius || 0;
        this.height = options?.height || 0;
        this.debugDisplay = options?.debugDisplay || false;
    }

    static fromNode(node: Node) {
        let index = parseInt(node.children[0].value);
        let type = parseInt(node.children[1].value);
        let options = {
            center: new Vector(),
            points: [new Vector(), new Vector(), new Vector(), new Vector()] as [Vector, Vector, Vector, Vector],
            radius: 0,
            height: 0,
            debugDisplay: false
        }
        switch (type) {
            case 1:
                options.center = new Vector(node.children[2].value);
                options.points = [
                    new Vector(node.children[3].value),
                    new Vector(node.children[4].value),
                    new Vector(node.children[5].value),
                    new Vector(node.children[6].value)
                ];
                options.height = parseFloat(node.children[7].value);
                options.debugDisplay = node.children[8].value == "1";
                break;
            case 2:
                options.center = new Vector(node.children[2].value);
                options.height = parseFloat(node.children[3].value);
                options.radius = parseFloat(node.children[4].value);
                options.debugDisplay = node.children[5].value == "1";
                break;
            default:
                console.error(node);
                throw new Error("Unknown AreaGroup type: " + type);
        }

        return new Area(index, type, options);
    }

    repack() {
        const posData = this.type == 1 ? [
            {
                name: "Pos1",
                attributes: {},
                // weird typing glitch happens here? Hacky fix
                value: this.points ? this.points[0].repack() : "",
                children: []
            },
            {
                name: "Pos2",
                attributes: {},
                value: this.points ? this.points[1].repack() : "",
                children: []
            },
            {
                name: "Pos3",
                attributes: {},
                value: this.points ? this.points[2].repack() : "",
                children: []
            },
            {
                name: "Pos4",
                attributes: {},
                value: this.points ? this.points[3].repack() : "",
                children: []
            },
            {
                name: "Height",
                attributes: {},
                value: this.height.toFixed(6),
                children: []
            }
        ] : this.type == 2 ? [
            {
                name: "Height",
                attributes: {},
                value: this.height.toFixed(6),
                children: []
            },
            {
                name: "Radius",
                attributes: {},
                value: this.radius?.toFixed(6) || "",
                children: []
            }
        ] : [];

        const node: Node = {
            name: "WorkList",
            attributes: {},
            value: "",
            children: [
                {
                    name: "AreaIndex",
                    attributes: {},
                    value: this.index.toString(),
                    children: []
                },
                {
                    name: "AreaType",
                    attributes: {},
                    value: this.type.toString(),
                    children: []
                },
                {
                    name: "Center",
                    attributes: {},
                    value: this.center.repack(),
                    children: []
                },
                ...posData,
                {
                    name: "DebugDisp",
                    attributes: {},
                    value: this.debugDisplay ? "1" : "0",
                    children: []
                }
            ]
        }

        return node;
    }
}
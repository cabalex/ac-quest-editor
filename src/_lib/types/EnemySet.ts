import type { FileData, Node } from "../files/BXM/extract";
import Vector from "../Vector";

export default class EnemySet {
    sets: EmSet[];
    groupPos: GroupPos[];

    constructor(bxm: FileData) {
        // BXM file
        this.sets = bxm.data.children[0].children.map(set => new EmSet(set));
        this.groupPos = bxm.data.children[1].children.map(pos => new GroupPos(pos));
    }

    repack() {
        const node: Node = {
            name: "EmSetRoot",
            attributes: {},
            value: "",
            children: [
                {
                    name: "EmSetList",
                    attributes: {},
                    value: "",
                    children: this.sets.map(x => x.repack())
                },
                {
                    name: "GroupPosList",
                    attributes: {},
                    value: "",
                    children: this.groupPos.map(x => x.repack())
                }
            ]
        }

        return {data: node, encoding: "UTF-8"};
    }
}

export class EmSet {
    CanSet: boolean;
    number: number;
    easy: string;
    normal: string;
    hard: string;
    very_hard: string;
    name: string;
    groupNameHash: number;

    ems: Em[];

    constructor(node: Node) {
        this.CanSet = node.attributes["CanSet"] == "1";
        this.number = parseInt(node.attributes["number"]);
        this.easy = node.attributes["easy"];
        this.normal = node.attributes["normal"];
        this.hard = node.attributes["hard"];
        this.very_hard = node.attributes["very_hard"];
        this.name = node.attributes["name"];
        this.groupNameHash = parseInt(node.attributes["GroupNameHash"]);

        this.ems = node.children.map((child: Node) => new Em(child));
    }

    repack() {
        const node: Node = {
            name: "EmGroup",
            attributes: {
                CanSet: this.CanSet ? "1" : "0",
                number: this.number.toString(),
                easy: this.easy,
                normal: this.normal,
                hard: this.hard,
                very_hard: this.very_hard,
                name: this.name,
                groupNameHash: this.groupNameHash.toString()
            },
            value: "",
            children: this.ems.map((set: Em) => set.repack())
        }

        return node;
    }
}

function nodeToNumber(node: Node) {
    return Number(node.value);
}

function numberToNode(name: string, number: number) {
    return {
        name,
        attributes: {},
        value: number.toString(),
        children: []
    }
}

export class Em {
    SetNo: number;
    Ids: [number, number];
    BaseRot: Vector;
    BaseRotL: Vector;
    Trans: Vector;
    TransL: Vector;
    Rotation: number;
    SetType: number;
    Type: number;
    SetRtn: number;
    SetFlag: number;
    PathNo: number;
    EscapeNo: number;
    TmpPos: Vector;
    ExSetTypeA: number;
    ExSetTypeB: number;
    ExSetTypeC: number;
    ExSetTypeD: number;
    ExSetAttr: number;
    ExSetRtn: number;
    ExSetFlag: number;
    NoticeNo: number;
    SetWait: number;
    LvMin: number;
    LvMax: number;
    ParentId: number;
    PartsNo: number;
    HashNo: number;
    ItemId: number;
    SetTimer: number;
    SetCounter: number;
    SetRadius: number;
    GroupPos: number;
    GridDisp: number;
    EventSuspend: number;
    SimpleSubspaceSuspend: number;

    constructor(node: Node) {
        this.SetNo = parseInt(node.children[0].value);
        this.Ids = [parseInt(node.children[1].value), parseInt(node.children[2].value)];
        this.BaseRot = new Vector(node.children[3].value);
        this.BaseRotL = new Vector(node.children[4].value);
        this.Trans = new Vector(node.children[5].value);
        this.TransL = new Vector(node.children[6].value);
        [this.Rotation, this.SetType, this.Type, this.SetRtn, this.SetFlag, this.PathNo, this.EscapeNo] = node.children.slice(7, 14).map(nodeToNumber);
        this.TmpPos = new Vector(node.children[14].value);
        [this.ExSetTypeA, this.ExSetTypeB, this.ExSetTypeC, this.ExSetTypeD, this.ExSetAttr, this.ExSetRtn, this.ExSetFlag, this.NoticeNo, this.SetWait, this.LvMin, this.LvMax, this.ParentId, this.PartsNo, this.HashNo, this.ItemId, this.SetTimer, this.SetCounter, this.SetRadius, this.GroupPos, this.GridDisp, this.EventSuspend, this.SimpleSubspaceSuspend] = node.children.slice(15).map(nodeToNumber);
    }

    repack() {
        const node: Node = {
            name: "EmSet",
            attributes: {},
            value: "",
            children: [
                numberToNode("SetNo", this.SetNo),
                numberToNode("Id", this.Ids[0]),
                numberToNode("Id", this.Ids[1]),
                { name: "BaseRot", attributes: {}, value: this.BaseRot.repack(), children: [] },
                { name: "BaseRotL", attributes: {}, value: this.BaseRotL.repack(), children: [] },
                { name: "Trans", attributes: {}, value: this.Trans.repack(), children: [] },
                { name: "TransL", attributes: {}, value: this.TransL.repack(), children: [] },
                { name: "Rotation", attributes: {}, value: this.Rotation.toFixed(6), children: [] },
                numberToNode("SetType", this.SetType),
                numberToNode("Type", this.Type),
                numberToNode("SetRtn", this.SetRtn),
                numberToNode("SetFlag", this.SetFlag),
                numberToNode("PathNo", this.PathNo),
                numberToNode("EscapeNo", this.EscapeNo),
                { name: "TmpPos", attributes: {}, value: this.TmpPos.repack(), children: [] },
                numberToNode("ExSetTypeA", this.ExSetTypeA),
                numberToNode("ExSetTypeB", this.ExSetTypeB),
                numberToNode("ExSetTypeC", this.ExSetTypeC),
                numberToNode("ExSetTypeD", this.ExSetTypeD),
                numberToNode("ExSetAttr", this.ExSetAttr),
                numberToNode("ExSetRtn", this.ExSetRtn),
                numberToNode("ExSetFlag", this.ExSetFlag),
                numberToNode("NoticeNo", this.NoticeNo),
                numberToNode("SetWait", this.SetWait),
                numberToNode("LvMin", this.LvMin),
                numberToNode("LvMax", this.LvMax),
                numberToNode("ParentId", this.ParentId),
                numberToNode("PartsNo", this.PartsNo),
                numberToNode("HashNo", this.HashNo),
                numberToNode("ItemId", this.ItemId),
                numberToNode("SetTimer", this.SetTimer),
                numberToNode("SetCounter", this.SetCounter),
                numberToNode("SetRadius", this.SetRadius),
                numberToNode("GroupPos", this.GroupPos),
                numberToNode("GridDisp", this.GridDisp),
                numberToNode("EventSuspend", this.EventSuspend),
                numberToNode("SimpleSubspaceSuspend", this.SimpleSubspaceSuspend)
            ]
        }

        return node;
    }
}

export class GroupPos {
    node: Node;
    constructor(node: Node) {
        this.node = node;
    }

    repack() {
        return this.node;
    }

    // TODO: implement
}
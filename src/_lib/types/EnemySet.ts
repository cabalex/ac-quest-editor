import type { FileData, Node } from "../files/BXM/extract";
import { b_crc32 } from "../files/DAT/lib/generateDATHash";
import Vector from "../Vector";

export default class EnemySet {
    sets: EmSet[];
    groupPos: GroupPos[];

    constructor(sets: EmSet[], groupPos: GroupPos[]) {
        this.sets = sets;
        this.groupPos = groupPos;
    }

    static fromNode(bxm: FileData) {
        // BXM file
        let sets = bxm.data.children[0].children.map(set => EmSet.fromNode(set));
        let groupPos = bxm.data.children[1].children.map(pos => new GroupPos(pos));

        return new EnemySet(sets, groupPos);
    }

    getEmByArgs(args: {[key: string]: any}) {
        let arr: Em[] = [];
        this.sets.forEach(set => arr.push(...set.getEmByArgs(args)));
        return arr;
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

    constructor(name: string, number: number, ems: Em[], options?: {
        CanSet?: boolean,
        easy?: string,
        normal?: string,
        hard?: string,
        very_hard?: string,
        groupNameHash?: number
    }) { 
        this.CanSet = options?.CanSet || true;
        this.number = number;
        this.easy = options?.easy || "";
        this.normal = options?.normal || "";
        this.hard = options?.hard || "";
        this.very_hard = options?.very_hard || "";
        this.name = name;
        this.groupNameHash = options?.groupNameHash || (b_crc32(name.toLowerCase()) & 0x7FFFFFFF);

        this.ems = ems;
    }

    static fromNode(node: Node) {
        let options = {
            CanSet: node.attributes["CanSet"] == "1",
            easy: node.attributes["easy"],
            normal: node.attributes["normal"],
            hard: node.attributes["hard"],
            very_hard: node.attributes["very_hard"],
            groupNameHash: parseInt(node.attributes["GroupNameHash"])
        }
        let number = parseInt(node.attributes["number"]);
        let name = node.attributes["name"];
        let ems = node.children.map((child: Node) => Em.fromNode(child));

        return new EmSet(name, number, ems, options);
    }

    getEmByArgs(args: {[key: string]: any}) {
        return this.ems.filter(x => {
            for (let key of Object.keys(args)) {
                // @ts-ignore
                if (x[key] != args[key]) return false;
            }
            return true;
        })
    }

    repack() {
        // recalculate hash
        this.groupNameHash = b_crc32(this.name.toLowerCase()) & 0x7FFFFFFF;
        
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
    Id: number;
    IdL: number;
    BaseRot = new Vector();
    BaseRotL = new Vector();
    Trans = new Vector();
    TransL = new Vector();
    Rotation = 0;
    SetType = 0;
    SetRtn = 0;
    SetFlag = 0;
    PathNo = 0;
    EscapeNo = 0;
    TmpPos = new Vector();
    ExSetTypeA = 0;
    ExSetTypeB = 0;
    ExSetTypeC = 0;
    ExSetTypeD = 0;
    ExSetAttr = 0;
    ExSetRtn = 0;
    ExSetFlag = 0;
    NoticeNo = 0;
    SetWait = 0;
    LvMin = 0;
    LvMax = 0;
    ParentId = 0xffffffff;
    PartsNo = -1;
    HashNo = 0;
    ItemId = 0;
    SetTimer = 0;
    SetCounter = 0;
    SetRadius = 0;
    GroupPos = 0;
    GridDisp = 0;
    EventSuspend = 0;
    SimpleSubspaceSuspend = 0;

    // actual parameters
    secondaryObjectEnabled = false;

    constructor(setNo: number, ids: [number, number], opts?: {
        BaseRot?: Vector,
        BaseRotL?: Vector,
        Trans?: Vector,
        TransL?: Vector,
        Rotation?: number,
        SetType?: number,
        SetRtn?: number,
        SetFlag?: number,
        PathNo?: number,
        EscapeNo?: number,
        TmpPos?: Vector,
        ExSetTypeA?: number,
        ExSetTypeB?: number,
        ExSetTypeC?: number,
        ExSetTypeD?: number,
        ExSetAttr?: number,
        ExSetRtn?: number,
        ExSetFlag?: number,
        NoticeNo?: number,
        SetWait?: number,
        LvMin?: number,
        LvMax?: number,
        ParentId?: number,
        PartsNo?: number;
        HashNo?: number,
        ItemId?: number,
        SetTimer?: number,
        SetCounter?: number,
        SetRadius?: number,
        GroupPos?: number,
        GridDisp?: number,
        EventSuspend?: number,
        SimpleSubspaceSuspend?: number,
    }) {
        this.SetNo = setNo;
        this.Id = ids[0];
        this.IdL = ids[1];
        // assign to opts - shhh
        if (opts) {
            for (let key of Object.keys(opts)) {
                // @ts-ignore
                this[key] = opts[key];
            }
        }

        if (
            this.IdL != this.Id ||
            this.TransL.repack() !== this.Trans.repack() ||
            this.BaseRotL.repack() !== this.BaseRot.repack()
        ) {
            this.secondaryObjectEnabled = true;
        }
    }

    static fromNode(node: Node) {
        let opts: any = {}
        let setNo = parseInt(node.children[0].value);
        let ids: [number, number] = [parseInt(node.children[1].value), parseInt(node.children[2].value)];
        opts.BaseRot = new Vector(node.children[3].value);
        opts.BaseRotL = new Vector(node.children[4].value);
        opts.Trans = new Vector(node.children[5].value);
        opts.TransL = new Vector(node.children[6].value);
        [opts.Rotation, opts.SetType, opts.Type, opts.SetRtn, opts.SetFlag, opts.PathNo, opts.EscapeNo] = node.children.slice(7, 14).map(nodeToNumber);
        opts.TmpPos = new Vector(node.children[14].value);
        [opts.ExSetTypeA, opts.ExSetTypeB, opts.ExSetTypeC, opts.ExSetTypeD, opts.ExSetAttr, opts.ExSetRtn, opts.ExSetFlag, opts.NoticeNo, opts.SetWait, opts.LvMin, opts.LvMax, opts.ParentId, opts.PartsNo, opts.HashNo, opts.ItemId, opts.SetTimer, opts.SetCounter, opts.SetRadius, opts.GroupPos, opts.GridDisp, opts.EventSuspend, opts.SimpleSubspaceSuspend] = node.children.slice(15).map(nodeToNumber);
        return new Em(setNo, ids, opts);
    }

    repack() {
        const node: Node = {
            name: "EmSet",
            attributes: {},
            value: "",
            children: [
                numberToNode("SetNo", this.SetNo),
                numberToNode("Id", this.Id),
                numberToNode("Id", this.secondaryObjectEnabled ? this.IdL : this.Id),
                { name: "BaseRot", attributes: {}, value: this.BaseRot.repack(), children: [] },
                { name: "BaseRotL", attributes: {}, value: this.secondaryObjectEnabled ? this.BaseRotL.repack() : this.BaseRot.repack(), children: [] },
                { name: "Trans", attributes: {}, value: this.Trans.repack(), children: [] },
                { name: "TransL", attributes: {}, value: this.secondaryObjectEnabled ? this.TransL.repack() : this.Trans.repack(), children: [] },
                { name: "Rotation", attributes: {}, value: this.Rotation.toFixed(6), children: [] },
                // SetType and Type are always the same
                numberToNode("SetType", this.SetType),
                numberToNode("Type", this.SetType),
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
                numberToNode("SimpleSubspaceSuspend", this.SimpleSubspaceSuspend || 0) // doesn't exist in q2950?
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
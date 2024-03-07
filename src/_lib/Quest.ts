import type { FileData } from "./files/DAT/extract";
import repack from "./files/DAT/repack";
import extractBXM from "./files/BXM/extract";
import repackBXM from "./files/BXM/repack";
import extractCSV from "./files/CSV/extract";
import repackCSV from "./files/CSV/repack";
import { type FileData as PTDFileData } from "./files/PTD/extract";

import BezierData from "./types/BezierData";
import EnemySet, { Em } from "./types/EnemySet";
import ExData from "./types/ExData";
import QuestData from "./types/QuestData";
import ReliefSupplies from "./types/ReliefSupplies";
import ResultData from "./types/ResultData";
import SignboardData from "./types/SignboardData";
import SpeechBalloon from "./types/SpeechBalloon";
import SubtitleInfo from "./types/SubtitleInfo";
import TalkCondition from "./types/TalkCondition";
import TalkData from "./types/TalkData";
import TalkFlag from "./types/TalkFlag";
import TalkScript, { Script } from "./types/TalkScript";
import { questLookup, questUnlookup } from "./lookupTable";

export default class Quest {
    id: string;
    tab: null|string = null;

    // files
    questData: QuestData;
    enemySet: EnemySet;
    bezierData: BezierData;
    exData: ExData|null = null;
    reliefSupplies: ReliefSupplies|null = null;
    resultData: ResultData|null = null;
    signboardData: SignboardData|null = null;
    speechBalloon: SpeechBalloon|null = null;
    subtitleInfo: SubtitleInfo|null = null;
    talkCondition: TalkCondition|null = null;
    talkData: TalkData|null = null;
    talkFlag: TalkFlag|null = null;
    talkScript: TalkScript|null = null;


    constructor(id: string, questData: QuestData, enemySet: EnemySet, bezierData: BezierData) {
        this.id = id;
        this.questData = questData;
        this.enemySet = enemySet;
        this.bezierData = bezierData;
    }


    static fromDAT(name: string, dat: FileData, gameText?: PTDFileData) {
        if (!name.startsWith("quest")) {
            throw new Error("Invalid quest name");
        }
        let id = name.slice(5, 9);

        if (!dat.files.find(f => f.name == "QuestData.bxm")) {
            throw new Error("QuestData.bxm not found");
        }
        let questData = QuestData.fromNode(extractBXM(dat.files.find(f => f.name == "QuestData.bxm")?.arrayBuffer || new ArrayBuffer(0)));

        if (!dat.files.find(f => f.name == "EnemySet.bxm")) {
            throw new Error("EnemySet.bxm not found");
        }
        let enemySet = EnemySet.fromNode(extractBXM(dat.files.find(f => f.name == "EnemySet.bxm")?.arrayBuffer || new ArrayBuffer(0)));

        if (!dat.files.find(f => f.name == "BezierData.bxm")) {
            throw new Error("BezierData.bxm not found");
        }
        let bezierData = BezierData.fromNode(extractBXM(dat.files.find(f => f.name == "BezierData.bxm")?.arrayBuffer || new ArrayBuffer(0)));


        let quest = new Quest(id, questData, enemySet, bezierData);

        // load the rest of the files if possible
        let talkScriptBXMs = [];
        for (let file of dat.files) {
            if (!file.arrayBuffer || file.arrayBuffer.byteLength == 0) continue;
            if (["QuestData.bxm", "EnemySet.bxm", "BezierData.bxm"].includes(file.name)) continue;
            

            switch(file.name.split("_")[0]) {
                case "ExData.csv":
                    quest.exData = new ExData(extractCSV(file.arrayBuffer));
                    break;
                case "ReliefSupplies.csv":
                    quest.reliefSupplies = new ReliefSupplies(extractCSV(file.arrayBuffer));
                    break;
                case "ResultData.csv":
                    quest.resultData = new ResultData(extractCSV(file.arrayBuffer));
                    break;
                case "SignboardData.bxm":
                    quest.signboardData = SignboardData.fromNode(extractBXM(file.arrayBuffer));
                    break;
                case "SpeechBalloon":
                    quest.speechBalloon = new SpeechBalloon(extractCSV(file.arrayBuffer));
                    break;
                case "SubtitleInfo":
                    quest.subtitleInfo = new SubtitleInfo(extractCSV(file.arrayBuffer));
                    break;
                case "TalkCondition":
                    quest.talkCondition = new TalkCondition(extractCSV(file.arrayBuffer));
                    break;
                case "TalkData":
                    quest.talkData = new TalkData(extractCSV(file.arrayBuffer));
                    break;
                case "TalkFlag":
                    quest.talkFlag = new TalkFlag(extractCSV(file.arrayBuffer));
                    break;
                case "TalkScript":
                    talkScriptBXMs.push(extractBXM(file.arrayBuffer));
                    break;
            }
        }

        if (talkScriptBXMs.length) {
            quest.talkScript = TalkScript.fromNodes(talkScriptBXMs, gameText);
        }

        console.log(quest);

        return quest;
    }

    async repack(gameText?: PTDFileData) : Promise<ArrayBuffer> {
        let id = this.id.toLowerCase();

        let talkScriptFiles = [];
        if (this.talkScript) {
            talkScriptFiles.push(...this.talkScript.repack(gameText));
        }

        let files = [
            { name: "SignboardData.bxm", repack: this.signboardData?.repack()  },
            { name: "ReliefSupplies.csv", repack: this.reliefSupplies?.repack()  },
            { name: "ResultData.csv", repack: this.resultData?.repack()  },
            { name: `TalkFlag_${id}.csv`, repack: this.talkFlag?.repack()  },
            { name: `TalkCondition_${id}.csv`, repack: this.talkCondition?.repack()  },
            { name: `TalkData_${id}.csv`, repack: this.talkData?.repack()  },
            { name: `SubtitleInfo_${id}.csv`, repack: this.subtitleInfo?.repack()  },
            { name: `SpeechBalloon_${id}.csv`, repack: this.speechBalloon?.repack()  },
            { name: `TalkScript_${id}.bxm`, repack: talkScriptFiles[0] },
            { name: `TalkScript_speech_${id}.bxm`, repack: talkScriptFiles[1] },
            { name: "BezierData.bxm", repack: this.bezierData.repack() },
            { name: "EnemySet.bxm", repack: this.enemySet.repack() },
            { name: "ExData.csv", repack: this.exData?.repack()},
            { name: "QuestData.bxm", repack: this.questData.repack() }
        ].map((f, i) => {
            let arrayBuffer;
            if (!f.repack) {
                arrayBuffer = new ArrayBuffer(0);
            } else if (f.name.endsWith(".csv")) {
                console.log(`Repacking ${f.name} (${i}/14)`);
                arrayBuffer = repackCSV(f.repack as any);
            } else {
                console.log(`Repacking ${f.name} (${i}/14)`);
                arrayBuffer = repackBXM(f.repack as any);
            }
            return {name: f.name, arrayBuffer: arrayBuffer};
        })


        return await repack({ files });
    }

    changeTalkScriptReference(script: Script, em: Em) {
        if (!this.talkScript) {
            throw new Error("No talk script found");
        }

        // check if reference still exists after detaching this one
        let isPreviousIDStillAttached = false;
        // check if new ID is already attached to something (don't change it!)
        let isNewIDAlreadyAttached = false;
        for (let s of this.talkScript.scripts) {
            if (s !== script && s.objId.toUpperCase() == script.objId.toUpperCase()) {
                isPreviousIDStillAttached = true;
            } else if (
                s !== script &&
                questLookup(em.Id.toString(16), true)?.toUpperCase() == s.objId.toUpperCase() &&
                s.setType == em.SetType
            ) {
                isNewIDAlreadyAttached = true;
            }
        }


        let oldEm = this.enemySet.getEmByArgs({ SetType: script.setType, Id: questUnlookup(script.objId) })[0];

        if (oldEm && isPreviousIDStillAttached) {
            oldEm.SetType = 0;
        } else if (!oldEm) {
            console.warn("changeTalkScriptReference: Previous Em not found when deleting old SetType.");
        }

        if (isNewIDAlreadyAttached) {
            script.setType = em.SetType;
        } else {
            // calculate a new unique ID
            let highestID = 0;
            for (let set of this.enemySet.sets) {
                for (let e of set.ems) {
                    if (e !== em || isPreviousIDStillAttached) {
                        highestID = Math.max(highestID, e.SetType);
                    } else if (e === em && !isPreviousIDStillAttached) {
                        // reset ID
                        e.SetType = 0;
                    } else {
                        highestID = Math.max(highestID, e.SetType);
                    }
                }
            }
            script.setType = em.SetType = highestID + 1;
        }

        script.objId = questLookup(em.Id.toString(16), true)?.toUpperCase() || "OBJID_NOT_FOUND";
    }
}
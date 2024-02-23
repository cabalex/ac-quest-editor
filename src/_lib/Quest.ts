import type { FileData } from "./files/DAT/extract";
import repack from "./files/DAT/repack";
import extractBXM from "./files/BXM/extract";
import repackBXM from "./files/BXM/repack";
import extractCSV from "./files/CSV/extract";
import repackCSV from "./files/CSV/repack";

import BezierData from "./types/BezierData";
import EnemySet from "./types/EnemySet";
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
import TalkScript from "./types/TalkScript";

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


    static fromDAT(name: string, dat: FileData) {
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
            quest.talkScript = TalkScript.fromNodes(talkScriptBXMs);
        }

        console.log(quest);

        return quest;
    }

    async repack() : Promise<ArrayBuffer> {
        let id = this.id.toLowerCase();

        let talkScriptFiles = [];
        if (this.talkScript) {
            talkScriptFiles.push(...this.talkScript.repack());
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
}
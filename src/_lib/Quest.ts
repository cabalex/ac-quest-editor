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
import TalkScript_speech from "./types/TalkScript_speech";

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
    talkData?: TalkData|null = null;
    talkFlag: TalkFlag|null = null;
    talkScript: TalkScript|null = null;
    talkScript_speech: TalkScript_speech|null = null;


    constructor(name: string, dat: FileData) {
        if (!name.startsWith("quest")) {
            throw new Error("Invalid quest name");
        }
        this.id = name.slice(5, 9);
        console.log(`creating quest ${this.id}`, dat);

        if (!dat.files.find(f => f.name == "QuestData.bxm")) {
            throw new Error("QuestData.bxm not found");
        }
        this.questData = new QuestData(extractBXM(dat.files.find(f => f.name == "QuestData.bxm")?.arrayBuffer || new ArrayBuffer(0)));

        if (!dat.files.find(f => f.name == "EnemySet.bxm")) {
            throw new Error("EnemySet.bxm not found");
        }
        this.enemySet = new EnemySet(extractBXM(dat.files.find(f => f.name == "EnemySet.bxm")?.arrayBuffer || new ArrayBuffer(0)));

        if (!dat.files.find(f => f.name == "BezierData.bxm")) {
            throw new Error("BezierData.bxm not found");
        }
        this.bezierData = new BezierData(extractBXM(dat.files.find(f => f.name == "BezierData.bxm")?.arrayBuffer || new ArrayBuffer(0)));

        // load the rest of the files if possible
        for (let file of dat.files) {
            if (!file.arrayBuffer || file.arrayBuffer.byteLength == 0) continue;
            if (["QuestData.bxm", "EnemySet.bxm", "BezierData.bxm"].includes(file.name)) continue;
            
            switch(file.name.split("_")[0]) {
                case "ExData.csv":
                    this.exData = new ExData(extractCSV(file.arrayBuffer));
                    break;
                case "ReliefSupplies.csv":
                    this.reliefSupplies = new ReliefSupplies(extractCSV(file.arrayBuffer));
                    break;
                case "ResultData.csv":
                    this.resultData = new ResultData(extractCSV(file.arrayBuffer));
                    break;
                case "SignboardData.bxm":
                    this.signboardData = new SignboardData(extractBXM(file.arrayBuffer));
                    break;
                case "SpeechBalloon":
                    this.speechBalloon = new SpeechBalloon(extractCSV(file.arrayBuffer));
                    break;
                case "SubtitleInfo":
                    this.subtitleInfo = new SubtitleInfo(extractCSV(file.arrayBuffer));
                    break;
                case "TalkCondition":
                    this.talkCondition = new TalkCondition(extractCSV(file.arrayBuffer));
                    break;
                case "TalkData":
                    this.talkData = new TalkData(extractCSV(file.arrayBuffer));
                    break;
                case "TalkFlag":
                    this.talkFlag = new TalkFlag(extractCSV(file.arrayBuffer));
                    break;
                case "TalkScript":
                    if (file.name.includes("speech")) {
                        this.talkScript_speech = new TalkScript_speech(extractBXM(file.arrayBuffer));
                    } else {
                        this.talkScript = new TalkScript(extractBXM(file.arrayBuffer));
                    }
            }
        }

        console.log(this);
    }

    async repack() : Promise<ArrayBuffer> {
        let id = this.id.toLowerCase();

        let files = [
            { name: "SignboardData.bxm", repack: this.signboardData?.repack()  },
            { name: "ReliefSupplies.csv", repack: this.reliefSupplies?.repack()  },
            { name: "ResultData.csv", repack: this.resultData?.repack()  },
            { name: `TalkFlag_${id}.csv`, repack: this.talkFlag?.repack()  },
            { name: `TalkCondition_${id}.csv`, repack: this.talkCondition?.repack()  },
            { name: `TalkData_${id}.csv`, repack: this.talkData?.repack()  },
            { name: `SubtitleInfo_${id}.csv`, repack: this.subtitleInfo?.repack()  },
            { name: `SpeechBalloon_${id}.csv`, repack: this.speechBalloon?.repack()  },
            { name: `TalkScript_${id}.bxm`, repack: this.talkScript?.repack()  },
            { name: `TalkScript_speech_${id}.bxm`, repack: this.talkScript_speech?.repack()  },
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
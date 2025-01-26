import Blockly from "blockly";
import { get } from "svelte/store";
import { session } from "../store";
import Quest from "../_lib/Quest";

// full list of block ids
export const blockIds = {};


/**
 * Astral Chain Hashes are just the flag name (ScenarioFlag.csv) lowercased, crc32b'd, & 0x3fffffff.
 * crc32b(str.toLowerCase()) & 0x3fffffff
 */
export const hashDropdownOptions = [["INVALID VALUE!", "1"], ["TALK_TEST_000 ", "15f34105"], ["TALK_TEST_000 ", "15f34105"], ["JUMP_TEST_000 ", "5a16eb45"], ["vs_test_0 ", "440c3b60"], ["vs_test_0 ", "440c3b60"], ["boss1_of ", "90c5474"], ["f015_evf01 ", "73519eca"], ["vs_TUT ", "637b1c50"], ["YAMAMURO_TEST01", "20af2118"], ["YAMAMURO_TEST02", "39a670a2"], ["YAMAMURO_TEST03", "4ea14034"], ["YAMAMURO_TEST04", "50c5d597"], ["NAKA_TEST_P100_0 ", "491db5e"], ["NAKA_TEST_P200_0 ", "205a9f0"], ["NAKA_TEST_P200_0 ", "205a9f0"], ["NAKA_TEST_P200_0 ", "205a9f0"], ["NAKA_TEST_P300_0 ", "49597a55"], ["NAKA_TEST_P400_0 ", "545c4aed"], ["Debug_jump", "28a9ee2f"], ["scenario_Fusion", "34fd8862"], ["scenario_File10_Fusion_TIME", "f8b0c5a"], ["scenario_File8_p300_Barricade_Delete", "2bd7804c"], ["scenario_File03_shop_ITEM_get", "31e6074c"], ["scenario_File07_AlanFall", "387f37de"], ["scenario_File08_GATE_OFF", "57803d98"], ["scenario_GOZARU", "53e36f26"], ["scenario_File02_shutter_Open", "150457b5"], ["scenario_File11_Capsule_Open", "6262ab1c"], ["scenario_TUTO_AX", "6bad1c0b"], ["PL_Companion", "30eaa466"], ["PL_Communication", "33529849"], ["PL_BaseBattle", "349e3061"], ["PL_Rappy", "2a2329bd"], ["PL_Fusion_possible", "89e4723"], ["PL_Opening_LegionOff", "5bd81148"], ["PL_RappyBalloonVender", "e086b14"], ["PL_BEride", "6ae40e71"], ["PL_StealthBattleON", "5c4e9f0c"], ["PL_Beast_Chase", "2e30d9d"], ["PL_SquatWalk", "39e5308a"], ["PL_ArrowShooting", "3f48d117"], ["PL_Tracking", "3ecb3433"], ["PL_Reasoning", "452c1c2"], ["PL_File02_LegionOff", "45e9da8e"], ["PL_BladeOff", "5a528603"], ["PL_SyncAttackOn", "30df91f7"], ["PL_StyleActionSwordOn", "e8d4bdd"], ["PL_StyleActionAxOn", "782d8879"], ["PL_StyleActionArrowOn", "a6296d1"], ["PL_StyleActionArmorOn", "6e195469"], ["PL_StyleActionBeastOn", "1a900543"], ["PL_ChainJumpOn", "78cefe12"], ["PL_IRISOff", "420345d7"], ["PL_MainMenuOff", "6df0f342"], ["PL_MemoOff", "47d01d00"], ["PL_CameraOff", "52cc97b1"], ["PL_CoreOn", "16343c52"], ["SkillTree_AX", "d2a0172"], ["SkillTree_GH", "46c7b690"], ["SkillTree_BE", "45013e68"], ["SkillTree_DE", "135b99ee"], ["Drone_Companion", "6848398a"], ["Drone_Return", "1948d6cc"], ["NPC_Colleague", "71477738"], ["NPC_Josef", "4355366d"], ["NPC_Olive", "7057207d"], ["NPC_Brenda", "6445a2ee"], ["NPC_Drone", "31d7d52b"], ["NPC_Marie", "25d4e9cf"], ["NPC_Rappy", "4be1c8a5"], ["NPC_Personnel", "1eb7db14"], ["NPC_kijima", "5894e82f"], ["NPC_Hattori", "f96346d"], ["NPC_Tabitha", "4cbe11cf"], ["NPC_Ted", "1960d41"], ["NPC_MR_Training", "1b00cb02"], ["NPC_Helicopter_1", "a3e7bda"], ["NPC_Helicopter_2", "13372a60"], ["NPC_Helicopter_3", "64301af6"], ["NPC_Helicopter_4", "7a548f55"], ["NPC_Max", "620c0cf5"], ["NPC_Roy", "1cf2f5a0"], ["NPC_Alicia", "4aa1ab05"], ["NPC_Shizu", "6b2792c1"], ["NPC_Mitsuru", "299adbf7"], ["NPC_Avery", "9b449c8"], ["NPC_Mike", "4d9360ef"], ["NPC_Billy", "1dfe7081"], ["NPC_Alan", "6cb32cbe"], ["NPC_Rifa", "772a9d72"], ["NPC_Richard", "1c4b8782"], ["NPC_Kei", "685d95b1"], ["NPC_Joy", "ec70768"], ["NPC_Sara", "6f2b7cfa"], ["NPC_Leona", "4b0435d5"], ["NPC_Julia", "595abf74"], ["NPC_Jin", "5b4e2529"], ["NPC_p100_file08", "6a7219bb"], ["NPC_p300_Kids", "50055f42"], ["GetCat_01", "7930e9a2"], ["GetCat_02", "6039b818"], ["GetCat_03", "173e888e"], ["GetCat_04", "95a1d2d"], ["GetCat_05", "7e5d2dbb"], ["GetCat_06", "67547c01"], ["GetCat_07", "10534c97"], ["GetCat_08", "ec5106"], ["GetCat_09", "77eb6190"], ["GetCat_10", "172ce875"], ["GetCat_11", "602bd8e3"], ["GetCat_12", "79228959"], ["GetCat_13", "e25b9cf"], ["GetCat_14", "10412c6c"], ["GetCat_15", "67461cfa"], ["GetCat_16", "7e4f4d40"], ["GetCat_17", "9487dd6"], ["GetCat_18", "19f76047"], ["GetCat_19", "6ef050d1"], ["GetCat_20", "3c01bbb6"], ["Cat_Get_On", "6034e678"], ["Cat_eat", "1e34ea0a"], ["c200_barricade", "295a98f1"], ["c201_collapse_before", "7f41e892"], ["c202_collapse_after", "58786cc2"], ["c203_f04civ", "7954546b"], ["c204_f09civ", "1fb85af"], ["c205_bike", "6f607e05"], ["c206_bossarea", "e17f383"], ["c207_ball", "1a26a0d5"], ["c208_f04civB", "29f29da0"], ["c209_monitor", "4e01d96a"], ["c218_barricade", "83c35db"], ["c100_shutter", "1e081f40"], ["c103_c5crack", "125cf741"], ["c101_case5", "5397541e"], ["c104_highway", "1c76dbcd"], ["c105_closedoor", "1672d3fa"], ["c106_highwaycol", "3d57a53d"], ["c107_flare", "7b8794f5"], ["c109_shutter", "32aba91b"], ["c110_Armoredvehicle", "139629c4"], ["c10a_Cinema", "272cf46d"], ["c10b_fence", "2fe77942"], ["c300_gate", "790403c"], ["p300_DownBridge", "5ea19f"], ["c403_Ceiling", "27f80827"], ["c403_stairs", "223a0cde"], ["c404_glass", "50576687"], ["ca01_bossAreaOtona", "672d609c"], ["ca02_crystal", "4b977a0e"], ["cb3e_cy", "89e7a41"], ["c600_Pl", "28c01099"], ["c601_col", "17504e54"], ["c602_col", "50f03484"], ["c603_buil", "63a513d0"], ["c604_buil", "7ea02368"], ["c605_toilet", "320db87e"], ["c606_distant", "3236ea69"], ["c607_lt", "400ced2b"], ["c608_lt", "186ffd7d"], ["c800_genba", "1418eb6f"], ["c905_door", "745301fe"], ["c904_f07gate", "664a2ee"], ["c902_pcscreen", "24ca6c42"], ["c903_pcscreen", "4b08077c"], ["c906_box", "48205ce7"], ["c901_door", "6fc243e8"], ["c900_joseph", "21fbb853"], ["_s00e_bridge", "114ecb7"], ["_s00f_bridge", "f9beb54"], ["_s010_bridge", "ba90556"], ["_s00b_drainage", "1ef4de04"], ["_s011_drainage", "d593c8f"], ["_s012_drainage", "666e878c"], ["_s013_ev", "80d1707"], ["r200_CTR20", "67947b3f"], ["p300_CTRsky", "52632ec4"], ["r821_CTR00", "24de9fea"], ["p100_CTR10", "71c1c404"], ["p500_CTR50", "4841500c"], ["ra00_CTRa1", "4ada388d"], ["rb00_CTRb1", "587a578b"], ["rb00_CTRb2", "41730631"], ["rb00_CTRb3", "367436a7"], ["rb00_CTRb4", "2810a304"], ["rb00_CTRb5", "5f179392"], ["rb00_CTRb6", "461ec228"], ["rb00_CTRb7", "3119f2be"], ["rb00_CTRb8", "21a6ef2f"], ["rb00_CTRb9", "56a1dfb9"], ["rb00_CTRba", "3311067f"], ["p600_CTR60", "5ae13f0a"], ["p600_CTR61", "2de60f9c"], ["p600_CTR62", "34ef5e26"], ["p900_CTR90", "2c0ec14"], ["c110_TakeDown", "14bc8282"], ["c120_TakeDown", "d5ee483"], ["TUTO_end_00", "10053f92"], ["TUTO_end_01", "67020f04"], ["TUTO_end_02", "7e0b5ebe"], ["TUTO_end_03", "90c6e28"], ["TUTO_end_04", "1768fb8b"], ["TUTO_end_05", "606fcb1d"], ["TUTO_end_06", "79669aa7"], ["TUTO_end_07", "e61aa31"], ["TUTO_end_08", "1edeb7a0"], ["TUTO_end_09", "69d98736"], ["TUTO_end_10", "91e0ed3"], ["TUTO_end_11", "7e193e45"], ["TUTO_end_12", "67106fff"], ["TUTO_end_13", "10175f69"], ["TUTO_end_14", "e73caca"], ["TUTO_end_15", "7974fa5c"], ["TUTO_end_16", "607dabe6"], ["TUTO_end_17", "177a9b70"], ["TUTO_end_18", "7c586e1"], ["TUTO_end_19", "70c2b677"], ["TUTO_end_20", "22335d10"], ["TUTO_end_control", "550beaea"], ["MENU_LEGION_OFF", "433bb323"], ["MENU_SUB_LEGION_OFF", "57976118"], ["MENU_TUTO_OFF_00", "431b81f2"], ["MENU_TUTO_OFF_01", "341cb164"], ["SHOP_item_0x1b00", "52cf080a"], ["Robo_Firsttime", "687db06d"], ["Robo_Secondtime", "44e37f51"], ["Robo_Thirdtime", "68845617"], ["Robo_Fourthtime", "4b2ab63d"], ["Robo_Final", "2af3f995"], ["Score_UI", "a2d2bb1"], ["Score_time", "458c1933"], ["Name_ENG_UK1", "43e63bec"], ["Gold_EM_01", "27e8d68d"], ["Gold_EM_02", "3ee18737"], ["Gold_EM_03", "49e6b7a1"], ["Gold_EM_04", "57822202"], ["Gold_EM_05", "20851294"], ["Gold_EM_06", "398c432e"], ["Gold_EM_07", "4e8b73b8"], ["Gold_EM_08", "5e346e29"], ["Gold_EM_09", "29335ebf"], ["Gold_EM_10", "49f4d75a"], ["Order_Hideout_01", "2a3a91e4"], ["Order_Hideout_02", "3333c05e"], ["Order_Hideout_03", "4434f0c8"], ["Order_Hideout_04", "5a50656b"], ["Order_Hideout_05", "2d5755fd"], ["FILE00", "3d3e1ff7"], ["FILE01", "4a392f61"], ["FILE02", "53307edb"], ["FILE03", "24374e4d"], ["FILE04", "3a53dbee"], ["FILE05", "4d54eb78"], ["FILE06", "545dbac2"], ["FILE07", "235a8a54"], ["FILE08", "33e597c5"], ["FILE09", "44e2a753"], ["FILE10", "24252eb6"], ["FILE11", "53221e20"], ["FILE12", "4a2b4f9a"], ["file00_100", "7b7ad42f"], ["file01_100", "461afd9f"], ["file01_200", "445c43c6"], ["file01_300", "459e29f1"], ["file01_400", "40d13f74"], ["file01_500", "41135543"], ["file01_600", "4355eb1a"], ["file01_700", "4297812d"], ["file01_720", "70a1e3af"], ["file01_740", "26fb4429"], ["file01_760", "14cd26ab"], ["file01_800", "49cbc610"], ["file01_850", "34bc3255"], ["file01_900", "4809ac27"], ["file01_1000", "142d4b09"], ["file01_1100", "15ef213e"], ["file01_1105", "6585d5b1"], ["file01_1110", "cf4107f"], ["file01_1120", "27d943bc"], ["file01_1200", "17a99f67"], ["file01_1220", "259ffde5"], ["file01_1230", "3c84cca4"], ["file01_1250", "6ade6b22"], ["file01_1300", "166bf550"], ["file02_100", "1ba874f"], ["file02_150", "7ccd730a"], ["file02_200", "3fc3916"], ["file02_300", "23e5321"], ["file02_350", "7f49a764"], ["file02_370", "4d7fc5e6"], ["file02_400", "77145a4"], ["file02_500", "6b32f93"], ["file02_600", "4f591ca"], ["file02_1000", "12b939a7"], ["file02_1050", "6fcecde2"], ["file02_1100", "137b5390"], ["file02_1130", "38560053"], ["file02_1150", "6e0ca7d5"], ["file02_1200", "113dedc9"], ["file02_1250", "6c4a198c"], ["file02_1300", "10ff87fe"], ["file02_1400", "15b0917b"], ["file02_1450", "68c7653e"], ["file02_1500", "1472fb4c"], ["file02_1600", "16344515"], ["file02_1700", "17f62f22"], ["file02_2000", "c9649"], ["file02_2050", "7d7b620c"], ["file02_2100", "1cefc7e"], ["file02_2150", "7cb9083b"], ["file02_2200", "3884227"], ["file02_2300", "24a2810"], ["file02_2350", "7f3ddc55"], ["file02_2400", "7053e95"], ["file02_2500", "6c754a2"], ["file02_2600", "481eafb"], ["file02_3000", "38b0f12c"], ["file02_3100", "39729b1b"], ["file03_100", "3cdaaeff"], ["file03_110", "25c19fbe"], ["file03_150", "41ad5aba"], ["file03_200", "3e9c10a6"], ["file03_250", "43ebe4e3"], ["file03_300", "3f5e7a91"], ["file03_400", "3a116c14"], ["file03_450", "47669851"], ["file03_470", "7550fad3"], ["file03_500", "3bd30623"], ["file03_600", "3995b87a"], ["file03_700", "3857d24d"], ["file03_800", "330b9570"], ["file03_900", "32c9ff47"], ["file03_1100", "58278035"], ["file03_1200", "5a613e6c"], ["file03_1300", "5ba3545b"], ["file03_1400", "5eec42de"], ["file03_1500", "5f2e28e9"], ["file03_1600", "5d6896b0"], ["file03_1700", "5caafc87"], ["file03_1800", "57f6bbba"], ["file03_2000", "4b5045ec"], ["file03_2100", "4a922fdb"], ["file03_2150", "37e5db9e"], ["file03_2200", "48d49182"], ["file03_2300", "4916fbb5"], ["file03_2400", "4c59ed30"], ["file04_100", "efa72ef"], ["file04_150", "738d86aa"], ["file04_200", "cbcccb6"], ["file04_300", "d7ea681"], ["file04_400", "831b004"], ["file04_500", "9f3da33"], ["file04_600", "bb5646a"], ["file04_700", "a770e5d"], ["file04_800", "12b4960"], ["file04_900", "e92357"], ["file04_1000", "44e0daba"], ["file04_1100", "4522b08d"], ["file04_1125", "77e2680"], ["file04_1150", "385544c8"], ["file04_1200", "47640ed4"], ["file04_1300", "46a664e3"], ["file04_1400", "43e97266"], ["file04_1500", "422b1851"], ["file04_2000", "56557554"], ["file04_2100", "57971f63"], ["file04_2110", "4e8c2e22"], ["file04_2250", "28a6557f"], ["file04_2300", "5413cb0d"], ["file04_2320", "6625a98f"], ["file04_2350", "29643f48"], ["file04_2400", "515cdd88"], ["file04_2450", "2c2b29cd"], ["file04_2500", "509eb7bf"], ["file04_2600", "52d809e6"], ["file04_2700", "531a63d1"], ["file04_2800", "584624ec"], ["file04_2900", "59844edb"], ["file04_3000", "6ee91231"], ["file05_100", "339a5b5f"], ["file05_200", "31dce506"], ["file05_300", "301e8f31"], ["file05_400", "355199b4"], ["file05_500", "3493f383"], ["file05_550", "49e407c6"], ["file05_600", "36d54dda"], ["file05_700", "371727ed"], ["file05_800", "3c4b60d0"], ["file05_850", "413c9495"], ["file05_900", "3d890ae7"], ["file05_1000", "fbc091f"], ["file05_1100", "e7e6328"], ["file05_1200", "c38dd71"], ["file05_1300", "dfab746"], ["file05_1400", "8b5a1c3"], ["file05_1500", "977cbf4"], ["file05_1600", "b3175ad"], ["file05_1700", "af31f9a"], ["file05_1750", "7784ebdf"], ["file05_1800", "1af58a7"], ["file05_1900", "6d3290"], ["file05_2000", "1d09a6f1"], ["file05_2100", "1ccbccc6"], ["file05_2150", "61bc3883"], ["file05_2160", "4a916b40"], ["file05_2200", "1e8d729f"], ["file05_2300", "1f4f18a8"], ["file05_2400", "1a000e2d"], ["file05_2500", "1bc2641a"], ["file06_100", "743a218f"], ["file06_200", "767c9fd6"], ["file06_300", "77bef5e1"], ["file06_400", "72f1e364"], ["file06_450", "f861721"], ["file06_500", "73338953"], ["file06_550", "e447d16"], ["file06_590", "22f1321a"], ["file06_600", "7175370a"], ["file06_700", "70b75d3d"], ["file06_720", "42813fbf"], ["file06_800", "7beb1a00"], ["file06_900", "7a297037"], ["file06_950", "75e8472"], ["file06_955", "773470fd"], ["file06_960", "2c73d7b1"], ["file06_1000", "9287bb1"], ["file06_1100", "8ea1186"], ["file06_1110", "11f120c7"], ["file06_1120", "3adc7304"], ["file06_1140", "6c86d482"], ["file06_1160", "5eb0b600"], ["file06_1180", "40339b8e"], ["file06_1200", "aacafdf"], ["file06_1300", "b6ec5e8"], ["file06_1400", "e21d36d"], ["file06_1420", "3c17b1ef"], ["file06_1425", "4c7d4560"], ["file06_1430", "250c80ae"], ["file06_1435", "55667421"], ["file06_1440", "6a4d1669"], ["file06_1445", "1a27e2e6"], ["file06_1447", "742983ca"], ["file06_1450", "73562728"], ["file06_1500", "fe3b95a"], ["file06_1600", "da50703"], ["file06_1700", "c676d34"], ["file06_1800", "73b2a09"], ["file07_100", "495a083f"], ["file07_200", "4b1cb666"], ["file07_300", "4adedc51"], ["file07_400", "4f91cad4"], ["file07_500", "4e53a0e3"], ["file07_600", "4c151eba"], ["file07_700", "4dd7748d"], ["file07_800", "468b33b0"], ["file07_900", "47495987"], ["file07_1000", "4274a814"], ["file07_1100", "43b6c223"], ["file07_1200", "41f07c7a"], ["file07_1300", "4032164d"], ["file07_1400", "457d00c8"], ["file07_1450", "380af48d"], ["file07_1500", "44bf6aff"], ["file07_1600", "46f9d4a6"], ["file07_1700", "473bbe91"], ["file07_1800", "4c67f9ac"], ["file08_100", "4b0a9fee"], ["file08_200", "494c21b7"], ["file08_300", "488e4b80"], ["file08_400", "4dc15d05"], ["file08_500", "4c033732"], ["file08_600", "4e45896b"], ["file08_650", "33327d2e"], ["file08_700", "4f87e35c"], ["file08_800", "44dba461"], ["file08_850", "39ac5024"], ["file08_900", "4519ce56"], ["file08_1000", "33221ac1"], ["file08_1100", "32e070f6"], ["file08_1200", "30a6ceaf"], ["file09_100", "766ab65e"], ["file09_120", "445cd4dc"], ["file09_150", "b1d421b"], ["file09_200", "742c0807"], ["file09_300", "75ee6230"], ["file09_400", "70a174b5"], ["file09_500", "71631e82"], ["file09_600", "7325a0db"], ["file09_700", "72e7caec"], ["file09_800", "79bb8dd1"], ["file09_900", "7879e7e6"], ["file09_1100", "79bca353"], ["file09_1200", "7bfa1d0a"], ["file09_1300", "7a38773d"], ["file09_1600", "7cf3b5d6"], ["file09_1700", "7d31dfe1"], ["file09_1800", "766d98dc"], ["file09_1900", "77aff2eb"], ["file09_2000", "6acb668a"], ["file09_2100", "6b090cbd"], ["file09_2200", "694fb2e4"], ["file09_2300", "688dd8d3"], ["file09_2400", "6dc2ce56"], ["file09_2500", "6c00a461"], ["file09_2600", "6e461a38"], ["file09_2700", "6f84700f"], ["file10_100", "3026078a"], ["file10_200", "3260b9d3"], ["file10_300", "33a2d3e4"], ["file10_400", "36edc561"], ["file10_500", "372faf56"], ["file10_600", "3569110f"], ["file10_700", "34ab7b38"], ["file10_800", "3ff73c05"], ["file10_900", "3e355632"], ["file10_1000", "79069318"], ["file10_1100", "78c4f92f"], ["file10_1200", "7a824776"], ["file10_1300", "7b402d41"], ["file10_1400", "7e0f3bc4"], ["file10_1500", "7fcd51f3"], ["file10_1600", "7d8befaa"], ["file10_1700", "7c49859d"], ["file10_1800", "7715c2a0"], ["file10_1900", "76d7a897"], ["file10_2000", "6bb33cf6"], ["file10_2100", "6a7156c1"], ["file10_2200", "6837e898"], ["file10_2300", "69f582af"], ["file10_2400", "6cba942a"], ["file10_2500", "6d78fe1d"], ["file10_2600", "6f3e4044"], ["file10_2700", "6efc2a73"], ["file10_2800", "65a06d4e"], ["file10_2900", "64620779"], ["file10_3000", "530f5b93"], ["file10_3100", "52cd31a4"], ["file10_3200", "508b8ffd"], ["file11_100", "d462e3a"], ["file11_200", "f009063"], ["file11_1000", "325a40bd"], ["file11_1050", "4f2db4f8"], ["file11_1100", "33982a8a"], ["file11_1200", "31de94d3"], ["file11_1250", "4ca96096"], ["file11_1300", "301cfee4"], ["file11_1400", "3553e861"], ["file11_1450", "48241c24"], ["file11_1500", "34918256"], ["file11_1550", "49e67613"], ["file11_1600", "36d73c0f"], ["file11_1700", "37155638"], ["file11_1750", "4a62a27d"], ["file11_1760", "614ff1be"], ["file11_1770", "7854c0ff"], ["file11_1775", "83e3470"], ["file11_1780", "7fccdc30"], ["file11_1800", "3c491105"], ["file11_1850", "413ee540"], ["file11_1900", "3d8b7b32"], ["file11_1950", "40fc8f77"], ["file11_2000", "20efef53"], ["file11_2030", "bc2bc90"], ["file11_2040", "44832a57"], ["file11_2050", "5d981b16"], ["file11_2100", "212d8564"], ["file11_2200", "236b3b3d"], ["file11_2250", "5e1ccf78"], ["file11_2300", "22a9510a"], ["file11_2350", "5fdea54f"], ["file11_2400", "27e6478f"], ["file11_2500", "26242db8"], ["file11_2600", "246293e1"], ["file11_2700", "25a0f9d6"], ["file11_2800", "2efcbeeb"], ["file11_2900", "2f3ed4dc"], ["file11_2950", "52492099"], ["file11_2980", "67e75ed4"], ["file11_3000", "18538836"], ["file11_3100", "1991e201"], ["file11_3200", "1bd75c58"], ["file11_3300", "1a15366f"], ["file12_100", "4ae654ea"], ["file12_150", "3791a0af"], ["file12_175", "75cd36a2"], ["file12_200", "48a0eab3"], ["file17_100", "206db9a"], ["CASE0", "73ce13a1"], ["case0_50", "59c0db04"], ["FILE", "c9f3610"], ["File_Scenario", "f154745"], ["CASE", "78089904"], ["Main_Scenario", "6767d9ad"], ["q2100_counter", "6f6a3742"], ["q2101_counter", "78112301"], ["q2103_counter", "56e70b87"], ["q3110_counter", "1b0d1013"], ["q2200_counter", "76885143"], ["q2201_counter", "61f34500"], ["q2202_counter", "587e79c5"], ["q2203_counter", "4f056d86"], ["q3200_counter", "6d2d1d2c"], ["q3201_counter", "7a56096f"], ["q3203_counter", "54a021e9"], ["q3204_counter", "30c14c20"], ["q3205_counter", "27ba5863"], ["q3206_counter", "1e3764a6"], ["q64e1_counter", "557df930"], ["q64e2_counter", "6cf0c5f5"], ["qc000_counter", "93afee1"], ["qc001_counter", "1e41eaa2"], ["qc002_counter", "27ccd667"], ["qc003_counter", "30b7c224"], ["qc004_counter", "54d6afed"], ["qc005_counter", "43adbbae"], ["qc006_counter", "7a20876b"], ["qc007_counter", "6d5b9328"], ["qc008_counter", "32e25cf9"], ["qc009_counter", "259948ba"], ["qc00a_counter", "6c13abd4"], ["qc00b_counter", "559e9711"], ["q2300_counter", "37068e83"], ["q2305_counter", "7d91cbcc"], ["q2306_counter", "441cf709"], ["q2307_counter", "5367e34a"], ["q2308_counter", "cde2c9b"], ["q2350_counter", "512f45c7"], ["q2360_counter", "3a18fec4"], ["q2362_counter", "14eed642"], ["q2365_counter", "708fbb8b"], ["q2370_counter", "55da95fa"], ["q3300_counter", "2ca3c2ec"], ["q3302_counter", "255ea6a"], ["q3303_counter", "152efe29"], ["q3304_counter", "714f93e0"], ["q3305_counter", "663487a3"], ["q3306_counter", "5fb9bb66"], ["q3312_counter", "6d978154"], ["q3313_counter", "7aec9517"], ["q3314_counter", "1e8df8de"], ["q3315_counter", "9f6ec9d"], ["q3316_counter", "307bd058"], ["q3320_counter", "285612d1"], ["q3325_counter", "62c1579e"], ["q3350_counter", "4a8a09a8"], ["q6000_counter", "2de2d3fd"], ["q6001_counter", "3a99c7be"], ["q6002_counter", "314fb7b"], ["q6003_counter", "146fef38"], ["q600a_counter", "48cb86c8"], ["q6420_counter", "19ce7042"], ["qc030_counter", "620d45e2"], ["qc031_counter", "757651a1"], ["qc032_counter", "4cfb6d64"], ["qc033_counter", "5b807927"], ["qc800_counter", "33f91fa4"], ["q2400_counter", "1e3d9b00"], ["q2401_counter", "9468f43"], ["q2402_counter", "30cbb386"], ["q2403_counter", "27b0a7c5"], ["q2430_counter", "750a2003"], ["q2431_counter", "62713440"], ["q2432_counter", "5bfc0885"], ["q2433_counter", "4c871cc6"], ["q2434_counter", "28e6710f"], ["q2435_counter", "3f9d654c"], ["q2436_counter", "6105989"], ["q2460_counter", "1323eb47"], ["q2461_counter", "458ff04"], ["q3400_counter", "598d76f"], ["q3401_counter", "12e3c32c"], ["q3402_counter", "2b6effe9"], ["q3403_counter", "3c15ebaa"], ["q3404_counter", "58748663"], ["q3430_counter", "6eaf6c6c"], ["q3431_counter", "79d4782f"], ["q6460_counter", "1025d038"], ["q2510_counter", "30712ffe"], ["q2515_counter", "7ae66ab1"], ["q2520_counter", "5b4694fd"], ["q2525_counter", "11d1d1b2"], ["q2530_counter", "3484ffc3"], ["q2540_counter", "5658e4ba"], ["q2550_counter", "399a8f84"], ["q3510_counter", "2bd46391"], ["q3520_counter", "40e3d892"], ["q3525_counter", "a749ddd"], ["q3530_counter", "2f21b3ac"], ["q3531_counter", "385aa7ef"], ["q3540_counter", "4dfda8d5"], ["q3545_counter", "76aed9a"], ["q3560_counter", "490878e8"], ["q6180_counter", "7fbb4cc9"], ["q6181_counter", "68c0588a"], ["q2620_counter", "42a4f2fc"], ["q2625_counter", "833b7b3"], ["q2630_counter", "2d6699c2"], ["q2631_counter", "3a1d8d81"], ["q2635_counter", "67f1dc8d"], ["q2638_counter", "16be3bda"], ["q2650_counter", "2078e985"], ["q2665_counter", "1d817c9"], ["q2680_counter", "55866235"], ["q2690_counter", "3a44090b"], ["q26b0_counter", "7bb074b4"], ["q26b5_counter", "312731fb"], ["q26d5_counter", "3c3941bc"], ["q26e5_counter", "53fb2a82"], ["q26f0_counter", "725bd4ce"], ["q3603_counter", "6479526b"], ["q3605_counter", "17632be1"], ["q3610_counter", "32360590"], ["q3612_counter", "1cc02d16"], ["q3614_counter", "6fda549c"], ["q3620_counter", "5901be93"], ["q3630_counter", "36c3d5ad"], ["q3635_counter", "7c5490e2"], ["q3640_counter", "541fced4"], ["q3641_counter", "4364da97"], ["q3642_counter", "7ae9e652"], ["q3643_counter", "6d92f211"], ["q3644_counter", "9f39fd8"], ["q3645_counter", "1e888b9b"], ["q3646_counter", "2705b75e"], ["q3650_counter", "3bdda5ea"], ["q36f0_counter", "69fe98a1"], ["q61a0_counter", "3abae14b"], ["q61a1_counter", "2dc1f508"], ["q2730_counter", "6ce84602"], ["q2735_counter", "267f034d"], ["q2736_counter", "1ff23f88"], ["q2737_counter", "8892bcb"], ["q2738_counter", "5730e41a"], ["q2740_counter", "e345d7b"], ["q2745_counter", "44a31834"], ["q2750_counter", "61f63645"], ["q2765_counter", "4056c809"], ["q2770_counter", "6503e678"], ["q2790_counter", "7bcad6cb"], ["q2795_counter", "315d9384"], ["q3710_counter", "73b8da50"], ["q3712_counter", "5d4ef2d6"], ["q3714_counter", "2e548b5c"], ["q3716_counter", "a2a3da"], ["q3718_counter", "48607848"], ["q3740_counter", "15911114"], ["q3741_counter", "2ea0557"], ["q3750_counter", "7a537a2a"], ["q3760_counter", "1164c129"], ["q3765_counter", "5bf38466"], ["q3767_counter", "7505ace0"], ["q2810_counter", "7be562f9"], ["q2820_counter", "10d2d9fa"], ["q2825_counter", "5a459cb5"], ["q2826_counter", "63c8a070"], ["q2830_counter", "7f10b2c4"], ["q2831_counter", "686ba687"], ["q2832_counter", "51e69a42"], ["q2840_counter", "1dcca9bd"], ["q2850_counter", "720ec283"], ["q2851_counter", "6575d6c0"], ["q2852_counter", "5cf8ea05"], ["q2860_counter", "19397980"], ["q2862_counter", "37cf5106"], ["q2870_counter", "76fb12be"], ["q2880_counter", "7f04933"], ["q2885_counter", "4d670c7c"], ["q3820_counter", "b779595"], ["q3822_counter", "2581bd13"], ["q3830_counter", "64b5feab"], ["q3835_counter", "2e22bbe4"], ["q3840_counter", "669e5d2"], ["q3841_counter", "1112f191"], ["q3842_counter", "289fcd54"], ["q3850_counter", "69ab8eec"], ["q3851_counter", "7ed09aaf"], ["q6480_counter", "eece08b"], ["q2905_counter", "1f3e9348"], ["q2910_counter", "3a6bbd39"], ["q2920_counter", "515c063a"], ["q2930_counter", "3e9e6d04"], ["q2940_counter", "5c42767d"], ["q2950_counter", "33801d43"], ["q2960_counter", "58b7a640"], ["q2970_counter", "3775cd7e"], ["q2980_counter", "467e96f3"], ["q3910_counter", "21cef156"], ["q3920_counter", "4af94a55"], ["q3940_counter", "47e73a12"], ["q3950_counter", "2825512c"], ["q64c0_counter", "4f189d34"], ["q64c1_counter", "58638977"], ["q2a10_counter", "78168158"], ["q2a11_counter", "6f6d951b"], ["q2a15_counter", "3281c417"], ["q2a20_counter", "13213a5b"], ["q2a30_counter", "7ce35165"], ["q2a40_counter", "1e3f4a1c"], ["q2a45_counter", "54a80f53"], ["q2a46_counter", "6d253396"], ["q2a50_counter", "71fd2122"], ["q2a55_counter", "3b6a646d"], ["q2a60_counter", "1aca9a21"], ["q2a70_counter", "7508f11f"], ["q2a80_counter", "403aa92"], ["q2a90_counter", "6bc1c1ac"], ["q2aa0_counter", "41020710"], ["q2ab0_counter", "2a35bc13"], ["q3a00_counter", "c71a609"], ["q3a10_counter", "63b3cd37"], ["q3a20_counter", "8847634"], ["q3a30_counter", "67461d0a"], ["q3a40_counter", "59a0673"], ["q3a50_counter", "6a586d4d"], ["q3a60_counter", "16fd64e"], ["q3a70_counter", "6eadbd70"], ["q2b00_counter", "e368c67"], ["q2b05_counter", "44a1c928"], ["q2b10_counter", "61f4e759"], ["q2b15_counter", "2b63a216"], ["q2b20_counter", "ac35c5a"], ["q2b80_counter", "1de1cc93"], ["q2b83_counter", "246cf056"], ["q2b85_counter", "577689dc"], ["q2b90_counter", "7223a7ad"], ["q2b95_counter", "38b4e2e2"], ["q2ba0_counter", "58e06111"], ["q2ba5_counter", "1277245e"], ["q2baa_counter", "3dc93424"], ["q2bb0_counter", "33d7da12"], ["q2bb5_counter", "79409f5d"], ["q2bc0_counter", "5c15b12c"], ["q2bff_counter", "3b744294"], ["q3b05_counter", "5f048547"], ["q3b10_counter", "7a51ab36"], ["q3b20_counter", "11661035"], ["qc700_counter", "2001eb62"], ["q2c00_counter", "4fb853a7"], ["q2c01_counter", "58c347e4"], ["q2c02_counter", "614e7b21"], ["q2c03_counter", "76356f62"], ["q2c04_counter", "125402ab"], ["q2c05_counter", "52f16e8"], ["q2c06_counter", "3ca22a2d"], ["q2c07_counter", "2bd93e6e"], ["q2c08_counter", "7460f1bf"], ["q2c09_counter", "631be5fc"], ["q2c0f_counter", "4ef06b5b"], ["q2c10_counter", "207a3899"], ["q2c11_counter", "37012cda"], ["q2c12_counter", "e8c101f"], ["q2c13_counter", "19f7045c"], ["q2c14_counter", "7d966995"], ["q2c15_counter", "6aed7dd6"], ["q2c16_counter", "53604113"], ["q2c30_counter", "248fe8a4"], ["q2c31_counter", "33f4fce7"], ["q2c32_counter", "a79c022"], ["q2c41_counter", "5128e79e"], ["q2c42_counter", "68a5db5b"], ["q2c43_counter", "7fdecf18"], ["q2c44_counter", "1bbfa2d1"], ["q2c51_counter", "3eea8ca0"], ["q2c52_counter", "767b065"], ["q2c53_counter", "101ca426"], ["q2c54_counter", "747dc9ef"], ["q2c55_counter", "6306ddac"], ["q2c56_counter", "5a8be169"], ["q2c57_counter", "4df0f52a"], ["q2c58_counter", "12493afb"], ["q2c59_counter", "5322eb8"], ["q2c60_counter", "42a623e0"], ["q2c61_counter", "55dd37a3"], ["q2c62_counter", "6c500b66"], ["q2c63_counter", "7b2b1f25"], ["q2c64_counter", "1f4a72ec"], ["q2c65_counter", "83166af"], ["q2c66_counter", "31bc5a6a"], ["q2c67_counter", "26c74e29"], ["q2c80_counter", "5c6f1353"], ["q2c81_counter", "4b140710"], ["q2c91_counter", "24d66c2e"], ["q2c92_counter", "1d5b50eb"], ["q2c93_counter", "a2044a8"], ["q2c94_counter", "6e412961"], ["q2ca1_counter", "e15aa92"], ["q2ca2_counter", "37989657"], ["q2ca3_counter", "20e38214"], ["q2ca4_counter", "4482efdd"], ["q2ca5_counter", "53f9fb9e"], ["q2ca6_counter", "6a74c75b"], ["q2ca7_counter", "7d0fd318"], ["q2ca8_counter", "22b61cc9"], ["q2ca9_counter", "35cd088a"], ["q2cb0_counter", "725905d2"], ["q2cb1_counter", "65221191"], ["q2cb2_counter", "5caf2d54"], ["q2cb3_counter", "4bd43917"], ["q2cb4_counter", "2fb554de"], ["q2cb5_counter", "38ce409d"], ["q2cb6_counter", "1437c58"], ["q2cb7_counter", "1638681b"], ["q2cc0_counter", "1d9b6eec"], ["q2cc1_counter", "ae07aaf"], ["q2cd1_counter", "683c61d6"], ["q2cd2_counter", "51b15d13"], ["q2cd3_counter", "46ca4950"], ["q2cd4_counter", "22ab2499"], ["q2cd5_counter", "35d030da"], ["q2cd8_counter", "449fd78d"], ["q2cd9_counter", "53e4c3ce"], ["qc810_counter", "5c3b749a"]]

function hashDropdown(name: string) {
    return {
        "type": "field_dropdown",
        "options": hashDropdownOptions,
        name
    }
}

export const hashValueDropdownOptions = [["INVALID VALUE!", "1"], ["FILE00", "3d3e1ff7"], ["increment by 1", "0"], ["FILE01", "4a392f61"], ["FILE02", "53307edb"], ["FILE03", "24374e4d"], ["FILE04", "3a53dbee"], ["FILE05", "4d54eb78"], ["FILE06", "545dbac2"], ["FILE07", "235a8a54"], ["FILE08", "33e597c5"], ["FILE09", "44e2a753"], ["FILE10", "24252eb6"], ["FILE11", "53221e20"], ["FILE12", "4a2b4f9a"], ["file00_100", "7b7ad42f"], ["file01_100", "461afd9f"], ["file01_200", "445c43c6"], ["file01_300", "459e29f1"], ["file01_400", "40d13f74"], ["file01_500", "41135543"], ["file01_600", "4355eb1a"], ["file01_700", "4297812d"], ["file01_720", "70a1e3af"], ["file01_740", "26fb4429"], ["file01_760", "14cd26ab"], ["file01_800", "49cbc610"], ["file01_850", "34bc3255"], ["file01_900", "4809ac27"], ["file01_1000", "142d4b09"], ["file01_1100", "15ef213e"], ["file01_1105", "6585d5b1"], ["file01_1110", "cf4107f"], ["file01_1120", "27d943bc"], ["file01_1200", "17a99f67"], ["file01_1220", "259ffde5"], ["file01_1230", "3c84cca4"], ["file01_1250", "6ade6b22"], ["file01_1300", "166bf550"], ["file02_100", "1ba874f"], ["file02_150", "7ccd730a"], ["file02_200", "3fc3916"], ["file02_300", "23e5321"], ["file02_350", "7f49a764"], ["file02_370", "4d7fc5e6"], ["file02_400", "77145a4"], ["file02_500", "6b32f93"], ["file02_600", "4f591ca"], ["file02_1000", "12b939a7"], ["file02_1050", "6fcecde2"], ["file02_1100", "137b5390"], ["file02_1130", "38560053"], ["file02_1150", "6e0ca7d5"], ["file02_1200", "113dedc9"], ["file02_1250", "6c4a198c"], ["file02_1300", "10ff87fe"], ["file02_1400", "15b0917b"], ["file02_1450", "68c7653e"], ["file02_1500", "1472fb4c"], ["file02_1600", "16344515"], ["file02_1700", "17f62f22"], ["file02_2000", "c9649"], ["file02_2050", "7d7b620c"], ["file02_2100", "1cefc7e"], ["file02_2150", "7cb9083b"], ["file02_2200", "3884227"], ["file02_2300", "24a2810"], ["file02_2350", "7f3ddc55"], ["file02_2400", "7053e95"], ["file02_2500", "6c754a2"], ["file02_2600", "481eafb"], ["file02_3000", "38b0f12c"], ["file02_3100", "39729b1b"], ["file03_100", "3cdaaeff"], ["file03_110", "25c19fbe"], ["file03_150", "41ad5aba"], ["file03_200", "3e9c10a6"], ["file03_250", "43ebe4e3"], ["file03_300", "3f5e7a91"], ["file03_400", "3a116c14"], ["file03_450", "47669851"], ["file03_470", "7550fad3"], ["file03_500", "3bd30623"], ["file03_600", "3995b87a"], ["file03_700", "3857d24d"], ["file03_800", "330b9570"], ["file03_900", "32c9ff47"], ["file03_1100", "58278035"], ["file03_1200", "5a613e6c"], ["file03_1300", "5ba3545b"], ["file03_1400", "5eec42de"], ["file03_1500", "5f2e28e9"], ["file03_1600", "5d6896b0"], ["file03_1700", "5caafc87"], ["file03_1800", "57f6bbba"], ["file03_2000", "4b5045ec"], ["file03_2100", "4a922fdb"], ["file03_2150", "37e5db9e"], ["file03_2200", "48d49182"], ["file03_2300", "4916fbb5"], ["file03_2400", "4c59ed30"], ["file04_100", "efa72ef"], ["file04_150", "738d86aa"], ["file04_200", "cbcccb6"], ["file04_300", "d7ea681"], ["file04_400", "831b004"], ["file04_500", "9f3da33"], ["file04_600", "bb5646a"], ["file04_700", "a770e5d"], ["file04_800", "12b4960"], ["file04_900", "e92357"], ["file04_1000", "44e0daba"], ["file04_1100", "4522b08d"], ["file04_1125", "77e2680"], ["file04_1150", "385544c8"], ["file04_1200", "47640ed4"], ["file04_1300", "46a664e3"], ["file04_1400", "43e97266"], ["file04_1500", "422b1851"], ["file04_2000", "56557554"], ["file04_2100", "57971f63"], ["file04_2110", "4e8c2e22"], ["file04_2250", "28a6557f"], ["file04_2300", "5413cb0d"], ["file04_2320", "6625a98f"], ["file04_2350", "29643f48"], ["file04_2400", "515cdd88"], ["file04_2450", "2c2b29cd"], ["file04_2500", "509eb7bf"], ["file04_2600", "52d809e6"], ["file04_2700", "531a63d1"], ["file04_2800", "584624ec"], ["file04_2900", "59844edb"], ["file04_3000", "6ee91231"], ["file05_100", "339a5b5f"], ["file05_200", "31dce506"], ["file05_300", "301e8f31"], ["file05_400", "355199b4"], ["file05_500", "3493f383"], ["file05_550", "49e407c6"], ["file05_600", "36d54dda"], ["file05_700", "371727ed"], ["file05_800", "3c4b60d0"], ["file05_850", "413c9495"], ["file05_900", "3d890ae7"], ["file05_1000", "fbc091f"], ["file05_1100", "e7e6328"], ["file05_1200", "c38dd71"], ["file05_1300", "dfab746"], ["file05_1400", "8b5a1c3"], ["file05_1500", "977cbf4"], ["file05_1600", "b3175ad"], ["file05_1700", "af31f9a"], ["file05_1750", "7784ebdf"], ["file05_1800", "1af58a7"], ["file05_1900", "6d3290"], ["file05_2000", "1d09a6f1"], ["file05_2100", "1ccbccc6"], ["file05_2150", "61bc3883"], ["file05_2160", "4a916b40"], ["file05_2200", "1e8d729f"], ["file05_2300", "1f4f18a8"], ["file05_2400", "1a000e2d"], ["file05_2500", "1bc2641a"], ["file06_100", "743a218f"], ["file06_200", "767c9fd6"], ["file06_300", "77bef5e1"], ["file06_400", "72f1e364"], ["file06_450", "f861721"], ["file06_500", "73338953"], ["file06_550", "e447d16"], ["file06_590", "22f1321a"], ["file06_600", "7175370a"], ["file06_700", "70b75d3d"], ["file06_720", "42813fbf"], ["file06_800", "7beb1a00"], ["file06_900", "7a297037"], ["file06_950", "75e8472"], ["file06_955", "773470fd"], ["file06_960", "2c73d7b1"], ["file06_1000", "9287bb1"], ["file06_1100", "8ea1186"], ["file06_1110", "11f120c7"], ["file06_1120", "3adc7304"], ["file06_1140", "6c86d482"], ["file06_1160", "5eb0b600"], ["file06_1180", "40339b8e"], ["file06_1200", "aacafdf"], ["file06_1300", "b6ec5e8"], ["file06_1400", "e21d36d"], ["file06_1420", "3c17b1ef"], ["file06_1425", "4c7d4560"], ["file06_1430", "250c80ae"], ["file06_1435", "55667421"], ["file06_1440", "6a4d1669"], ["file06_1445", "1a27e2e6"], ["file06_1447", "742983ca"], ["file06_1450", "73562728"], ["file06_1500", "fe3b95a"], ["file06_1600", "da50703"], ["file06_1700", "c676d34"], ["file06_1800", "73b2a09"], ["file07_100", "495a083f"], ["file07_200", "4b1cb666"], ["file07_300", "4adedc51"], ["file07_400", "4f91cad4"], ["file07_500", "4e53a0e3"], ["file07_600", "4c151eba"], ["file07_700", "4dd7748d"], ["file07_800", "468b33b0"], ["file07_900", "47495987"], ["file07_1000", "4274a814"], ["file07_1100", "43b6c223"], ["file07_1200", "41f07c7a"], ["file07_1300", "4032164d"], ["file07_1400", "457d00c8"], ["file07_1450", "380af48d"], ["file07_1500", "44bf6aff"], ["file07_1600", "46f9d4a6"], ["file07_1700", "473bbe91"], ["file07_1800", "4c67f9ac"], ["file08_100", "4b0a9fee"], ["file08_200", "494c21b7"], ["file08_300", "488e4b80"], ["file08_400", "4dc15d05"], ["file08_500", "4c033732"], ["file08_600", "4e45896b"], ["file08_650", "33327d2e"], ["file08_700", "4f87e35c"], ["file08_800", "44dba461"], ["file08_850", "39ac5024"], ["file08_900", "4519ce56"], ["file08_1000", "33221ac1"], ["file08_1100", "32e070f6"], ["file08_1200", "30a6ceaf"], ["file09_100", "766ab65e"], ["file09_120", "445cd4dc"], ["file09_150", "b1d421b"], ["file09_200", "742c0807"], ["file09_300", "75ee6230"], ["file09_400", "70a174b5"], ["file09_500", "71631e82"], ["file09_600", "7325a0db"], ["file09_700", "72e7caec"], ["file09_800", "79bb8dd1"], ["file09_900", "7879e7e6"], ["file09_1100", "79bca353"], ["file09_1200", "7bfa1d0a"], ["file09_1300", "7a38773d"], ["file09_1600", "7cf3b5d6"], ["file09_1700", "7d31dfe1"], ["file09_1800", "766d98dc"], ["file09_1900", "77aff2eb"], ["file09_2000", "6acb668a"], ["file09_2100", "6b090cbd"], ["file09_2200", "694fb2e4"], ["file09_2300", "688dd8d3"], ["file09_2400", "6dc2ce56"], ["file09_2500", "6c00a461"], ["file09_2600", "6e461a38"], ["file09_2700", "6f84700f"], ["file10_100", "3026078a"], ["file10_200", "3260b9d3"], ["file10_300", "33a2d3e4"], ["file10_400", "36edc561"], ["file10_500", "372faf56"], ["file10_600", "3569110f"], ["file10_700", "34ab7b38"], ["file10_800", "3ff73c05"], ["file10_900", "3e355632"], ["file10_1000", "79069318"], ["file10_1100", "78c4f92f"], ["file10_1200", "7a824776"], ["file10_1300", "7b402d41"], ["file10_1400", "7e0f3bc4"], ["file10_1500", "7fcd51f3"], ["file10_1600", "7d8befaa"], ["file10_1700", "7c49859d"], ["file10_1800", "7715c2a0"], ["file10_1900", "76d7a897"], ["file10_2000", "6bb33cf6"], ["file10_2100", "6a7156c1"], ["file10_2200", "6837e898"], ["file10_2300", "69f582af"], ["file10_2400", "6cba942a"], ["file10_2500", "6d78fe1d"], ["file10_2600", "6f3e4044"], ["file10_2700", "6efc2a73"], ["file10_2800", "65a06d4e"], ["file10_2900", "64620779"], ["file10_3000", "530f5b93"], ["file10_3100", "52cd31a4"], ["file10_3200", "508b8ffd"], ["file11_100", "d462e3a"], ["file11_200", "f009063"], ["file11_1000", "325a40bd"], ["file11_1050", "4f2db4f8"], ["file11_1100", "33982a8a"], ["file11_1200", "31de94d3"], ["file11_1250", "4ca96096"], ["file11_1300", "301cfee4"], ["file11_1400", "3553e861"], ["file11_1450", "48241c24"], ["file11_1500", "34918256"], ["file11_1550", "49e67613"], ["file11_1600", "36d73c0f"], ["file11_1700", "37155638"], ["file11_1750", "4a62a27d"], ["file11_1760", "614ff1be"], ["file11_1770", "7854c0ff"], ["file11_1775", "83e3470"], ["file11_1780", "7fccdc30"], ["file11_1800", "3c491105"], ["file11_1850", "413ee540"], ["file11_1900", "3d8b7b32"], ["file11_1950", "40fc8f77"], ["file11_2000", "20efef53"], ["file11_2030", "bc2bc90"], ["file11_2040", "44832a57"], ["file11_2050", "5d981b16"], ["file11_2100", "212d8564"], ["file11_2200", "236b3b3d"], ["file11_2250", "5e1ccf78"], ["file11_2300", "22a9510a"], ["file11_2350", "5fdea54f"], ["file11_2400", "27e6478f"], ["file11_2500", "26242db8"], ["file11_2600", "246293e1"], ["file11_2700", "25a0f9d6"], ["file11_2800", "2efcbeeb"], ["file11_2900", "2f3ed4dc"], ["file11_2950", "52492099"], ["file11_2980", "67e75ed4"], ["file11_3000", "18538836"], ["file11_3100", "1991e201"], ["file11_3200", "1bd75c58"], ["file11_3300", "1a15366f"], ["file12_100", "4ae654ea"], ["file12_150", "3791a0af"], ["file12_175", "75cd36a2"], ["file12_200", "48a0eab3"], ["file17_100", "206db9a"], ["CASE0", "73ce13a1"], ["case0_50", "59c0db04"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run30", "92aa7aa"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["hide", "2499cb2b"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["req100", "294fbb55"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run250", "3ee42102"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run999", "67d8394b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run_100", "542edd2e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run_100", "542edd2e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run10", "3b1cc528"], ["run20", "103196eb"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run1", "18e85ba3"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run50", "5f70002c"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["Hide", "2499cb2b"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["Hide", "2499cb2b"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run450", "3a695db0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run", "5076a4c0"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run10", "3b1cc528"], ["run20", "103196eb"], ["run30", "92aa7aa"], ["run40", "466b316d"], ["run50", "5f70002c"], ["run60", "745d53ef"], ["run70", "6d4662ae"], ["run80", "6ade7e61"], ["run90", "73c54f20"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run350", "3f264b35"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run450", "3a695db0"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run250", "3ee42102"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run10", "3b1cc528"], ["run20", "103196eb"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run999", "67d8394b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run999", "67d8394b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run200", "4393d547"], ["run210", "5a88e406"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run200", "4393d547"], ["run210", "5a88e406"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run200", "4393d547"], ["run210", "5a88e406"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run200", "4393d547"], ["run210", "5a88e406"], ["run300", "4251bf70"], ["run310", "5b4a8e31"], ["run320", "7067ddf2"], ["run330", "697cecb3"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["run1000", "e153729"], ["run1100", "fd75d1e"], ["run1200", "d91e347"], ["run1300", "c538970"], ["run1400", "91c9ff5"], ["run1500", "8def5c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run10", "3b1cc528"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run350", "3f264b35"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run310", "5b4a8e31"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run120", "73e3099c"], ["run130", "6af838dd"], ["run140", "25b9ae1a"], ["run150", "3ca29f5b"], ["run160", "178fcc98"], ["run170", "e94fdd9"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run120", "73e3099c"], ["run130", "6af838dd"], ["run140", "25b9ae1a"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["run1000", "e153729"], ["run1100", "fd75d1e"], ["run1200", "d91e347"], ["run1300", "c538970"], ["run1400", "91c9ff5"], ["run1500", "8def5c2"], ["run1600", "a984b9b"], ["run1700", "b5a21ac"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run250", "3ee42102"], ["run300", "4251bf70"], ["run350", "3f264b35"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["run1000", "e153729"], ["run1100", "fd75d1e"], ["run1200", "d91e347"], ["run1300", "c538970"], ["run1400", "91c9ff5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["rur600", "5e5595bc"], ["run700", "455817ac"], ["rur800", "54cbb8b6"], ["rur850", "29bc4cf3"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["rur600", "5e5595bc"], ["rur700", "5f97ff8b"], ["rur800", "54cbb8b6"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run200", "4393d547"], ["run210", "5a88e406"], ["run300", "4251bf70"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["run1000", "e153729"], ["run1100", "fd75d1e"], ["run1200", "d91e347"], ["run1300", "c538970"], ["run1400", "91c9ff5"], ["run1500", "8def5c2"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run1300", "c538970"], ["run1400", "91c9ff5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run550", "3bab3787"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["run1000", "e153729"], ["run1100", "fd75d1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run110", "58ce5a5f"], ["run120", "73e3099c"], ["run130", "6af838dd"], ["run140", "25b9ae1a"], ["run150", "3ca29f5b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run200", "4393d547"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["run1000", "e153729"], ["run1100", "fd75d1e"], ["run1200", "d91e347"], ["run1300", "c538970"], ["run1400", "91c9ff5"], ["run1500", "8def5c2"], ["run1600", "a984b9b"], ["run1700", "b5a21ac"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["run100", "41d56b1e"], ["run150", "3ca29f5b"], ["run200", "4393d547"], ["run250", "3ee42102"], ["run300", "4251bf70"], ["run400", "471ea9f5"], ["run500", "46dcc3c2"], ["run600", "449a7d9b"], ["run700", "455817ac"], ["run800", "4e045091"], ["run900", "4fc63aa6"], ["end", "fc33b1"], ["req", "17bcbb64"], ["run", "5076a4c0"], ["end", "fc33b1"]]

function hashValueDropdown(name: string) {
    return {
        "type": "field_dropdown",
        "options": hashValueDropdownOptions,
        name
    }
}

export const systemBlocks = [
    {
        "type": "task-start",
        "message0": "When LineList %1 called",
        "args0": [
            {
                "type": "field_number",
                "value": 255,
                "min": 0,
                "name": "taskno"
            }
        ],
        "nextStatement": null,
        "style": "hat_blocks"
    },
    {
        "type": "next-linelist",
        "message0": "Go to next LineList",
        "previousStatement": null,
        "style": "hat_blocks"
    },
    {
        "type": "unknown-if",
        "message0": "Unknown IF %1 %2 %3",
        "args0": [{"type": "field_number", "value": -1, "min": 0, "name": "typeIF"}, {"type": "input_dummy"}, {"type": "input_statement","name": "execarea","align": "CENTRE"}],
        "previousStatement": null,
        "nextStatement": null,
        "style": "logic_blocks"
    },
    {
        "type": "unknown-exec",
        "message0": "Unknown EXEC %1",
        "args0": [{"type": "field_number", "value": -1, "min": 0, "name": "typeEXEC"}],
        "previousStatement": null,
        "nextStatement": null,
        "style": "procedure_blocks"
    }
]

function ifCommand(alt="IFCommand") {
    return {
        "type": "field_dropdown",
        "name": alt,
        "options": [
            ["==", "0"],
            ["!=", "1"],
            [">", "2"],
            ["=>", "3"],
            ["<", "4"],
            ["<=", "5"]
        ]
    }
}
function trueFalse(name: string, trueStatement="true", falseStatement="false", def=true) {
    if (def) {
        return {
            "type": "field_dropdown",
            "name": name,
            "options": [
                [trueStatement, "1"],
                [falseStatement, "0"]
            ]
        }
    }
    return {
        "type": "field_dropdown",
        "name": name,
        "options": [
            [falseStatement, "0"],
            [trueStatement, "1"]
        ]
    }
}
function execDefine(type: string, msg: string, args: any[], extensions?: any[]): any {
    // @ts-ignore
    blockIds[type] = args.map(item => item['name']);
    return {
        "type": type,
        "message0": type.split("-")[1] + ") " + msg,
        "args0": args,
        "previousStatement": null,
        "nextStatement": null,
        "style": "procedure_blocks",
        "extensions": extensions
    }
}
function ifDefine(type: string, msg: string, args: any[], extensions?: string[]): any {
    var argslist = [...args, {"type": "input_dummy"}, {"type": "input_statement","name": "execarea","align": "CENTRE"}];
    // @ts-ignore
    blockIds[type] = [args.map(item => item['name'])];
    return {
        "type": type,
        "message0": type.split("-")[1] + ") " + msg + ` %${argslist.length-1} %${argslist.length}`,
        "args0": argslist,
        "previousStatement": null,
        "nextStatement": null,
        "style": "logic_blocks",
        "extensions": extensions
    }
}
// IF
export const ifBlocks = [
    ifDefine("if-1", "If Player in Area %1 of GroupNo %2 (Check: %3, Multiple: %4)", [
        {
            "type": "input_dummy",
            "name": "IFIndexNo_dummy"
        },
        {
            "type": "field_number",
            "name": "IFGroupNo",
            "value": 0,
            "min": 0
        },
        trueFalse("IFbCheck"),
        {
            "type": "field_dropdown",
            "name": "IFMultiple",
            "options": [
                ["true", "1"],
                ["false", "0"]
            ]
        }], ["zone"]
    ),
    ifDefine("if-38", "If GroupNo %1 is %2", [
        {
            "type": "field_input",
            "name": "IFGroupNo",
            "value": 0,
            "min": 0
        },
        trueFalse("IFbCheck", "alive", "dead")]
    ),
    ifDefine("if-2", "If # of Ems in GroupNo %1 %2 %3 (type %4)", [
        {
            "type": "field_number",
            "name": "IFGroupNo",
            "value": 0,
            "min": 0
        },
        ifCommand(),
        {
            "type": "field_number",
            "name": "IFValue",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "IfType",
            "value": 0,
            "min": 0
        }]
    ),
    ifDefine("if-3", "If Global Flag %1 is not %2", [
        hashDropdown("IFHash"),
        trueFalse("IFbCheck")]
    ),
    ifDefine("if-4", "If Flag %1 of quest %2 is %3", [
        {
            "type": "input_dummy",
            "name": "IFFlagNo_dummy",
        },
        {
            "type": "field_input",
            "name": "IFQuestId",
            "text": "0000"
        },
        trueFalse("IFbCheck")]
    , ["questflag"]),
    ifDefine("if-5", "If Counter %1 %2 %3", [
        {
            "type": "field_number",
            "name": "IFCntNo",
            "value": 0,
            "min": 0
        },
        ifCommand(),
        {
            "type": "field_number",
            "name": "IFValue",
            "value": 0,
            "min": 0
        },
    ]),
    //ifDefine("if-6", "*** UNKNOWN ***", []),
    ifDefine("if-7", "If Flag %1 of quest %2 is %3", [
        {
            "type": "input_dummy",
            "name": "IFFlagNo_dummy"
        },
        {
            "type": "field_number",
            "name": "IFQuestId",
            "value": 0,
            "min": 0
        },
        trueFalse("IFbCheck")],
    ["questflag"]),
    ifDefine("if-8", "If Counter %1 %2 %3", [
        {
            "type": "field_number",
            "name": "IFCntNo",
            "value": 0,
            "min": 0
        },
        ifCommand(),
        {
            "type": "field_number",
            "name": "IFValue",
            "value": 0,
            "min": 0
        },
    ]),
    //ifDefine("if-9", "*** UNKNOWN ***", []),
    ifDefine("if-10", "If Event %1 %2 state %3 (type %4)", [
        {
            "type": "field_input",
            "name": "EventNo",
            "value": "0000",
        },
        ifCommand("Condition"),
        {
            "type": "field_number",
            "name": "EventState",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "EventType",
            "value": 0,
            "min": 0
        },
    ]),
    ifDefine("if-11", "If Global Flag %1 %2: %3, %4", [
        hashDropdown("IFHash"),
        {
            "type": "field_dropdown",
            "name": "IFCondition",
            "options": [
                ["< first value", "0"],
                ["> first value", "1"], // confirmed
                ["<= first value", "2"],
                ["=> first value", "3"], // confirmed
                ["== first value", "4"], // confirmed
                ["is between", "5"] // confirmed
            ]
        },
        hashValueDropdown("IFValueHash"),
        hashValueDropdown("IFValue2Hash")
        ]
    ),

    ifDefine("if-14", "If Player has %1 %2x of item %3", [
        ifCommand("HasItemCondition"),
        {
            "type": "field_number",
            "name": "HasItemValue",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_input",
            "name": "HasItemId",
            "text": "000000"
        },
        ]
    ),
    ifDefine("if-15", "If Em %1 of EmSet %2 %3 in AreaGroup %4 Index %5 (isGroup %6)", [
        {
            "type": "field_number",
            "name": "IfEmSetNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "IfEmGroupNo",
            "value": 0,
            "min": 0
        },
        trueFalse("IfCheck", "is not", "is"),
        {
            "type": "field_number",
            "name": "IfAreaGroup",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "IfAreaIndex",
            "value": 0,
            "min": 0
        },
        trueFalse("IfIsGroup")
        ]
    ),
    ifDefine("if-16", "If SetNo %1 of GroupNo %2 %3 %4 (isGroup %5)", [
        {
            "type": "field_number",
            "name": "IfEmSetNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "IfEmGroupNo",
            "value": 0,
            "min": 0
        },
        ifCommand("IfCondition"),
        {
            "type": "field_number",
            "name": "IfValue",
            "value": 0
        },
        trueFalse("IfIsGroup")]
    ),
    ifDefine("if-17", "If state of Quest %1 %2 %3", [
        {
            "type": "field_input",
            "name": "IfQuestId",
            "text": "0000"
        },
        ifCommand("IfCondition"),
        trueFalse("IfbCheck", "done", "not done")]
    ),

    ifDefine("if-20", "If score on Quest %1 %2 %3", [
        {
            "type": "field_input",
            "name": "IfSubQuestCompQuestId",
            "text": "0000"
        },
        {
            "type": "field_dropdown",
            "name": "IfCondition",
            "options": [
                [">=", "0"],
                ["!=", "1"],
                [">", "2"],
                ["=>", "3"],
                ["<", "4"],
                ["<=", "5"]
            ]
        },
        {
            "type": "field_number",
            "name": "IfSubQuestCompScore",
            "value": 0,
            "min": 0
        }]
    ),

    ifDefine("if-22", "If dialogue box %1", [
        trueFalse("bCheck", "closed", "open")]
    ),

    ifDefine("if-26", "If Player is %1 an Astral Plane arena", [
        trueFalse("IFIsCombatBarrier", "inside", "outside")]
    ),
    ifDefine("if-27", "If fade transition is %1 (type %2)", [
        trueFalse("IFbCheck", "active", "inactive"),
        {
            "type": "field_number",
            "name": "IFType",
            "value": 0,
            "min": 0
        }]
    ),
    ifDefine("if-28", "If SaveFlag %1 of quest %2 is %3", [
        {
            "type": "input_dummy",
            "name": "IFFlagNo_dummy"
        },
        {
            "type": "field_number",
            "name": "IFQuestId",
            "value": 0,
            "min": 0
        },
        trueFalse("IFbCheck")],
        ["saveflag"]
    ),
    
    ifDefine("if-30", "If playing event is %1", [
        trueFalse("IFbCheck", "over", "not over")]
    ),
    ifDefine("if-31", "If Player %1 red word %2", [
        trueFalse("IFbCheck", "has", "does not have"),
        {
            "type": "field_input",
            "name": "IFId",
            "text": "000"
        },
    ]
    ),

    ifDefine("if-33", "If %1", [
        trueFalse("IFbCheck")]
    ),
    ifDefine("if-35", "If Player is %1", [
        trueFalse("IFbCheck", "not moving", "moving")]
    ),
    ifDefine("if-36", "If %1", [
        trueFalse("IFbCheck")]
    ),
    ifDefine("if-37", "If SetNo %1 of GroupNo %2 %3 %4 (isGroup %5)", [
        {
            "type": "field_number",
            "name": "IfEmSetNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "IfEmGroupNo",
            "value": 0,
            "min": 0
        },
        ifCommand("IfCondition"),
        {
            "type": "field_number",
            "name": "IfValue",
            "value": 0
        },
        trueFalse("IfIsGroup")]
    ),
];


// EXEC
export const execBlocks = [
    //execDefine("exec-1", "Execute next task fasfa", []),
    (() => {let def = execDefine("exec-2", "%2 %1", [
        {
            "type": "field_number",
            "name": "EXECLine",
            "value": 0,
            "min": 0
        },
        trueFalse("EXECIsNextLine", "Execute next LineList in sequence", "Execute LineList #")
    ]); def['nextStatement'] = undefined; return def })(),
    execDefine("exec-3", "%2 %1", [
        {
            "type": "field_number",
            "name": "EXECLine",
            "value": 0,
            "min": 0
        },
        trueFalse("EXECIsNextLine", "Execute next LineList in sequence", "Execute LineList #")
    ]),
    execDefine("exec-4", "Wait %1 seconds", [{
        "type": "field_number",
        "name": "EXECTimer",
        "value": 0,
        "min": 0
    }]),
    execDefine("exec-5", "Load GroupNo %1 (setMax %2)", [
        {
            "type": "input_dummy",
            "name": "EXECGroupNo_dummy",
        },
        trueFalse("EXECSetMax"),
    ], ["emgroup"]),
    execDefine("exec-6", "Unload GroupNo %1", [
        {
            "type": "input_dummy",
            "name": "EXECGroupNo_dummy",
        },
    ], ["emgroup"]),
    execDefine("exec-7", "Load event %1 from PhaseNo %2 (EventType %3, ExecType %4, PreRead %5) [CHAIN %6: EventNo %7, PhaseNo %8, type %9] [FADEIN %10: Color: %11, type %12] [FADEOUT %13: CanFadeIn %14, Color: %15, type %16] [START %17: (%18, %19, %20, %21deg), OFFSET %22: (%23, %24, %25, rotX %26deg, rotY %27deg)", [
        {
            "type": "field_input",
            "name": "EXECEventNo",
            "text": "0000"
        },
        {
            "type": "field_input",
            "name": "EXECEventPhaseNo",
            "text": "-1"
        },
        {
            "type": "field_number",
            "name": "EXECEventType",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecType",
            "value": 0
        },
        trueFalse("EXECEventPreRead", undefined, undefined, false),
        trueFalse("EXECEventExecUseChainEvent", "enabled", "disabled", false),
        {
            "type": "field_input",
            "name": "EXECEventChainEventNo",
            "text": "0000"
        },
        {
            "type": "field_input",
            "name": "EXECEventChainPhaseNo",
            "text": "-1"
        },
        {
            "type": "field_number",
            "name": "EXECEventChainExecType",
            "value": 0
        },
        trueFalse("EXECEventExecUseBeginFade", "enabled", "disabled", false),
        {
            "type": "field_colour",
            "name": "EXECEventExecBeginFadeColor",
            "value": "0xFF000000"
        },
        {
            "type": "field_number",
            "name": "EXECEventExecBeginFadeType",
            "value": 1
        },
        trueFalse("EXECEventExecUseEndFade", "enabled", "disabled", false),
        trueFalse("EXECEventExecEndFadeCanFadeIn"), // usually true first
        {
            "type": "field_colour",
            "name": "EXECEventExecEndFadeColor",
            "value": "0xFF000000"
        },
        {
            "type": "field_number",
            "name": "EXECEventExecEndFadeType",
            "value": 0
        },
        trueFalse("EXECEventExecbSetStartPos", "enabled", "disabled", false),
        {
            "type": "field_number",
            "name": "EXECEventExecStartPosX",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecStartPosY",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecStartPosZ",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecStartRotY",
            "value": 0
        },
        trueFalse("EXECEventExecbSetOffsetPos", "enabled", "disabled", false),
        {
            "type": "field_number",
            "name": "EXECEventExecOffsetPosX",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecOffsetPosY",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecOffsetPosZ",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecOffsetRotX",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "EXECEventExecOffsetRotY",
            "value": 0
        }
    ]),
    execDefine("exec-8", "Set Global Flag %1 to %2", [
        hashDropdown("ExecHash"),
        trueFalse("ExecbCheck")]
    ),
    execDefine("exec-9", "Set QuestFlag %1 to %2", [
        {
            "type": "input_dummy",
            "name": "ExecFlagNo_dummy",
        },
        trueFalse("ExecbCheck")
    ], ["questflag"]),
    execDefine("exec-10", "Set Counter %1 %2 %3 or %4", [
        {
            "type": "field_number",
            "name": "ExecCntNo",
            "value": 0,
            "min": 0
        },
        ifCommand("ExecCommand"),
        {
            "type": "field_number",
            "name": "ExecValue1",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecValue2",
            "value": 0,
            "min": 0
        }
    ]),

    execDefine("exec-12", "Set QuestFlag %1 to %2", [
        {
            "type": "input_dummy",
            "name": "ExecFlagNo_dummy",
        },
        trueFalse("ExecbCheck")
    ], ["questflag"]),

    execDefine("exec-15", "Teleport player to (%1, %2, %3), Rot %4deg (Use fade %5, fade color %6)", [
        {
            "type": "field_number",
            "name": "ExecPosX",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "ExecPosY",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "ExecPosZ",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "ExecRotY",
            "value": 0
        },
        trueFalse("ExecUseFade"),
        {
            "type": "field_colour",
            "name": "ExecFadeColor",
            "value": "0000"
        },
    ]),
    execDefine("exec-16", "Load New Area Data from Quest %1, PhaseNo %2, SubPhaseIndex %3 (POS %4, %5, %6, %7deg), LoadingType %8 (IsSet %9, IsCountUp %10)", [
        {
            "type": "field_input",
            "name": "ExecQuestId",
            "text": "0000"
        },
        {
            "type": "field_number",
            "name": "ExecPhaseNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecSubPhaseIndex",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecPosX",
            "value": 0,
        },
        {
            "type": "field_number",
            "name": "ExecPosY",
            "value": 0,
        },
        {
            "type": "field_number",
            "name": "ExecPosZ",
            "value": 0,
        },
        {
            "type": "field_number",
            "name": "ExecRotY",
            "value": 0,
        },
        {
            "type": "field_dropdown",
            "name": "ExecLoadingType",
            "options": [
                ["Default", "0"],
                ["Astral Plane [debug]", "1"],
                ["Astral Plane [player]", "2"],
                ["Astral Plane [no player]", "3"]
            ]
        },
        trueFalse("ExecIsSet"),
        trueFalse("ExecIsCountUp")
    ]),

    execDefine("exec-18", "%1 Button Prompt Dialog Box (Tip %2)", [
        {
            "type": "field_dropdown",
            "name": "ExecDispTipsEnable",
            "options": [
                ["enable", "1"],
                ["disable", "0"]
            ]
        },
        {
            "type": "field_number",
            "name": "ExecDispTipsNo",
            "value": -1,
            "min": -1
        }
    ]),

    execDefine("exec-20", "Set counter at Hash %1 to %2 (counter type %3)", [
        hashDropdown("ExecCounterHash"),
        hashValueDropdown("ExecCounterValueHash"),
        {
            "type": "field_number",
            "name": "ExecCounterType",
            "value": 1,
            "min": 0
        }
    ]),
    execDefine("exec-21", "Load GroupNo %1", [
        {
            "type": "input_dummy",
            "name": "EXECGroupNo_dummy",
        },
    ], ["emgroup"]),
    execDefine("exec-22", "Load GroupNo %1", [
        {
            "type": "input_dummy",
            "name": "EXECGroupNo_dummy",
        },
    ], ["emgroup"]),
    execDefine("exec-23", "Load SubTitle %1 from Quest %2", [
        {
            "type": "field_number",
            "name": "ExecCallSubTitleNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_input",
            "name": "ExecCallSubTitleQuestId",
            "text": "0000"
        }
    ]),

    execDefine("exec-28", "After Event %1, SubQuestJump to Phase %2 of Quest %3 (type %4)", [
        {
            "type": "field_input",
            "name": "EventNo",
            "text": "0000"
        },
        {
            "type": "field_number",
            "name": "ExecSubQuestJumpPhaseNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_input",
            "name": "ExecSubQuestJumpQuestId",
            "text": "0000"
        },
        {
            "type": "field_number",
            "name": "EventType",
            "value": 0,
            "min": 0
        }
    ]),

    execDefine("exec-30", "Call Task %1 (type %2)", [
        {
            "type": "input_dummy",
            "name": "ExecTaskNo_dummy",
        },
        {
            "type": "field_number",
            "name": "ExecType",
            "value": 0,
            "min": 0
        }
    ], ["task"]),
    execDefine("exec-31", "Have SetNo %1 of GroupNo %2 say TalkScript %3 of quest %4 (%5)", [
        {
            "type": "field_number",
            "name": "SetNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "GroupNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_input",
            "name": "TalkId",
            "text": "0000"
        },
        {
            "type": "field_input",
            "name": "QuestId",
            "text": "0000"
        },
        trueFalse("ExistSpeaker", "Speaker exists", "Speaker does not exist")
    ]),

    execDefine("exec-35", "%1 Player from Index %2", [
        trueFalse("bOn", "Disallow", "Allow"),
        {
            "type": "field_number",
            "name": "Index",
            "value": 0
        }
        /*{
            "type": "field_dropdown",
            "name": "Index",
            "options": [
                ["Movement", "0"],
                ["Legion", "10"],
                ["Items", "12"],
                ["Drab Civvies", "3"],
                ["ARI Medical Gear", "4"],
                ["Reset", "5"]
            ]
        }*/
    ]),
    execDefine("exec-36", "Set SetNo %1 of GroupNo %2's position to (%3, %4, %5, %6deg)", [
        {
            "type": "field_number",
            "name": "SetNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "GroupNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "PosX",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "PosY",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "PosZ",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "RotY",
            "value": 0
        }
    ]),
    (() => {let def = execDefine("exec-37", "Return", []); def['nextStatement'] = undefined; return def })(),

    execDefine("exec-39", "Load Astral Plane arena of Quest %1 at (%2, %3, %4, %5deg) | type %6, layout pattern %7, Astral Plane Gate EmSet %8, %9, %10 [NOTICE: Hash %11, NoticeNo %12, type %13] [IN: NoticeNo %14, type %15]", [
        {
            "type": "field_input",
            "name": "QuestId",
            "text": "0"
        },
        {
            "type": "field_number",
            "name": "x",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "y",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "z",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "rot",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "Type",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "LayoutPattern",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "ObjGroupNo",
            "value": 0
        },
        trueFalse("bSetReturnPoint", "Set return point", "Don't set return point"),
        trueFalse("bSetEm", "Set em", "Don't set em"),
        hashDropdown("NoticeHash"),
        {
            "type": "field_number",
            "name": "NoticeNo",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "NoticeType",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "InNoticeNo",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "InNoticeType",
            "value": 0
        }
    ]),

    execDefine("exec-45", "Add Pin to Map", []),
    execDefine("exec-46", "Remove Pin from Map / Show case result screen", []),
    execDefine("exec-47", "Start Fade (Type %1, stop inputs %2, color %3)", [
        {
            "type": "field_number",
            "name": "Type",
            "value": 0,
            "min": 0
        },
        trueFalse("bKeyStop"),
        {
            "type": "field_colour",
            "name": "Color",
            "value": "0000"
        },
    ]),
    execDefine("exec-48", "End Fade", []),
    execDefine("exec-49", "Set SaveFlag %1 to %2", [
        {
            "type": "input_dummy",
            "name": "ExecFlagNo_dummy",
        },
        trueFalse("ExecbCheck")
    ], ["saveflag"]),
    execDefine("exec-50", "Load File Results Screen | Quest %1, PhaseNo %2, SubPhaseIndex %3 (POS %4, %5, %6, %7deg), LoadingType %8 (IsSet %9, IsCountUp %10, IsPhaseJump %11)", [
        {
            "type": "field_input",
            "name": "ExecQuestId",
            "text": "0"
        },
        {
            "type": "field_number",
            "name": "ExecPhaseNo",
            "value": 1,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecSubPhaseIndex",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecPosX",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecPosY",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecPosZ",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecRotY",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "ExecLoadingType",
            "value": 0,
            "min": 0
        },
        trueFalse("ExecIsSet"),
        trueFalse("ExecIsCountUp"),
        trueFalse("IsPhaseJump", "true", "false", false)
    ]),
    execDefine("exec-51", "Set a timer for %1 seconds (Notice # %2, type %3) (timer type %4)", [
        {
            "type": "field_number",
            "name": "SecTime",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "NoticeNo",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "NoticeType",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "Type",
            "value": 0,
            "min": 0
        },
    ]),
    execDefine("exec-52", "UNKNOWN [Mode %1]", [
        {
            "type": "field_number",
            "name": "Mode",
            "value": 0
        }
    ]),
    execDefine("exec-53", "%1 countdown [Type %2]", [
        trueFalse("bSet", "Show", "Hide"),
        {
            "type": "field_number",
            "name": "Type",
            "value": 0
        }
    ]),
    execDefine("exec-54", "%1 player's weapon to %2", [
        trueFalse('bLock', 'Lock', 'Unlock'),
        {
            "type": "field_dropdown",
            "name": "Type",
            "options": [
                ["Default", "0"],
                ["Baton Mode", "1"],
                ["Gladius Mode", "2"],
                ["Blaster Mode", "3"]
            ]
        }
    ]),
    execDefine("exec-55", "UNKNOWN", []),

    execDefine("exec-59", "Stop all subtitles", []),
    execDefine("exec-60", "Force costume change to %1", [
        {
            "type": "field_dropdown",
            "name": "Type",
            "options": [
                ["Ark Police Gear", "0"],
                ["Lappy Costume", "1"],
                ["Raven Armor", "2"],
                ["Drab Civvies", "3"],
                ["ARI Medical Gear", "4"],
                ["Default", "5"]
            ]
        }
    ]),
    execDefine("exec-61", "%1 GroupNo %2 to/from memory", [
        trueFalse("bRead", "Read", "Discard"),
        {
            "type": "field_number",
            "name": "GroupNo",
            "value": 0,
            "min": 0
        }
    ]),
    execDefine("exec-62", "%1 random number from %2 to %3", [
        {
            "type": "field_dropdown",
            "name": "Type",
            "options": [
                ["Generate new", "0"],
                ["Use last random", "1"] 
            ]
        },
        {
            "type": "field_number",
            "name": "Begin",
            "value": 0,
            "min": 0
        },
        {
            "type": "field_number",
            "name": "End",
            "value": 0,
            "min": 0
        }
    ]),
];

export const toolbox = `<xml id="toolbox" style="display: none">` +
    `<category name="LineList" colour="#FF6680">` +
    `<block type="task-start"></block>` +
    `</category>` +
    `<category name="If" colour="#FFAB19">` +
    ifBlocks.map(block => `<block type="${block.type}"></block>`).join("") +
    `</category>` +
    `<category name="Exec" colour="#4C97FF">` +
    execBlocks.map(block => `<block type="${block.type}"></block>`).join("") +
    `</category>` +
    `</xml>`;


function attemptRegisterExtension(name: string, fn: any) {
    try {
        Blockly.Extensions.register(name, fn);
    } catch(e) {
        if (!e.message.includes("already registered")) console.error(e);
    }
}

const fallbackFlags = (() => {
    let options = [];
    for (let i = 0; i < 64; i++) {
        options.push([`(${i}) Flag${i.toString().padStart(2, "0")}`, i.toString()])
    }
    return options;
})();

// EXTENSIONS
attemptRegisterExtension('questflag', function() {
    (this.getInput('ExecFlagNo_dummy') || this.getInput('IFFlagNo_dummy')).appendField(
        new Blockly.FieldDropdown(() => {
            let ses = get(session);
            if (!(ses instanceof Quest)) return fallbackFlags;
            let options = [];
            for (let i = 0; i < ses.questData.questFlags.length; i++) {
                options.push([`(${i}) ${ses.questData.questFlags[i]}`, i.toString()])
            }
            return options.length > 0 ? options : fallbackFlags;
        }),
        !!this.getInput('IFFlagNo_dummy') ? 'IFFlagNo' : 'ExecFlagNo'
    );
    this.setInputsInline(true);
});

attemptRegisterExtension('saveflag', function() {
    (this.getInput('ExecFlagNo_dummy') || this.getInput('IFFlagNo_dummy')).appendField(
        new Blockly.FieldDropdown(() => {
            if (this.getInput('IFFlagNo_dummy') && this.getInput('IFQuestId') != 0) {
                // generic all flags
                return fallbackFlags;
            }
            
            let ses = get(session);
            if (!(ses instanceof Quest)) return fallbackFlags;
            let options = [];
            for (let i = 0; i < ses.questData.saveFlags.length; i++) {
                options.push([`(${i}) ${ses.questData.saveFlags[i]}`, i.toString()])
            }
            return options.length > 0 ? options : fallbackFlags;
        }),
        !!this.getInput('IFFlagNo_dummy') ? 'IFFlagNo' : 'ExecFlagNo'
    );
    this.setInputsInline(true);
});
attemptRegisterExtension('emgroup', function() {
    this.getInput('EXECGroupNo_dummy').appendField(
        new Blockly.FieldDropdown(() => {
            let ses = get(session);
            if (!(ses instanceof Quest) || !ses.enemySet.sets.length) return [["NO ENEMY SETS FOUND...", "0"]];
            return ses.enemySet.sets.map(set => [`(${set.number}) ${set.name}`, set.number.toString()]);
        }),
        'EXECGroupNo'
    );
    this.setInputsInline(true);
});
attemptRegisterExtension('task', function() {
    this.getInput('ExecTaskNo_dummy').appendField(
        new Blockly.FieldDropdown(() => {
            let ses = get(session);
            if (!(ses instanceof Quest) || !ses?.questData.tasks.length) return [["NO TASKS FOUND...", "0"]];
            return ses.questData.tasks.map((task, i) => [`(${i}) ${task.name}`, i.toString()]);
        }),
        'ExecTaskNo'
    );
    this.setInputsInline(true);
});
attemptRegisterExtension('zone', function() {
    this.getInput('IFIndexNo_dummy').appendField(
        new Blockly.FieldDropdown(() => {
            let ses = get(session);
            if (!ses) return [];
            if (!(ses instanceof Quest) || !ses?.questData.areas.length) return [["NO ZONES FOUND...", "0"]];
            return ses.questData.areas.map(zone => [`(${zone.index}) ${zone.name}`, zone.index.toString()]);
        }),
        'IFIndexNo'
    );
    this.setInputsInline(true);
});
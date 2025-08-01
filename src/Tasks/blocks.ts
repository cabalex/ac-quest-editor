import Blockly from 'blockly';
import { get } from 'svelte/store';
import { session } from '../store';
import Quest from '../_lib/Quest';
import { hashDropdownOptions, hashValueDropdownOptions } from './hashes';

// full list of block ids
export const blockIds = {};

function hashDropdown(name: string) {
	return {
		type: 'field_dropdown',
		options: hashDropdownOptions,
		name
	};
}

function hashValueDropdown(name: string) {
	return {
		type: 'field_dropdown',
		options: hashValueDropdownOptions,
		name
	};
}

// @ts-ignore - expose hash lookup function
window.lookupHash = function (hash: string): string {
	let v = hashValueDropdownOptions.find((item) => item[1] === hash);
	if (!v) {
		v = hashDropdownOptions.find((item) => item[1] === hash);
	}
	return v ? v[0] : hash;
};

export const systemBlocks = [
	{
		type: 'task-start',
		message0: 'When LineList %1 called',
		args0: [
			{
				type: 'field_number',
				value: 255,
				min: 0,
				name: 'taskno'
			}
		],
		nextStatement: null,
		style: 'hat_blocks'
	},
	{
		type: 'next-linelist',
		message0: 'Go to next LineList',
		previousStatement: null,
		style: 'hat_blocks'
	},
	{
		type: 'unknown-if',
		message0: 'Unknown IF %1 %2 %3',
		args0: [
			{ type: 'field_number', value: -1, min: 0, name: 'typeIF' },
			{ type: 'input_dummy' },
			{ type: 'input_statement', name: 'execarea', align: 'CENTRE' }
		],
		previousStatement: null,
		nextStatement: null,
		style: 'logic_blocks'
	},
	{
		type: 'unknown-exec',
		message0: 'Unknown EXEC %1',
		args0: [{ type: 'field_number', value: -1, min: 0, name: 'typeEXEC' }],
		previousStatement: null,
		nextStatement: null,
		style: 'procedure_blocks'
	}
];

function ifCommand(alt = 'IFCommand') {
	return {
		type: 'field_dropdown',
		name: alt,
		options: [
			['==', '0'],
			['!=', '1'],
			['>', '2'],
			['=>', '3'],
			['<', '4'],
			['<=', '5']
		]
	};
}
function trueFalse(name: string, trueStatement = 'true', falseStatement = 'false', def = true) {
	if (def) {
		return {
			type: 'field_dropdown',
			name: name,
			options: [
				[trueStatement, '1'],
				[falseStatement, '0']
			]
		};
	}
	return {
		type: 'field_dropdown',
		name: name,
		options: [
			[falseStatement, '0'],
			[trueStatement, '1']
		]
	};
}
function execDefine(type: string, msg: string, args: any[], extensions?: any[]): any {
	// @ts-ignore
	blockIds[type] = args.map((item) => item['name']);
	return {
		type: type,
		message0: type.split('-')[1] + ') ' + msg,
		args0: args,
		previousStatement: null,
		nextStatement: null,
		style: 'procedure_blocks',
		extensions: extensions
	};
}
function ifDefine(type: string, msg: string, args: any[], extensions?: string[]): any {
	var argslist = [
		...args,
		{ type: 'input_dummy' },
		{ type: 'input_statement', name: 'execarea', align: 'CENTRE' }
	];
	// @ts-ignore
	blockIds[type] = [args.map((item) => item['name'])];
	return {
		type: type,
		message0: type.split('-')[1] + ') ' + msg + ` %${argslist.length - 1} %${argslist.length}`,
		args0: argslist,
		previousStatement: null,
		nextStatement: null,
		style: 'logic_blocks',
		extensions: extensions
	};
}
// IF
export const ifBlocks = [
	ifDefine(
		'if-1',
		'If Player in Area %1 of GroupNo %2 (Check: %3, Multiple: %4)',
		[
			{
				type: 'input_dummy',
				name: 'IFIndexNo_dummy'
			},
			{
				type: 'field_number',
				name: 'IFGroupNo',
				value: 0,
				min: 0
			},
			trueFalse('IFbCheck'),
			{
				type: 'field_dropdown',
				name: 'IFMultiple',
				options: [
					['true', '1'],
					['false', '0']
				]
			}
		],
		['zone']
	),
	ifDefine('if-38', 'If GroupNo %1 is %2', [
		{
			type: 'field_input',
			name: 'IFGroupNo',
			value: 0,
			min: 0
		},
		trueFalse('IFbCheck', 'alive', 'dead')
	]),
	ifDefine('if-2', 'If # of Ems in GroupNo %1 %2 %3 (type %4)', [
		{
			type: 'field_number',
			name: 'IFGroupNo',
			value: 0,
			min: 0
		},
		ifCommand(),
		{
			type: 'field_number',
			name: 'IFValue',
			value: 0
		},
		{
			type: 'field_number',
			name: 'IfType',
			value: 0,
			min: 0
		}
	]),
	ifDefine('if-3', 'If Global Flag %1 is not %2', [hashDropdown('IFHash'), trueFalse('IFbCheck')]),
	ifDefine(
		'if-4',
		'If Flag %1 of quest %2 is %3',
		[
			{
				type: 'input_dummy',
				name: 'IFFlagNo_dummy'
			},
			{
				type: 'field_input',
				name: 'IFQuestId',
				text: '0000'
			},
			trueFalse('IFbCheck')
		],
		['questflag']
	),
	ifDefine('if-5', 'If Counter %1 %2 %3', [
		{
			type: 'field_number',
			name: 'IFCntNo',
			value: 0,
			min: 0
		},
		ifCommand(),
		{
			type: 'field_number',
			name: 'IFValue',
			value: 0,
			min: 0
		}
	]),
	//ifDefine("if-6", "*** UNKNOWN ***", []),
	ifDefine(
		'if-7',
		'If Flag %1 of quest %2 is %3',
		[
			{
				type: 'input_dummy',
				name: 'IFFlagNo_dummy'
			},
			{
				type: 'field_number',
				name: 'IFQuestId',
				value: 0,
				min: 0
			},
			trueFalse('IFbCheck')
		],
		['questflag']
	),
	ifDefine('if-8', 'If Counter %1 %2 %3', [
		{
			type: 'field_number',
			name: 'IFCntNo',
			value: 0,
			min: 0
		},
		ifCommand(),
		{
			type: 'field_number',
			name: 'IFValue',
			value: 0,
			min: 0
		}
	]),
	//ifDefine("if-9", "*** UNKNOWN ***", []),
	ifDefine('if-10', 'If Event %1 %2 state %3 (type %4)', [
		{
			type: 'field_input',
			name: 'EventNo',
			value: '0000'
		},
		ifCommand('Condition'),
		{
			type: 'field_number',
			name: 'EventState',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'EventType',
			value: 0,
			min: 0
		}
	]),
	ifDefine('if-11', 'If Global Flag %1 %2: %3, %4', [
		hashDropdown('IFHash'),
		{
			type: 'field_dropdown',
			name: 'IFCondition',
			options: [
				['< first value', '0'],
				['> first value', '1'], // confirmed
				['<= first value', '2'],
				['=> first value', '3'], // confirmed
				['== first value', '4'], // confirmed
				['is between', '5'] // confirmed
			]
		},
		hashValueDropdown('IFValueHash'),
		hashValueDropdown('IFValue2Hash')
	]),

	ifDefine('if-14', 'If Player has %1 %2x of item %3', [
		ifCommand('HasItemCondition'),
		{
			type: 'field_number',
			name: 'HasItemValue',
			value: 0,
			min: 0
		},
		{
			type: 'field_input',
			name: 'HasItemId',
			text: '000000'
		}
	]),
	ifDefine('if-15', 'If Em %1 of EmSet %2 %3 in AreaGroup %4 Index %5 (isGroup %6)', [
		{
			type: 'field_number',
			name: 'IfEmSetNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'IfEmGroupNo',
			value: 0,
			min: 0
		},
		trueFalse('IfCheck', 'is not', 'is'),
		{
			type: 'field_number',
			name: 'IfAreaGroup',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'IfAreaIndex',
			value: 0,
			min: 0
		},
		trueFalse('IfIsGroup')
	]),
	ifDefine('if-16', 'If SetNo %1 of GroupNo %2 %3 %4 (isGroup %5)', [
		{
			type: 'field_number',
			name: 'IfEmSetNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'IfEmGroupNo',
			value: 0,
			min: 0
		},
		ifCommand('IfCondition'),
		{
			type: 'field_number',
			name: 'IfValue',
			value: 0
		},
		trueFalse('IfIsGroup')
	]),
	ifDefine('if-17', 'If state of Quest %1 %2 %3', [
		{
			type: 'field_input',
			name: 'IfQuestId',
			text: '0000'
		},
		ifCommand('IfCondition'),
		trueFalse('IfbCheck', 'done', 'not done')
	]),

	ifDefine('if-20', 'If score on Quest %1 %2 %3', [
		{
			type: 'field_input',
			name: 'IfSubQuestCompQuestId',
			text: '0000'
		},
		{
			type: 'field_dropdown',
			name: 'IfCondition',
			options: [
				['>=', '0'],
				['!=', '1'],
				['>', '2'],
				['=>', '3'],
				['<', '4'],
				['<=', '5']
			]
		},
		{
			type: 'field_number',
			name: 'IfSubQuestCompScore',
			value: 0,
			min: 0
		}
	]),

	ifDefine('if-22', 'If dialogue box %1', [trueFalse('bCheck', 'closed', 'open')]),

	ifDefine('if-26', 'If Player is %1 an Astral Plane arena', [
		trueFalse('IFIsCombatBarrier', 'inside', 'outside')
	]),
	ifDefine('if-27', 'If fade transition is %1 (type %2)', [
		trueFalse('IFbCheck', 'active', 'inactive'),
		{
			type: 'field_number',
			name: 'IFType',
			value: 0,
			min: 0
		}
	]),
	ifDefine(
		'if-28',
		'If SaveFlag %1 of quest %2 is %3',
		[
			{
				type: 'input_dummy',
				name: 'IFFlagNo_dummy'
			},
			{
				type: 'field_number',
				name: 'IFQuestId',
				value: 0,
				min: 0
			},
			trueFalse('IFbCheck')
		],
		['saveflag']
	),

	ifDefine('if-30', 'If playing event is %1', [trueFalse('IFbCheck', 'over', 'not over')]),
	ifDefine('if-31', 'If Player %1 red word %2', [
		trueFalse('IFbCheck', 'has', 'does not have'),
		{
			type: 'field_input',
			name: 'IFId',
			text: '000'
		}
	]),

	ifDefine('if-33', 'If Button Prompt Dialog Box is %1', [trueFalse('bCheck', 'closed', 'open')]),
	ifDefine('if-35', 'If Player is %1', [trueFalse('IFbCheck', 'not moving', 'moving')]),
	ifDefine('if-36', 'If %1', [trueFalse('IFbCheck')]),
	ifDefine('if-37', 'If SetNo %1 of GroupNo %2 %3 %4 (isGroup %5)', [
		{
			type: 'field_number',
			name: 'IfEmSetNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'IfEmGroupNo',
			value: 0,
			min: 0
		},
		ifCommand('IfCondition'),
		{
			type: 'field_number',
			name: 'IfValue',
			value: 0
		},
		trueFalse('IfIsGroup')
	])
];

// EXEC
export const execBlocks = [
	//execDefine("exec-1", "Execute next task fasfa", []),
	(() => {
		let def = execDefine('exec-2', '%2 %1', [
			{
				type: 'field_number',
				name: 'EXECLine',
				value: 0,
				min: 0
			},
			trueFalse('EXECIsNextLine', 'Execute next LineList in sequence', 'Execute LineList #')
		]);
		def['nextStatement'] = undefined;
		return def;
	})(),
	execDefine('exec-3', '%2 %1', [
		{
			type: 'field_number',
			name: 'EXECLine',
			value: 0,
			min: 0
		},
		trueFalse('EXECIsNextLine', 'Execute next LineList in sequence', 'Execute LineList #')
	]),
	execDefine('exec-4', 'Wait %1 seconds', [
		{
			type: 'field_number',
			name: 'EXECTimer',
			value: 0,
			min: 0
		}
	]),
	execDefine(
		'exec-5',
		'Load GroupNo %1 (setMax %2)',
		[
			{
				type: 'input_dummy',
				name: 'EXECGroupNo_dummy'
			},
			trueFalse('EXECSetMax')
		],
		['emgroup']
	),
	execDefine(
		'exec-6',
		'Unload GroupNo %1',
		[
			{
				type: 'input_dummy',
				name: 'EXECGroupNo_dummy'
			}
		],
		['emgroup']
	),
	execDefine(
		'exec-7',
		'Load event %1 from PhaseNo %2 (EventType %3, ExecType %4, PreRead %5) [CHAIN %6: EventNo %7, PhaseNo %8, type %9] [FADEIN %10: Color: %11, type %12] [FADEOUT %13: CanFadeIn %14, Color: %15, type %16] [START %17: (%18, %19, %20, %21deg), OFFSET %22: (%23, %24, %25, rotX %26deg, rotY %27deg)',
		[
			{
				type: 'field_input',
				name: 'EXECEventNo',
				text: '0000'
			},
			{
				type: 'field_input',
				name: 'EXECEventPhaseNo',
				text: '-1'
			},
			{
				type: 'field_number',
				name: 'EXECEventType',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecType',
				value: 0
			},
			trueFalse('EXECEventPreRead', undefined, undefined, false),
			trueFalse('EXECEventExecUseChainEvent', 'enabled', 'disabled', false),
			{
				type: 'field_input',
				name: 'EXECEventChainEventNo',
				text: '0000'
			},
			{
				type: 'field_input',
				name: 'EXECEventChainPhaseNo',
				text: '-1'
			},
			{
				type: 'field_number',
				name: 'EXECEventChainExecType',
				value: 0
			},
			trueFalse('EXECEventExecUseBeginFade', 'enabled', 'disabled', false),
			{
				type: 'field_colour',
				name: 'EXECEventExecBeginFadeColor',
				value: '0xFF000000'
			},
			{
				type: 'field_number',
				name: 'EXECEventExecBeginFadeType',
				value: 1
			},
			trueFalse('EXECEventExecUseEndFade', 'enabled', 'disabled', false),
			trueFalse('EXECEventExecEndFadeCanFadeIn'), // usually true first
			{
				type: 'field_colour',
				name: 'EXECEventExecEndFadeColor',
				value: '0xFF000000'
			},
			{
				type: 'field_number',
				name: 'EXECEventExecEndFadeType',
				value: 0
			},
			trueFalse('EXECEventExecbSetStartPos', 'enabled', 'disabled', false),
			{
				type: 'field_number',
				name: 'EXECEventExecStartPosX',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecStartPosY',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecStartPosZ',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecStartRotY',
				value: 0
			},
			trueFalse('EXECEventExecbSetOffsetPos', 'enabled', 'disabled', false),
			{
				type: 'field_number',
				name: 'EXECEventExecOffsetPosX',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecOffsetPosY',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecOffsetPosZ',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecOffsetRotX',
				value: 0
			},
			{
				type: 'field_number',
				name: 'EXECEventExecOffsetRotY',
				value: 0
			}
		]
	),
	execDefine('exec-8', 'Set Global Flag %1 to %2', [
		hashDropdown('ExecHash'),
		trueFalse('ExecbCheck')
	]),
	execDefine(
		'exec-9',
		'Set QuestFlag %1 to %2',
		[
			{
				type: 'input_dummy',
				name: 'ExecFlagNo_dummy'
			},
			trueFalse('ExecbCheck')
		],
		['questflag']
	),
	execDefine('exec-10', 'Set Counter %1 %2 %3 %4', [
		{
			type: 'field_number',
			name: 'ExecCntNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_dropdown',
			name: 'ExecCommand',
			options: [
				['equal to first value', '1'],
				['increment by first value', '2'],
				['=>', '3']
			]
		},
		{
			type: 'field_number',
			name: 'ExecValue1',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'ExecValue2',
			value: 0,
			min: 0
		}
	]),

	execDefine(
		'exec-12',
		'Set QuestFlag %1 to %2',
		[
			{
				type: 'input_dummy',
				name: 'ExecFlagNo_dummy'
			},
			trueFalse('ExecbCheck')
		],
		['questflag']
	),

	execDefine('exec-15', 'Teleport player to (%1, %2, %3), Rot %4deg (Use fade %5, fade color %6)', [
		{
			type: 'field_number',
			name: 'ExecPosX',
			value: 0
		},
		{
			type: 'field_number',
			name: 'ExecPosY',
			value: 0
		},
		{
			type: 'field_number',
			name: 'ExecPosZ',
			value: 0
		},
		{
			type: 'field_number',
			name: 'ExecRotY',
			value: 0
		},
		trueFalse('ExecUseFade'),
		{
			type: 'field_colour',
			name: 'ExecFadeColor',
			value: '0000'
		}
	]),
	execDefine(
		'exec-16',
		'Load New Area Data from Quest %1, PhaseNo %2, SubPhaseIndex %3 (POS %4, %5, %6, %7deg), LoadingType %8 (IsSet %9, IsCountUp %10)',
		[
			{
				type: 'field_input',
				name: 'ExecQuestId',
				text: '0000'
			},
			{
				type: 'field_input',
				name: 'ExecPhaseNo',
				text: '0'
			},
			{
				type: 'field_number',
				name: 'ExecSubPhaseIndex',
				value: 0,
				min: 0
			},
			{
				type: 'field_number',
				name: 'ExecPosX',
				value: 0
			},
			{
				type: 'field_number',
				name: 'ExecPosY',
				value: 0
			},
			{
				type: 'field_number',
				name: 'ExecPosZ',
				value: 0
			},
			{
				type: 'field_number',
				name: 'ExecRotY',
				value: 0
			},
			{
				type: 'field_dropdown',
				name: 'ExecLoadingType',
				options: [
					['Default', '0'],
					['Astral Plane [debug]', '1'],
					['Astral Plane [player]', '2'],
					['Astral Plane [no player]', '3']
				]
			},
			trueFalse('ExecIsSet'),
			trueFalse('ExecIsCountUp')
		]
	),

	execDefine('exec-18', '%1 Button Prompt Dialog Box (Tip %2)', [
		{
			type: 'field_dropdown',
			name: 'ExecDispTipsEnable',
			options: [
				['enable', '1'],
				['disable', '0']
			]
		},
		{
			type: 'field_number',
			name: 'ExecDispTipsNo',
			value: -1,
			min: -1
		}
	]),

	execDefine('exec-20', 'Set counter at Hash %1 to %2 (counter type %3)', [
		hashDropdown('ExecCounterHash'),
		hashValueDropdown('ExecCounterValueHash'),
		{
			type: 'field_number',
			name: 'ExecCounterType',
			value: 1,
			min: 0
		}
	]),
	execDefine(
		'exec-21',
		'Load GroupNo %1',
		[
			{
				type: 'input_dummy',
				name: 'EXECGroupNo_dummy'
			}
		],
		['emgroup']
	),
	execDefine(
		'exec-22',
		'Load GroupNo %1',
		[
			{
				type: 'input_dummy',
				name: 'EXECGroupNo_dummy'
			}
		],
		['emgroup']
	),
	execDefine('exec-23', 'Load SubTitle %1 from Quest %2', [
		{
			type: 'field_number',
			name: 'ExecCallSubTitleNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_input',
			name: 'ExecCallSubTitleQuestId',
			text: '0000'
		}
	]),

	execDefine('exec-28', 'After Event %1, SubQuestJump to Phase %2 of Quest %3 (type %4)', [
		{
			type: 'field_input',
			name: 'EventNo',
			text: '0000'
		},
		{
			type: 'field_input',
			name: 'ExecSubQuestJumpPhaseNo',
			text: '0'
		},
		{
			type: 'field_input',
			name: 'ExecSubQuestJumpQuestId',
			text: '0000'
		},
		{
			type: 'field_number',
			name: 'EventType',
			value: 0,
			min: 0
		}
	]),

	execDefine(
		'exec-30',
		'Call Task %1 (type %2)',
		[
			{
				type: 'input_dummy',
				name: 'ExecTaskNo_dummy'
			},
			{
				type: 'field_number',
				name: 'ExecType',
				value: 0,
				min: 0
			}
		],
		['task']
	),
	execDefine('exec-31', 'Have SetNo %1 of GroupNo %2 say TalkScript %3 of quest %4 (%5)', [
		{
			type: 'field_number',
			name: 'SetNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'GroupNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_input',
			name: 'TalkId',
			text: '0000'
		},
		{
			type: 'field_input',
			name: 'QuestId',
			text: '0000'
		},
		trueFalse('ExistSpeaker', 'Speaker exists', 'Speaker does not exist')
	]),

	execDefine('exec-35', '%1 player to use %2', [
		trueFalse('bOn', 'Lock', 'Unlock'),
		{
			type: 'field_dropdown',
			name: 'Index',
			options: [
				['Only Camera movement', '0'],
				['Slow walking; no Items/Legion/Legatus Menu', '1'],
				['Only IRIS', '2'],
				['Disable camera movement', '3'],
				['Disable NPC interaction (4)', '4'],
				['Disable NPC interaction (5)', '5'],
				['Only Legion', '6'],
				['Disable NPC interaction (7)', '7'],
				['Only IRIS (again?)', '8'],
				['Disable attacks and items', '9'],
				['Disable IRIS', '10'],
				['Disable all but L/R stick movements', '11'],
				['Disable Legion', '12'],
				['Unknown 13 (does nothing?)', '13'],
				['Unknown 14 (does nothing?)', '14']
			]
		}
	]),
	execDefine('exec-36', "Set SetNo %1 of GroupNo %2's position to (%3, %4, %5, %6deg)", [
		{
			type: 'field_number',
			name: 'SetNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'GroupNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'PosX',
			value: 0
		},
		{
			type: 'field_number',
			name: 'PosY',
			value: 0
		},
		{
			type: 'field_number',
			name: 'PosZ',
			value: 0
		},
		{
			type: 'field_number',
			name: 'RotY',
			value: 0
		}
	]),
	(() => {
		let def = execDefine('exec-37', 'Return', []);
		def['nextStatement'] = undefined;
		return def;
	})(),

	execDefine(
		'exec-39',
		'Load Astral Plane arena of Quest %1 at (%2, %3, %4, %5deg) | type %6, layout pattern %7, Astral Plane Gate EmSet %8, %9, %10 [NOTICE: Hash %11, NoticeNo %12, type %13] [IN: NoticeNo %14, type %15]',
		[
			{
				type: 'field_input',
				name: 'QuestId',
				text: '0'
			},
			{
				type: 'field_number',
				name: 'x',
				value: 0
			},
			{
				type: 'field_number',
				name: 'y',
				value: 0
			},
			{
				type: 'field_number',
				name: 'z',
				value: 0
			},
			{
				type: 'field_number',
				name: 'rot',
				value: 0
			},
			{
				type: 'field_number',
				name: 'Type',
				value: 0
			},
			{
				type: 'field_number',
				name: 'LayoutPattern',
				value: 0
			},
			{
				type: 'field_number',
				name: 'ObjGroupNo',
				value: 0
			},
			trueFalse('bSetReturnPoint', 'Set return point', "Don't set return point"),
			trueFalse('bSetEm', 'Set em', "Don't set em"),
			hashDropdown('NoticeHash'),
			{
				type: 'field_number',
				name: 'NoticeNo',
				value: 0
			},
			{
				type: 'field_number',
				name: 'NoticeType',
				value: 0
			},
			{
				type: 'field_number',
				name: 'InNoticeNo',
				value: 0
			},
			{
				type: 'field_number',
				name: 'InNoticeType',
				value: 0
			}
		]
	),

	execDefine('exec-45', 'Add Pin to Map', []),
	execDefine('exec-46', 'Remove Pin from Map / Show case result screen', []),
	execDefine('exec-47', 'Start Fade (Type %1, stop inputs %2, color %3)', [
		{
			type: 'field_number',
			name: 'Type',
			value: 0,
			min: 0
		},
		trueFalse('bKeyStop'),
		{
			type: 'field_colour',
			name: 'Color',
			value: '0000'
		}
	]),
	execDefine('exec-48', 'End Fade', []),
	execDefine(
		'exec-49',
		'Set SaveFlag %1 to %2',
		[
			{
				type: 'input_dummy',
				name: 'ExecFlagNo_dummy'
			},
			trueFalse('ExecbCheck')
		],
		['saveflag']
	),
	execDefine(
		'exec-50',
		'Load File Results Screen | Quest %1, PhaseNo %2, SubPhaseIndex %3 (POS %4, %5, %6, %7deg), LoadingType %8 (IsSet %9, IsCountUp %10, IsPhaseJump %11)',
		[
			{
				type: 'field_input',
				name: 'ExecQuestId',
				text: '0'
			},
			{
				type: 'field_input',
				name: 'ExecPhaseNo',
				text: '0'
			},
			{
				type: 'field_number',
				name: 'ExecSubPhaseIndex',
				value: 0,
				min: 0
			},
			{
				type: 'field_number',
				name: 'ExecPosX',
				value: 0,
				min: 0
			},
			{
				type: 'field_number',
				name: 'ExecPosY',
				value: 0,
				min: 0
			},
			{
				type: 'field_number',
				name: 'ExecPosZ',
				value: 0,
				min: 0
			},
			{
				type: 'field_number',
				name: 'ExecRotY',
				value: 0,
				min: 0
			},
			{
				type: 'field_number',
				name: 'ExecLoadingType',
				value: 0,
				min: 0
			},
			trueFalse('ExecIsSet'),
			trueFalse('ExecIsCountUp'),
			trueFalse('IsPhaseJump', 'true', 'false', false)
		]
	),
	execDefine('exec-51', 'Set a timer for %1 seconds (Notice # %2, type %3) (timer type %4)', [
		{
			type: 'field_number',
			name: 'SecTime',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'NoticeNo',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'NoticeType',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'Type',
			value: 0,
			min: 0
		}
	]),
	execDefine('exec-52', 'UNKNOWN [Mode %1]', [
		{
			type: 'field_number',
			name: 'Mode',
			value: 0
		}
	]),
	execDefine('exec-53', '%1 countdown [Type %2]', [
		trueFalse('bSet', 'Show', 'Hide'),
		{
			type: 'field_number',
			name: 'Type',
			value: 0
		}
	]),
	execDefine('exec-54', "%1 player's weapon to %2", [
		trueFalse('bLock', 'Lock', 'Unlock'),
		{
			type: 'field_dropdown',
			name: 'Type',
			options: [
				['Default', '0'],
				['Baton Mode', '1'],
				['Gladius Mode', '2'],
				['Blaster Mode', '3']
			]
		}
	]),
	execDefine('exec-55', 'UNKNOWN', []),

	execDefine('exec-59', 'Stop all subtitles', []),
	execDefine('exec-60', 'Force costume change to %1', [
		{
			type: 'field_dropdown',
			name: 'Type',
			options: [
				['Ark Police Gear', '0'],
				['Lappy Costume', '1'],
				['Raven Armor', '2'],
				['Drab Civvies', '3'],
				['ARI Medical Gear', '4'],
				['Default', '5']
			]
		}
	]),
	execDefine('exec-61', '%1 GroupNo %2 to/from memory', [
		trueFalse('bRead', 'Read', 'Discard'),
		{
			type: 'field_number',
			name: 'GroupNo',
			value: 0,
			min: 0
		}
	]),
	execDefine('exec-62', '%1 random number from %2 to %3', [
		{
			type: 'field_dropdown',
			name: 'Type',
			options: [
				['Generate new', '0'],
				['Use last random', '1']
			]
		},
		{
			type: 'field_number',
			name: 'Begin',
			value: 0,
			min: 0
		},
		{
			type: 'field_number',
			name: 'End',
			value: 0,
			min: 0
		}
	])
];

export const toolbox =
	`<xml id="toolbox" style="display: none">` +
	`<category name="LineList" colour="#FF6680">` +
	`<block type="task-start"></block>` +
	`</category>` +
	`<category name="If" colour="#FFAB19">` +
	ifBlocks.map((block) => `<block type="${block.type}"></block>`).join('') +
	`</category>` +
	`<category name="Exec" colour="#4C97FF">` +
	execBlocks.map((block) => `<block type="${block.type}"></block>`).join('') +
	`</category>` +
	`</xml>`;

function attemptRegisterExtension(name: string, fn: any) {
	try {
		Blockly.Extensions.register(name, fn);
	} catch (e) {
		if (!e.message.includes('already registered')) console.error(e);
	}
}

const fallbackFlags = (() => {
	let options = [];
	for (let i = 0; i < 64; i++) {
		options.push([`(${i}) Flag${i.toString().padStart(2, '0')}`, i.toString()]);
	}
	return options;
})();

// EXTENSIONS
// TODO: for questflags and saveflags, smart lookup names based on open sessions
attemptRegisterExtension('questflag', function () {
	(this.getInput('ExecFlagNo_dummy') || this.getInput('IFFlagNo_dummy')).appendField(
		new Blockly.FieldDropdown(() => {
			let ses = get(session);
			if (!(ses instanceof Quest)) return fallbackFlags;
			let options = [];
			for (let i = 0; i < ses.questData.questFlags.length; i++) {
				options.push([`(${i}) ${ses.questData.questFlags[i]}`, i.toString()]);
			}
			return options.length > 0 ? options : fallbackFlags;
		}),
		!!this.getInput('IFFlagNo_dummy') ? 'IFFlagNo' : 'ExecFlagNo'
	);
	this.setInputsInline(true);
});

attemptRegisterExtension('saveflag', function () {
	(this.getInput('ExecFlagNo_dummy') || this.getInput('IFFlagNo_dummy')).appendField(
		new Blockly.FieldDropdown(() => {
			let ses = get(session);
			if (!(ses instanceof Quest)) return fallbackFlags;
			let options = [];
			for (let i = 0; i < ses.questData.saveFlags.length; i++) {
				options.push([`(${i}) ${ses.questData.saveFlags[i]}`, i.toString()]);
			}
			return options.length > 0 ? options : fallbackFlags;
		}),
		!!this.getInput('IFFlagNo_dummy') ? 'IFFlagNo' : 'ExecFlagNo'
	);
	this.setInputsInline(true);
});
attemptRegisterExtension('emgroup', function () {
	this.getInput('EXECGroupNo_dummy').appendField(
		new Blockly.FieldDropdown(() => {
			let ses = get(session);
			if (!(ses instanceof Quest) || !ses.enemySet.sets.length)
				return [['NO ENEMY SETS FOUND...', '0']];
			return ses.enemySet.sets.map((set) => [`(${set.number}) ${set.name}`, set.number.toString()]);
		}),
		'EXECGroupNo'
	);
	this.setInputsInline(true);
});
attemptRegisterExtension('task', function () {
	this.getInput('ExecTaskNo_dummy').appendField(
		new Blockly.FieldDropdown(() => {
			let ses = get(session);
			if (!(ses instanceof Quest) || !ses?.questData.tasks.length)
				return [['NO TASKS FOUND...', '0']];
			return ses.questData.tasks.map((task, i) => [`(${i}) ${task.name}`, i.toString()]);
		}),
		'ExecTaskNo'
	);
	this.setInputsInline(true);
});
attemptRegisterExtension('zone', function () {
	this.getInput('IFIndexNo_dummy').appendField(
		new Blockly.FieldDropdown(() => {
			let ses = get(session);
			if (!ses) return [];
			if (!(ses instanceof Quest) || !ses?.questData.areas.length)
				return [['NO ZONES FOUND...', '0']];
			return ses.questData.areas.map((zone) => [
				`(${zone.index}) ${zone.name}`,
				zone.index.toString()
			]);
		}),
		'IFIndexNo'
	);
	this.setInputsInline(true);
});

<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import {
		IconArrowUpRight,
		IconCamera,
		IconCircleChevronRight,
		IconCircleDashedX,
		IconClock,
		IconCoin,
		IconExclamationMark,
		IconFlag,
		IconFlagOff,
		IconMessage,
		IconMessage2,
		IconMessageReport,
		IconMenu2,
		IconMoodSmile,
		IconMusic,
		IconPhone,
		IconPlanetOff,
		IconQuestionMark,
		IconShoppingBag,
		IconSquareMinus,
		IconSquarePlus,
		IconTrash,
		IconWashDryShade,
		IconXboxB
	} from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

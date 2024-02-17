import Blockly from 'blockly';
import DarkTheme from '@blockly/theme-dark';

const theme = Blockly.Theme.defineTheme('modern', {
    'name': 'AC Modern',
    'base': DarkTheme,
    'blockStyles': {
      'colour_blocks': {
        'colourPrimary': '#a5745b',
        'colourSecondary': '#dbc7bd',
        'colourTertiary': '#845d49',
      },
      'list_blocks': {
        'colourPrimary': '#745ba5',
        'colourSecondary': '#c7bddb',
        'colourTertiary': '#5d4984',
      },
      'logic_blocks': { // IF
        'colourPrimary': '#FFAB19',
        'colourSecondary': '#CF8B17',
        'colourTertiary': '#CF8B17',
      },
      'loop_blocks': {
        'colourPrimary': '#5ba55b',
        'colourSecondary': '#bddbbd',
        'colourTertiary': '#498449',
      },
      'math_blocks': {
        'colourPrimary': '#5b67a5',
        'colourSecondary': '#bdc2db',
        'colourTertiary': '#495284',
      },
      'procedure_blocks': { // EXEC
        'colourPrimary': '#4C97FF',
        'colourSecondary': '#4C97FF',
        'colourTertiary': '#3373CC',
      },
      'text_blocks': {
        'colourPrimary': '#5ba58c',
        'colourSecondary': '#bddbd1',
        'colourTertiary': '#498470',
      },
      'variable_blocks': {
        'colourPrimary': '#a55b99',
        'colourSecondary': '#dbbdd6',
        'colourTertiary': '#84497a',
      },
      'variable_dynamic_blocks': {
        'colourPrimary': '#a55b99',
        'colourSecondary': '#dbbdd6',
        'colourTertiary': '#84497a',
      },
      'hat_blocks': { // top
        'colourPrimary': '#FF6680',
        'colourSecondary': '#FF6680',
        'colourTertiary': '#FF3355',
        'hat': 'cap',
      },
    },
    'categoryStyles': {
      'colour_category': {
        'colour': '#a5745b',
      },
      'list_category': {
        'colour': '#745ba5',
      },
      'logic_category': {
        'colour': '#5b80a5', // IF
      },
      'loop_category': {
        'colour': '#5ba55b',
      },
      'math_category': {
        'colour': '#5b67a5',
      },
      'procedure_category': {
        'colour': '#995ba5', // EXEC
      },
      'text_category': {
        'colour': '#5ba58c',
      },
      'variable_category': {
        'colour': '#a55b99',
      },
      'variable_dynamic_category': {
        'colour': '#a55b99',
      },
    },
    'componentStyles': {},
    'fontStyle': {},
    'startHats': undefined,
});

export default theme;
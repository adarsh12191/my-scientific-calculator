import React from 'react';
import type { Key, NumberSystem } from './types';
import { Settings, History } from 'lucide-react';

export const SCIENTIFIC_KEYS = (isRadians: boolean, isSecond: boolean): Key[] => [
    // ROW 1: Correctly implemented inverse trig functions
    { key: '2nd', label: '2ⁿᵈ', variant: isSecond ? 'special' : 'secondary' },
    { 
        key: isSecond ? 'asin(' : 'sin(', 
        label: isSecond ? <>sin<sup>-1</sup></> : 'sin', 
        variant: 'secondary' 
    },
    { 
        key: isSecond ? 'acos(' : 'cos(', 
        label: isSecond ? <>cos<sup>-1</sup></> : 'cos', 
        variant: 'secondary' 
    },
    { 
        key: isSecond ? 'atan(' : 'tan(', 
        label: isSecond ? <>tan<sup>-1</sup></> : 'tan', 
        variant: 'secondary' 
    },
    { key: 'Backspace', label: '⌫', variant: 'operator' },

    // ROW 2: Added reciprocal trig functions as 2nd functions
    { key: isSecond ? '^(1/3)' : '^3', label: isSecond ? '∛' : <>x<sup>3</sup></>, variant: 'secondary' },
    { 
        key: isSecond ? 'cot(' : 'PI', 
        label: isSecond ? 'cot' : 'π', 
        variant: 'secondary' 
    },
    { 
        key: isSecond ? 'sec(' : '%', 
        label: isSecond ? 'sec' : '%', 
        variant: 'secondary' 
    },
    { key: '(', label: '(', variant: 'secondary' },
    { key: ')', label: ')', variant: 'secondary' },

    // ROW 3
    { key: '7', label: '7', variant: 'primary' },
    { key: '8', label: '8', variant: 'primary' },
    { key: '9', label: '9', variant: 'primary' },
    isSecond
        ? { key: '10^', label: <>10<sup>x</sup></>, variant: 'secondary' }
        : { key: 'logModal', label: 'log...', variant: 'secondary' },
    { key: '/', label: '÷', variant: 'operator' },

    // ROW 4
    { key: '4', label: '4', variant: 'primary' },
    { key: '5', label: '5', variant: 'primary' },
    { key: '6', label: '6', variant: 'primary' },
    isSecond
        ? { key: 'e^', label: <>e<sup>x</sup></>, variant: 'secondary' }
        : { key: 'ln(', label: 'ln', variant: 'secondary' },
    { key: '*', label: '×', variant: 'operator' },

    // ROW 5
    { key: '1', label: '1', variant: 'primary' },
    { key: '2', label: '2', variant: 'primary' },
    { key: '3', label: '3', variant: 'primary' },
    isSecond
        ? { key: 'nthRoot(', label: 'ⁿ√', variant: 'secondary' }
        : { key: '^', label: <>x<sup>y</sup></>, variant: 'secondary' },
    { key: '-', label: '−', variant: 'operator' },

    // ROW 6
    { key: '0', label: '0', variant: 'primary' },
    { key: '.', label: '.', variant: 'primary' },
    { 
        key: isSecond ? 'csc(' : '!', 
        label: isSecond ? 'csc' : 'n!', 
        variant: 'secondary' 
    },
    isSecond
        ? { key: '^2', label: <>x<sup>2</sup></>, variant: 'secondary' }
        : { key: 'sqrt(', label: '√', variant: 'secondary' },
    { key: '+', label: '+', variant: 'operator' },
    
    // ROW 7
    { key: 'AC', label: 'AC', variant: 'operator' },
    { key: 'settings', label: <Settings size={24}/>, variant: 'secondary' },
    { key: 'history', label: <History size={24}/>, variant: 'secondary' },
    { key: '=', label: '=', variant: 'operator', span: true },
];

export const BASIC_KEYS: Key[] = [
    { key: 'AC', label: 'AC', variant: 'operator' },
    { key: 'C', label: 'C', variant: 'operator' },
    { key: '%', label: '%', variant: 'operator' },
    { key: '/', label: '÷', variant: 'operator' },
    { key: '7', label: '7', variant: 'primary' },
    { key: '8', label: '8', variant: 'primary' },
    { key: '9', label: '9', variant: 'primary' },
    { key: '*', label: '×', variant: 'operator' },
    { key: '4', label: '4', variant: 'primary' },
    { key: '5', label: '5', variant: 'primary' },
    { key: '6', label: '6', variant: 'primary' },
    { key: '-', label: '−', variant: 'operator' },
    { key: '1', label: '1', variant: 'primary' },
    { key: '2', label: '2', variant: 'primary' },
    { key: '3', label: '3', variant: 'primary' },
    { key: '+', label: '+', variant: 'operator' },
    { key: '0', label: '0', variant: 'primary', span: true },
    { key: '.', label: '.', variant: 'primary' },
    { key: '=', label: '=', variant: 'operator' },
];

export const NUMBER_SYSTEM_KEYS = (system: NumberSystem): Key[] => {
    const disabledFor: { [key: string]: NumberSystem[] } = {
        'A': ['BIN', 'OCT', 'DEC'], 'B': ['BIN', 'OCT', 'DEC'],
        'C': ['BIN', 'OCT', 'DEC'], 'D': ['BIN', 'OCT', 'DEC'],
        'E': ['BIN', 'OCT', 'DEC'], 'F': ['BIN', 'OCT', 'DEC'],
        '8': ['BIN', 'OCT'], '9': ['BIN', 'OCT'],
        '2': ['BIN'], '3': ['BIN'], '4': ['BIN'], '5': ['BIN'], '6': ['BIN'], '7': ['BIN'],
    };

    const isEnabled = (key: string) => !(disabledFor[key] || []).includes(system);

    return [
        // Row 1
        { key: '(', label: '(', variant: 'secondary' },
        { key: ')', label: ')', variant: 'secondary' },
        { key: 'Backspace', label: '⌫', variant: 'operator' },
        { key: 'AC', label: 'AC', variant: 'operator' },

        // Row 2
        { key: 'A', label: 'A', variant: 'primary', disabled: !isEnabled('A') },
        { key: 'B', label: 'B', variant: 'primary', disabled: !isEnabled('B') },
        { key: 'C', label: 'C', variant: 'primary', disabled: !isEnabled('C') },
        { key: '/', label: '÷', variant: 'operator' },
        
        // Row 3
        { key: 'D', label: 'D', variant: 'primary', disabled: !isEnabled('D') },
        { key: 'E', label: 'E', variant: 'primary', disabled: !isEnabled('E') },
        { key: 'F', label: 'F', variant: 'primary', disabled: !isEnabled('F') },
        { key: '*', label: '×', variant: 'operator' },

        // Row 4
        { key: '7', label: '7', variant: 'primary', disabled: !isEnabled('7') },
        { key: '8', label: '8', variant: 'primary', disabled: !isEnabled('8') },
        { key: '9', label: '9', variant: 'primary', disabled: !isEnabled('9') },
        { key: '-', label: '−', variant: 'operator' },

        // Row 5
        { key: '4', label: '4', variant: 'primary', disabled: !isEnabled('4') },
        { key: '5', label: '5', variant: 'primary', disabled: !isEnabled('5') },
        { key: '6', label: '6', variant: 'primary', disabled: !isEnabled('6') },
        { key: '+', label: '+', variant: 'operator' },
        
        // Row 6
        { key: '1', label: '1', variant: 'primary', disabled: !isEnabled('1') },
        { key: '2', label: '2', variant: 'primary', disabled: !isEnabled('2') },
        { key: '3', label: '3', variant: 'primary', disabled: !isEnabled('3') },
        { key: '±', label: '±', variant: 'secondary' },
        
        // Row 7
        { key: '0', label: '0', variant: 'primary', span: true, disabled: !isEnabled('0') },
        { key: '=', label: '=', variant: 'operator', span: true },
    ];
};
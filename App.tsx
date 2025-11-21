
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronsDown, ChevronsUp, ChevronUp, History, Settings, X, Sigma, Variable } from 'lucide-react';
import { solveQuadratic, solvePolynomial } from './utils/polynomialSolver';
import type { CalculatorMode, NumberSystem, HistoryEntry, Key } from './types';
import { SCIENTIFIC_KEYS, BASIC_KEYS, NUMBER_SYSTEM_KEYS } from './constants';

// Math.js configuration
const math = (window as any).math;
math.config({
  number: 'BigNumber',
  precision: 64
});

// --- HELPER & UI COMPONENTS (Defined outside main component) ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'operator' | 'special';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'h-11 md:h-12 rounded-lg text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-sky-500',
    secondary: 'bg-slate-500 text-white hover:bg-slate-400 focus:ring-sky-500',
    operator: 'bg-sky-600 text-white hover:bg-sky-500 focus:ring-amber-500 text-3xl',
    special: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-400',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface DisplayProps {
  expression: string;
  result: string;
  numberSystem: NumberSystem;
}

const CalculatorDisplay: React.FC<DisplayProps> = ({ expression, result, numberSystem }) => (
  <div className="bg-slate-800 rounded-lg p-4 mb-2 text-right break-words shadow-inner flex flex-col justify-end min-h-[120px] md:min-h-[110px]">
    <div className="text-slate-400 text-xl md:text-lg min-h-[28px] break-all">{expression || '0'}</div>
    <div className="text-white text-4xl md:text-3xl font-bold min-h-[48px] break-all" title={result}>{result || '0'}</div>
    <div className="text-sky-400 text-sm mt-1 h-5">{numberSystem}</div>
  </div>
);


interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-0 right-0 h-full w-full md:w-80 bg-slate-800/95 backdrop-blur-sm p-4 shadow-lg z-20 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">History</h2>
                <Button onClick={onClose} variant="secondary" className="h-10 w-10 !p-0"><X /></Button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {history.length === 0 ? (
                    <p className="text-slate-400">No history yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {history.map((entry, index) => (
                            <li key={index} className="cursor-pointer bg-slate-700 p-2 rounded hover:bg-slate-600" onClick={() => onSelect(entry)}>
                                <p className="text-slate-300 text-sm truncate">{entry.expression}</p>
                                <p className="text-white font-semibold text-lg truncate">{entry.result}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <Button onClick={onClear} variant="secondary" className="mt-4 h-12 text-lg">Clear History</Button>
        </div>
    );
};


interface SettingsPanelProps {
  precision: number;
  setPrecision: (p: number) => void;
  isRadians: boolean;
  toggleAngleMode: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ precision, setPrecision, isRadians, toggleAngleMode, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-0 left-0 h-full w-full md:w-80 bg-slate-800/95 backdrop-blur-sm p-4 shadow-lg z-20 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button onClick={onClose} variant="secondary" className="h-10 w-10 !p-0"><X /></Button>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="precision" className="block text-sm font-medium text-slate-300">Precision: {precision} digits</label>
                    <input
                        id="precision"
                        type="range"
                        min="2"
                        max="64"
                        value={precision}
                        onChange={(e) => setPrecision(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300">Angle Mode</label>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-3 py-1 rounded-md ${!isRadians ? 'bg-sky-600' : 'bg-slate-600'}`}>DEG</span>
                        <button onClick={toggleAngleMode} className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600">
                             <span className={`${isRadians ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                        </button>
                        <span className={`px-3 py-1 rounded-md ${isRadians ? 'bg-sky-600' : 'bg-slate-600'}`}>RAD</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PolynomialSolverModalProps {
    onClose: () => void;
}

const PolynomialSolverModal: React.FC<PolynomialSolverModalProps> = ({ onClose }) => {
    const [degree, setDegree] = useState(2);
    const [coeffs, setCoeffs] = useState<string[]>(['1', '-3', '2']);
    const [roots, setRoots] = useState<string[] | null>(null);

    const handleSolve = () => {
        const numericCoeffs = coeffs.map(c => parseFloat(c || '0')).slice(0, degree + 1);
        if (numericCoeffs.some(isNaN)) {
            setRoots(['Invalid coefficients']);
            return;
        }

        let solution;
        if (degree === 2) {
            solution = solveQuadratic(numericCoeffs[0], numericCoeffs[1], numericCoeffs[2]);
        } else {
            solution = solvePolynomial(numericCoeffs);
        }
        setRoots(solution);
    };

    useEffect(() => {
        setCoeffs(Array(degree + 1).fill(''));
        setRoots(null);
    }, [degree]);
    
    const labels = ['x⁵', 'x⁴', 'x³', 'x²', 'x', '#'];

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-30 p-4">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md shadow-xl overflow-y-auto max-h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Polynomial Solver</h2>
                    <Button onClick={onClose} variant="secondary" className="h-10 w-10 !p-0"><X /></Button>
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Degree: {degree}</label>
                    <input type="range" min="1" max="5" value={degree} onChange={e => setDegree(parseInt(e.target.value))} className="w-full" />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {Array.from({ length: degree + 1 }).map((_, i) => (
                        <div key={i}>
                            <label className="text-sm text-slate-400">{labels.slice(-degree-1)[i]}</label>
                            <input
                                type="number"
                                value={coeffs[i] || ''}
                                onChange={e => {
                                    const newCoeffs = [...coeffs];
                                    newCoeffs[i] = e.target.value;
                                    setCoeffs(newCoeffs);
                                }}
                                className="w-full bg-slate-700 p-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                    ))}
                </div>
                <Button onClick={handleSolve} variant="special" className="w-full h-12 text-lg">Solve</Button>
                {roots && (
                    <div className="mt-4 bg-slate-900 p-4 rounded">
                        <h3 className="font-bold">Roots:</h3>
                        <ul className="list-disc list-inside">
                            {roots.map((root, i) => <li key={i} className="font-mono">{root}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


interface LinearSystemSolverModalProps {
    onClose: () => void;
}

const LinearSystemSolverModal: React.FC<LinearSystemSolverModalProps> = ({ onClose }) => {
    const [size, setSize] = useState(2);
    const [matrix, setMatrix] = useState<string[][]>([['', ''], ['', '']]);
    const [vector, setVector] = useState<string[]>(['', '']);
    const [solution, setSolution] = useState<string[] | string | null>(null);

    useEffect(() => {
        const newMatrix = Array(size).fill(0).map(() => Array(size).fill(''));
        const newVector = Array(size).fill('');
        setMatrix(newMatrix);
        setVector(newVector);
        setSolution(null);
    }, [size]);

    const handleSolve = () => {
        try {
            const numMatrix = matrix.map(row => row.map(cell => {
                const val = parseFloat(cell);
                if (isNaN(val)) throw new Error("Invalid matrix value");
                return val;
            }));
            const numVector = vector.map(v => {
                const val = parseFloat(v);
                if (isNaN(val)) throw new Error("Invalid vector value");
                return val;
            });

            const result = math.lusolve(numMatrix, numVector);
            const formattedResult = result.map((r: any) => math.format(r, { notation: 'fixed', precision: 5 }));
            setSolution(formattedResult);
        } catch (error) {
            setSolution(error instanceof Error ? error.message : "Calculation error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-30 p-4">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg shadow-xl overflow-y-auto max-h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Linear System Solver (Ax = b)</h2>
                    <Button onClick={onClose} variant="secondary" className="h-10 w-10 !p-0"><X /></Button>
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Variables: {size}</label>
                    <input type="range" min="2" max="4" value={size} onChange={e => setSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex-grow">
                        <p className="text-center mb-1">Matrix A</p>
                        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
                            {matrix.map((row, i) =>
                                row.map((cell, j) => (
                                    <input
                                        key={`${i}-${j}`}
                                        type="number"
                                        value={cell}
                                        onChange={e => {
                                            const newMatrix = [...matrix];
                                            newMatrix[i][j] = e.target.value;
                                            setMatrix(newMatrix);
                                        }}
                                        className="w-full bg-slate-700 p-2 rounded text-center border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                ))
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-center mb-1">Vector b</p>
                        <div className="grid gap-2">
                             {vector.map((val, i) => (
                                <input
                                    key={i}
                                    type="number"
                                    value={val}
                                    onChange={e => {
                                        const newVector = [...vector];
                                        newVector[i] = e.target.value;
                                        setVector(newVector);
                                    }}
                                    className="w-20 bg-slate-700 p-2 rounded text-center border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                             ))}
                        </div>
                    </div>
                </div>
                <Button onClick={handleSolve} variant="special" className="w-full mt-4 h-12 text-lg">Solve</Button>
                {solution && (
                    <div className="mt-4 bg-slate-900 p-4 rounded">
                        <h3 className="font-bold">Solution (x):</h3>
                        {typeof solution === 'string' ? <p className="text-red-400">{solution}</p> : (
                            <div className="font-mono text-lg">
                                {solution.map((v, i) => <p key={i}>x{i+1} = {v}</p>)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface LogarithmModalProps {
    onClose: () => void;
    onSelect: (text: string) => void;
}

const LogarithmModal: React.FC<LogarithmModalProps> = ({ onClose, onSelect }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-30 p-4">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-xs shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Select Logarithm Base</h2>
                    <Button onClick={onClose} variant="secondary" className="h-10 w-10 !p-0"><X /></Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Button onClick={() => onSelect('log10(')} variant="primary" className="h-14 text-xl">
                        Base 10: log₁₀(x)
                    </Button>
                    <Button onClick={() => onSelect('ln(')} variant="primary" className="h-14 text-xl">
                        Natural: ln(x)
                    </Button>
                    <Button onClick={() => onSelect('log2(')} variant="primary" className="h-14 text-xl">
                        Base 2: log₂(x)
                    </Button>
                    <div className="bg-slate-700 p-3 rounded-lg mt-2">
                        <Button onClick={() => onSelect('log(')} variant="special" className="w-full h-14 text-xl">
                            Custom Base: log<sub>b</sub>(x)
                        </Button>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            Use format: log(value, base)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isRadians, setIsRadians] = useState(true);
    const [isSecondFunction, setIsSecondFunction] = useState(false);
    const [precision, setPrecision] = useState(16);
    const [mode, setMode] = useState<CalculatorMode>('scientific');
    const [numberSystem, setNumberSystem] = useState<NumberSystem>('DEC');
    
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activeModal, setActiveModal] = useState<'polynomial' | 'linear' | 'log' | null>(null);

    const formatNumber = useCallback((num: any) => {
        try {
            return math.format(num, { notation: 'auto', precision });
        } catch {
            return "Error";
        }
    }, [precision]);

    const convertToBase = useCallback((value: string, from: NumberSystem, to: NumberSystem): string => {
        if (from === to) return value;
        const bases = { 'BIN': 2, 'OCT': 8, 'DEC': 10, 'HEX': 16 };
        const decimalValue = parseInt(value, bases[from]);
        if (isNaN(decimalValue)) return "Invalid";
        return decimalValue.toString(bases[to]).toUpperCase();
    }, []);
    
    const evaluateExpression = useCallback(() => {
        if (!expression) return;

        // Auto-close parentheses
        const openParenCount = (expression.match(/\(/g) || []).length;
        const closeParenCount = (expression.match(/\)/g) || []).length;
        let finalExpression = expression;
        if (openParenCount > closeParenCount) {
            finalExpression += ")".repeat(openParenCount - closeParenCount);
        }

        try {
            let evalExpr = finalExpression;
            // Handle number systems
            if (numberSystem !== 'DEC') {
                evalExpr = evalExpr.replace(/[0-9A-F_]+([bho])?/g, (match) => {
                    if (/[bho]$/.test(match)) return match; // Already has base, e.g. 0b101
                    const decimalValue = parseInt(match, { 'BIN': 2, 'OCT': 8, 'HEX': 16 }[numberSystem]);
                    return decimalValue.toString();
                });
            }

            const evalResult = math.evaluate(evalExpr);
            let formattedResult = formatNumber(evalResult);
            
            if (numberSystem !== 'DEC') {
                 // Try to convert result back to the original base if it's an integer
                try {
                    const decResult = math.bignumber(evalResult).round().toString();
                    formattedResult = convertToBase(decResult, 'DEC', numberSystem);
                } catch {
                    // Result is complex or fractional, can't convert easily
                    formattedResult = `(DEC) ${formattedResult}`;
                }
            }

            setExpression(finalExpression);
            setResult(formattedResult);
            setHistory(prev => [{ expression: finalExpression, result: formattedResult }, ...prev].slice(0, 50));
        } catch (error) {
            setResult('Error');
        }
    }, [expression, formatNumber, numberSystem, convertToBase]);

    const handleKeyPress = (key: string) => {
        if (result === 'Error') {
            setExpression(key);
            setResult('');
            return;
        }

        switch (key) {
            case 'AC':
                setExpression('');
                setResult('');
                break;
            case 'Backspace':
                setExpression(prev => prev.slice(0, -1));
                break;
            case '=':
                evaluateExpression();
                break;
            case 'Rad':
            case 'Deg':
                setIsRadians(prev => !prev);
                break;
            case '2nd':
                setIsSecondFunction(prev => !prev);
                break;
            case 'logModal':
                setActiveModal('log');
                break;
            case 'settings':
                setShowSettings(prev => !prev);
                break;
            case 'history':
                setShowHistory(prev => !prev);
                break;
            default:
                setExpression(prev => prev + key);
                break;
        }
    };
    
    const keypadKeys = useMemo(() => {
        if (mode === 'base') return NUMBER_SYSTEM_KEYS(numberSystem);
        if (mode === 'scientific') return SCIENTIFIC_KEYS(isRadians, isSecondFunction);
        return BASIC_KEYS;
    }, [mode, numberSystem, isRadians, isSecondFunction]);
    
    const baseGridCols = mode === 'base' ? 'grid-cols-4' : 'grid-cols-5';

    return (
        <div className="min-h-screen bg-slate-900 flex justify-center items-center p-2">
            <div className="w-full max-w-md md:max-w-lg mx-auto relative">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-2 flex flex-col gap-1.5">
                    
                    <CalculatorDisplay expression={expression} result={result} numberSystem={numberSystem} />

                    <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                       <Button onClick={() => setMode('scientific')} variant={mode === 'scientific' ? 'special' : 'secondary'}>Sci</Button>
                       <Button onClick={() => setMode('base')} variant={mode === 'base' ? 'special' : 'secondary'}>Base</Button>
                       <Button onClick={() => setActiveModal('polynomial')} variant="secondary"><Sigma size={24}/></Button>
                       <Button onClick={() => setActiveModal('linear')} variant="secondary"><Variable size={24}/></Button>
                    </div>
                    
                    {mode === 'base' && (
                      <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                        {['BIN', 'OCT', 'DEC', 'HEX'].map(base => (
                          <Button key={base} onClick={() => setNumberSystem(base as NumberSystem)} variant={numberSystem === base ? 'special' : 'secondary'} className="h-10 text-lg">
                            {base}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className={`grid ${baseGridCols} gap-1.5`}>
                        {keypadKeys.map(({ key, label, variant, span, disabled }) => (
                            <Button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                variant={variant}
                                className={span ? 'col-span-2' : ''}
                                disabled={disabled}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                    
                    {showHistory && <div className="md:hidden fixed inset-0 bg-black/50 z-10" onClick={() => setShowHistory(false)}></div>}
                    <HistoryPanel 
                        isOpen={showHistory} 
                        history={history} 
                        onClear={() => setHistory([])}
                        onSelect={entry => { setExpression(entry.expression); setResult(entry.result); setShowHistory(false); }}
                        onClose={() => setShowHistory(false)}
                    />
                    {showSettings && <div className="md:hidden fixed inset-0 bg-black/50 z-10" onClick={() => setShowSettings(false)}></div>}
                    <SettingsPanel 
                      isOpen={showSettings}
                      precision={precision}
                      setPrecision={setPrecision}
                      isRadians={isRadians}
                      toggleAngleMode={() => setIsRadians(p => !p)}
                      onClose={() => setShowSettings(false)}
                    />
                </div>
            </div>
            {activeModal === 'polynomial' && <PolynomialSolverModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'linear' && <LinearSystemSolverModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'log' && <LogarithmModal onClose={() => setActiveModal(null)} onSelect={(text) => { setExpression(p => p + text); setActiveModal(null); }} />}
        </div>
    );
};

export default App;

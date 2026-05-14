import React, { useState, useRef, useCallback } from 'react';
import { MapPin, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Preset chips ─────────────────────────────────────────────────────────────
const PRESETS = [1, 2, 3, 5, 7, 10];

/**
 * DistanceFilter
 *
 * Props:
 *   radiusKm       {number}   current radius
 *   onChange       {fn}       called with new number
 *   onRefresh      {fn}       "Use My Location" button — re-triggers GPS
 *   loading        {boolean}  show spinner on refresh
 *   shopCount      {number}   shops found count (for display)
 */
export default function DistanceFilter({ radiusKm, onChange, onRefresh, loading = false, shopCount }) {
    const [customVal, setCustomVal] = useState('');
    const [customFocused, setCustomFocused] = useState(false);
    const inputRef = useRef(null);

    const applyCustom = useCallback(() => {
        const n = parseFloat(customVal);
        if (!isNaN(n) && n > 0) onChange(Math.min(n, 500)); // cap at 500km
        setCustomVal('');
    }, [customVal, onChange]);

    const handleKey = (e) => {
        if (e.key === 'Enter') applyCustom();
        if (e.key === 'Escape') { setCustomVal(''); inputRef.current?.blur(); }
    };

    return (
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100/80 shadow-sm p-4 sm:p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm shrink-0">
                        <MapPin size={13} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 leading-none">
                            Nearby Range
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {typeof shopCount === 'number'
                                ? `${shopCount} shop${shopCount !== 1 ? 's' : ''} within ${radiusKm} km`
                                : `Showing within ${radiusKm} km`}
                        </p>
                    </div>
                </div>

                {/* Refresh / Use My Location */}
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-[11px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60 shrink-0"
                >
                    <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Locating…' : 'My Location'}
                </motion.button>
            </div>

            {/* Preset chips — horizontally scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {PRESETS.map(km => (
                    <motion.button
                        key={km}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { onChange(km); setCustomVal(''); }}
                        className={`shrink-0 relative px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                            radiusKm === km
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                    >
                        {km} km
                        {radiusKm === km && (
                            <motion.span
                                layoutId="distance-active-dot"
                                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"
                            />
                        )}
                    </motion.button>
                ))}

                {/* Separator */}
                <div className="shrink-0 w-px bg-gray-200 mx-1 self-stretch" />

                {/* Custom input chip */}
                <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    customFocused
                        ? 'border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-200'
                        : 'border-gray-200 bg-gray-50'
                }`}>
                    <input
                        ref={inputRef}
                        type="number"
                        min="0.5"
                        max="500"
                        step="0.5"
                        value={customVal}
                        onChange={e => setCustomVal(e.target.value)}
                        onFocus={() => setCustomFocused(true)}
                        onBlur={() => { setCustomFocused(false); if (customVal) applyCustom(); }}
                        onKeyDown={handleKey}
                        placeholder="Custom"
                        className="w-16 bg-transparent text-xs font-black text-gray-700 outline-none placeholder:text-gray-400 placeholder:font-medium"
                    />
                    <span className="text-gray-400 font-medium">km</span>
                    <AnimatePresence>
                        {customVal && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                onClick={applyCustom}
                                className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0"
                            >
                                <ChevronRight size={11} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Active radius pill — shown when custom is active */}
            <AnimatePresence>
                {!PRESETS.includes(radiusKm) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-500">Custom range active:</span>
                            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                {radiusKm} km
                            </span>
                            <button
                                onClick={() => onChange(5)}
                                className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors ml-auto"
                            >
                                Reset
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

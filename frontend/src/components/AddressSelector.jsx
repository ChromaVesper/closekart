import React, { useState, Suspense, lazy, useCallback } from 'react';
import { X, Loader, MapPin, Plus } from 'lucide-react';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

const MapPickerLazy = lazy(() => import('./MapPicker'));

// ── Tab IDs ───────────────────────────────────────────────────────────────────
const TAB_LIST = 'list';
const TAB_FORM = 'form';  // add or edit
const TAB_MAP = 'map';

/**
 * AddressSelector
 *
 * Props:
 *   onClose()  – close the modal/panel
 *   inline     – if true, no fixed overlay wrapper (embedded in page)
 */
const AddressSelector = ({ onClose, inline = false }) => {
    const { user } = useAuth();
    const { addressList, selectedAddress, selectAddress, addAddress, updateAddress, setDefault, deleteAddress } = useAddress();

    const [tab, setTab] = useState(TAB_LIST);
    const [editTarget, setEditTarget] = useState(null); // address object when editing
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // ── open add form ─────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setError('');
        setTab(TAB_FORM);
    };

    // ── open edit form ────────────────────────────────────────────────────────
    const openEdit = (addr) => {
        setEditTarget(addr);
        setError('');
        setTab(TAB_FORM);
    };

    // ── save (add or edit) ────────────────────────────────────────────────────
    const handleFormSave = useCallback(async (fields) => {
        if (!user) { setError('Please log in first.'); setTab(TAB_LIST); return; }
        setSaving(true);
        setError('');
        try {
            let saved;
            if (editTarget) {
                saved = await updateAddress(editTarget._id, fields);
            } else {
                saved = await addAddress(fields);
                // Auto-select the new address
                selectAddress(saved);
            }
            setTab(TAB_LIST);
            if (!editTarget && onClose) onClose();
        } catch (err) {
            setError(err?.response?.data?.msg || 'Failed to save address. Try again.');
        } finally {
            setSaving(false);
        }
    }, [editTarget, user, addAddress, updateAddress, selectAddress, onClose]);

    // ── map tab save ─────────────────────────────────────────────────────────
    const handleMapSave = useCallback(async (loc) => {
        if (!user) { setError('Please log in first.'); setTab(TAB_LIST); return; }
        setSaving(true);
        setError('');
        try {
            const saved = await addAddress(loc);
            selectAddress(saved);
            setTab(TAB_LIST);
            if (onClose) onClose();
        } catch { setError('Failed to save address.'); }
        finally { setSaving(false); }
    }, [user, addAddress, selectAddress, onClose]);

    const handleSelect = (addr) => {
        selectAddress(addr);
        if (onClose) onClose();
    };

    const handleDelete = async (addr) => {
        try { await deleteAddress(addr._id); }
        catch { /* silent */ }
    };

    const handleSetDefault = async (addr) => {
        try { await setDefault(addr._id); }
        catch { /* silent */ }
    };

    // ── wrapper ───────────────────────────────────────────────────────────────
    const wrapper = inline
        ? 'bg-white rounded-2xl border border-gray-100 shadow-lg'
        : 'fixed inset-0 z-[9999] flex items-end sm:items-center justify-center';

    const panel = inline
        ? ''
        : 'w-full max-w-md sm:rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]';

    const overlay = inline ? null : (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    );

    const inner = (
        <div className={inline ? 'bg-white rounded-2xl overflow-hidden' : panel}>
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-500" />
                    <h2 className="font-bold text-gray-900 text-base">Choose Delivery Address</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* ── Tab bar (only on list view) ── */}
            {tab === TAB_LIST && (
                <div className="flex border-b border-gray-100">
                    {[['list', '📋 Saved'], ['map', '🗺️ Map']].map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 text-sm font-semibold transition
                                ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            )}
            {tab === TAB_MAP && (
                <div className="flex border-b border-gray-100">
                    {[['list', '📋 Saved'], ['map', '🗺️ Map']].map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 text-sm font-semibold transition
                                ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Body ── */}
            <div className="overflow-y-auto max-h-[520px] flex-1">

                {/* ───────── SAVED LIST TAB ───────── */}
                {tab === TAB_LIST && (
                    <div className="p-3 space-y-2">
                        {/* Add new button */}
                        <button onClick={openAdd}
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 text-blue-600 py-3 rounded-2xl text-sm font-semibold hover:bg-blue-50 transition mb-3">
                            <Plus size={16} /> Add New Address
                        </button>

                        {addressList.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <MapPin size={36} className="mx-auto mb-3 text-gray-200" />
                                <p className="font-semibold text-gray-500">No saved addresses</p>
                                <p className="text-xs mt-1">Add your first delivery address above</p>
                            </div>
                        )}

                        {addressList.map(addr => (
                            <AddressCard
                                key={addr._id}
                                address={addr}
                                isSelected={selectedAddress?._id === addr._id}
                                onSelect={() => handleSelect(addr)}
                                onEdit={() => openEdit(addr)}
                                onDelete={() => handleDelete(addr)}
                                onSetDefault={() => handleSetDefault(addr)}
                            />
                        ))}
                    </div>
                )}

                {/* ───────── ADD / EDIT FORM ───────── */}
                {tab === TAB_FORM && (
                    <AddressForm
                        initialData={editTarget}
                        onSave={handleFormSave}
                        onCancel={() => setTab(TAB_LIST)}
                        saving={saving}
                        error={error}
                    />
                )}

                {/* ───────── MAP TAB ───────── */}
                {tab === TAB_MAP && (
                    <div className="p-3">
                        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                        <Suspense fallback={
                            <div className="h-[420px] bg-gray-100 rounded-2xl flex items-center justify-center">
                                <Loader size={24} className="animate-spin text-blue-400" />
                            </div>
                        }>
                            <MapPickerLazy
                                showLabelPicker={true}
                                onCancel={() => setTab(TAB_LIST)}
                                onSave={handleMapSave}
                            />
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    );

    if (inline) return inner;

    return (
        <div className={wrapper}>
            {overlay}
            <div className="relative z-10 w-full max-w-md mx-4 sm:mx-0">
                {inner}
            </div>
        </div>
    );
};

export default AddressSelector;

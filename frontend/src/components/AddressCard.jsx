import React from 'react';
import { Home, Briefcase, Hotel, MapPin, Star, Pencil, Trash2, CheckCircle } from 'lucide-react';

const LABEL_ICON = {
    Home: Home,
    Work: Briefcase,
    Hotel: Hotel,
    Other: MapPin,
};
const LABEL_COLOR = {
    Home: 'bg-blue-50   text-blue-700  border-blue-200',
    Work: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Hotel: 'bg-amber-50  text-amber-700 border-amber-200',
    Other: 'bg-gray-50   text-gray-600  border-gray-200',
};

/**
 * AddressCard
 * Props:
 *   address  – address document from DB
 *   onSelect – () => void — make this the delivery address
 *   onEdit   – () => void — open edit form
 *   onDelete – () => void
 *   onSetDefault – () => void
 *   isSelected – bool — highlight border
 */
const AddressCard = ({ address, onSelect, onEdit, onDelete, onSetDefault, isSelected }) => {
    const Icon = LABEL_ICON[address.label] || MapPin;
    const color = LABEL_COLOR[address.label] || LABEL_COLOR.Other;

    const line1 = [address.houseNumber && `#${address.houseNumber}`, address.buildingName, address.floor && `Fl ${address.floor}`]
        .filter(Boolean).join(', ');
    const line2 = [address.area, address.landmark && `Near ${address.landmark}`].filter(Boolean).join(', ');
    const line3 = [address.city, address.state, address.pincode].filter(Boolean).join(', ');

    return (
        <div
            onClick={onSelect}
            className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all group
                ${isSelected
                    ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
                }`}
        >
            {/* Label badge + default star */}
            <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
                    <Icon size={11} />
                    {address.label}
                </span>
                {address.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} /> Default
                    </span>
                )}
                {isSelected && !address.isDefault && (
                    <span className="ml-auto text-xs font-semibold text-blue-600">Delivering here</span>
                )}
            </div>

            {/* Name + phone */}
            {(address.fullName || address.phoneNumber) && (
                <p className="text-xs font-semibold text-gray-800 mb-1">
                    {address.fullName}{address.phoneNumber && ` · ${address.phoneNumber}`}
                </p>
            )}

            {/* Address lines */}
            {line1 && <p className="text-sm text-gray-700 font-medium">{line1}</p>}
            {line2 && <p className="text-xs text-gray-500 mt-0.5">{line2}</p>}
            {line3 && <p className="text-xs text-gray-400 mt-0.5">{line3}</p>}
            {!line1 && !line2 && !line3 && (
                <p className="text-sm text-gray-600 line-clamp-2">{address.fullAddress}</p>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                {!address.isDefault && (
                    <button
                        onClick={onSetDefault}
                        className="text-xs text-gray-500 hover:text-blue-600 font-medium transition flex items-center gap-1"
                    >
                        <Star size={11} /> Set default
                    </button>
                )}
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit"
                    >
                        <Pencil size={13} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressCard;

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Search, ChevronDown, Check, X } from 'lucide-react';
import { WORLD_COUNTRIES, Country } from '../data/countries';

interface SearchableCountrySelectProps {
  value: string;
  onChange: (countryName: string, countryObj?: Country) => void;
  label?: string;
}

export const SearchableCountrySelect: React.FC<SearchableCountrySelectProps> = ({
  value,
  onChange,
  label = 'NEGARA',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected country
  const selectedCountry = WORLD_COUNTRIES.find(
    (c) => c.name.toLowerCase() === value.toLowerCase()
  );

  // Filter countries based on search query
  const filteredCountries = WORLD_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    onChange(country.name, country);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
          {label}
        </label>
      )}

      {/* Selector Button */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-950/60 border border-slate-800 hover:border-yellow-500/50 cursor-pointer outline-none rounded-xl pl-3.5 pr-4 py-2.5 text-xs font-medium text-white transition flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedCountry ? (
            <>
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="truncate text-slate-100">{selectedCountry.name}</span>
              {selectedCountry.dialCode && (
                <span className="text-[10px] text-slate-500 font-mono">({selectedCountry.dialCode})</span>
              )}
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-slate-400 font-normal">-- Pilih Negara / Select Country --</span>
            </>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
      </div>

      {/* Dropdown Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-[#0f0724] border border-white/15 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#150933]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Pilih Negara / Select Country
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 border-b border-white/10 bg-[#0d051f]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari negara / Search country..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-yellow-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto p-2 space-y-1 flex-1 divide-y divide-white/5">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  const isSelected = selectedCountry?.name === country.name;
                  return (
                    <div
                      key={country.code + country.name}
                      onClick={() => handleSelect(country)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition text-xs ${
                        isSelected
                          ? 'bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30'
                          : 'hover:bg-white/5 text-slate-200 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">{country.flag}</span>
                        <div>
                          <p className="font-semibold">{country.name}</p>
                          {country.dialCode && (
                            <p className="text-[10px] text-slate-400">{country.dialCode}</p>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-yellow-400" />}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada negara ditemukan untuk &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableCountrySelect;

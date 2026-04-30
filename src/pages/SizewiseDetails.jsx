import { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import sizewiseData from '../data/sizewise_details.json';

const RulerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6.75 3.75a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM9 3.75a.75.75 0 000 1.5h2.25a.75.75 0 000-1.5H9zM13.5 3.75a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM15.75 3.75a.75.75 0 000 1.5h2.25a.75.75 0 000-1.5h-2.25zM19.5 8.25a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zM19.5 11.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM19.5 15.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM4.5 2.25A2.25 2.25 0 002.25 4.5v15A2.25 2.25 0 004.5 21.75h15A2.25 2.25 0 0021.75 19.5v-15A2.25 2.25 0 0019.5 2.25h-15zM3.75 4.5c0-.414.336-.75.75-.75h1.5v2.25h-1.5A.75.75 0 013.75 4.5zm0 3v1.5h2.25v-1.5H3.75zm0 3v1.5h1.5v-1.5H3.75zm0 3v1.5h2.25v-1.5H3.75zm0 3v1.5h1.5A.75.75 0 014.5 18h-.75zM18 19.5h-1.5v-2.25h1.5c.414 0 .75.336.75.75v1.5zM15.75 19.5H14.25v-2.25h1.5v2.25zM12.75 19.5H11.25v-2.25h1.5v2.25zM9.75 19.5H8.25v-2.25h1.5v2.25zM6.75 19.5H5.25A.75.75 0 014.5 18.75v-.75h2.25v1.5z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

function SelectBase({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border-gray-200 border-2 p-3.5 rounded-2xl bg-white focus:border-indigo-400 outline-none text-sm font-bold transition-all disabled:opacity-50 disabled:bg-gray-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%20fill%3D%22currentColor%22%20className%3D%22w-5%20h-5%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.22%208.22a.75.75%200%20011.06%200L10%2011.94l3.72-3.72a.75.75%200%2011%201.06%201.06l-4.25%204.25a.75.75%200%2001-1.06%200L5.22%209.28a.75.75%200%20010-1.06z%22%20clip-rule%3D%22evenodd%22%20/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id || opt} value={opt.id || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SizewiseDetails() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('');
  const [selectedPanna, setSelectedPanna] = useState('');
  const [designSearch, setDesignSearch] = useState('');

  const categories = Object.keys(sizewiseData);

  const filteredDesigns = useMemo(() => {
    if (!selectedCategory) return [];
    const all = sizewiseData[selectedCategory].map(d => d.name);
    if (!designSearch) return all;
    return all.filter(name => name.toLowerCase().includes(designSearch.toLowerCase()));
  }, [selectedCategory, designSearch]);

  const pannaOptions = useMemo(() => {
    if (!selectedCategory || !selectedDesign) return [];
    const design = sizewiseData[selectedCategory].find(d => d.name === selectedDesign);
    if (!design || !design.sizes.length) return [];
    
    const widths = new Set();
    design.sizes.forEach(s => {
      Object.keys(s.lengths).forEach(w => {
        // Only add if there's at least one non-null value for this width across any size
        if (s.lengths[w] !== null) widths.add(w);
      });
    });
    return Array.from(widths).sort((a, b) => Number(a) - Number(b));
  }, [selectedCategory, selectedDesign]);

  const currentDesign = useMemo(() => {
    if (!selectedCategory || !selectedDesign) return null;
    return sizewiseData[selectedCategory].find(d => d.name === selectedDesign);
  }, [selectedCategory, selectedDesign]);

  const tableData = useMemo(() => {
    if (!currentDesign || !selectedPanna) return [];
    return currentDesign.sizes.map(s => ({
      size: s.size,
      pieces: s.pieces,
      length: s.lengths[selectedPanna]
    })).filter(item => item.length !== null);
  }, [currentDesign, selectedPanna]);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white px-5 py-6 border-b border-gray-100 shadow-sm relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner">
            <RulerIcon />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t('sizewiseDetails.title')}</h1>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{t('sizewiseDetails.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Selection Area */}
        <div className="bg-white rounded-[2.5rem] p-7 border-2 border-gray-100 shadow-xl shadow-indigo-100/20 space-y-6">
          <SelectBase 
            label={t('sizewiseDetails.selectCategory')}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setSelectedDesign('');
              setSelectedPanna('');
              setDesignSearch('');
            }}
            options={categories}
            placeholder={t('forms.select')}
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('sizewiseDetails.selectDesign')}</label>
              {selectedCategory && (
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={designSearch}
                    onChange={(e) => setDesignSearch(e.target.value)}
                    className="pl-7 pr-3 py-1 bg-gray-50 border-gray-200 border rounded-lg text-[10px] font-bold outline-none focus:border-indigo-400 transition-all w-24 focus:w-32"
                  />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </div>
                </div>
              )}
            </div>
            <select
              value={selectedDesign}
              onChange={(e) => {
                setSelectedDesign(e.target.value);
                setSelectedPanna('');
              }}
              disabled={!selectedCategory}
              className="w-full border-gray-200 border-2 p-3.5 rounded-2xl bg-white focus:border-indigo-400 outline-none text-sm font-bold transition-all disabled:opacity-50 disabled:bg-gray-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%20fill%3D%22currentColor%22%20className%3D%22w-5%20h-5%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.22%208.22a.75.75%200%20011.06%200L10%2011.94l3.72-3.72a.75.75%200%2011%201.06%201.06l-4.25%204.25a.75.75%200%2001-1.06%200L5.22%209.28a.75.75%200%20010-1.06z%22%20clip-rule%3D%22evenodd%22%20/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
            >
              <option value="">{t('forms.select')}</option>
              {filteredDesigns.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <SelectBase 
            label={t('sizewiseDetails.selectPanna')}
            value={selectedPanna}
            onChange={setSelectedPanna}
            disabled={!selectedDesign}
            options={pannaOptions.map(w => ({ id: w, label: `${w}" Panna` }))}
            placeholder={t('forms.select')}
          />
        </div>

        {/* Results Area */}
        {selectedCategory && selectedDesign && selectedPanna ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-2xl shadow-indigo-100/30 overflow-hidden animate-slideUp">
            {/* Design Info Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-7 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">{selectedCategory}</p>
                    <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">{selectedDesign}</h2>
                  </div>
                  <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-100 mb-0.5">{t('sizewiseDetails.pieces')}</p>
                    <p className="text-2xl font-black tracking-tighter">{currentDesign?.pieces || '-'}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t('sizewiseDetails.pannaWidth')}:</span>
                    <span className="text-sm font-black text-indigo-900">{selectedPanna}"</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-indigo-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100">Unit:</span>
                    <span className="text-sm font-black text-white capitalize">{t('sizewiseDetails.meters')}</span>
                  </div>
                </div>
              </div>
              {/* Decorative circle */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Table */}
            <div className="p-6">
              <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm bg-gray-50/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('sizewiseDetails.size')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('sizewiseDetails.pieces')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t('sizewiseDetails.length')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    {tableData.length > 0 ? (
                      tableData.map((row, i) => (
                        <tr key={i} className="hover:bg-white transition-colors group">
                          <td className="px-6 py-5 text-sm text-gray-900">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {row.size}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-500 text-center font-black">
                            {row.pieces !== "--" ? row.pieces : <span className="opacity-20">-</span>}
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-900 text-right">
                            <span className="text-lg font-black text-indigo-600 group-hover:text-indigo-800 transition-colors">
                              {row.length}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase ml-1.5">{t('sizewiseDetails.meters')}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-400 italic bg-white">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">📏</span>
                            {t('sizewiseDetails.noDataForPanna')}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Overall Size List Summary */}
              {currentDesign?.sizes && (
                <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {t('sizewiseDetails.overallSizeList')}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {currentDesign.sizes.map(s => (
                      <span key={s.size} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 shadow-sm hover:border-indigo-300 transition-colors cursor-default">
                        {s.size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 px-10">
            <div className="w-20 h-20 bg-white shadow-2xl shadow-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-500 border border-gray-50">
              <div className="scale-125"><RulerIcon /></div>
            </div>
            <div className="max-w-[240px]">
              <p className="text-gray-900 font-black text-base mb-1 tracking-tight">Ready to Measure</p>
              <p className="text-gray-400 text-xs font-bold leading-relaxed">
                {t('sizewiseDetails.selectOptionsToView')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

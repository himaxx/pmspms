import { useState, useMemo } from 'react';
import { useSizewiseData, useUpdateSizewiseDesign, useDeleteSizewiseDesign } from '../../hooks/useSizewiseData';

export default function SizewiseAdmin() {
  const { data: sizewiseData, isLoading } = useSizewiseData();
  const updateMutation = useUpdateSizewiseDesign();
  const deleteMutation = useDeleteSizewiseDesign();

  const [selectedCategory, setSelectedCategory] = useState('Tops');
  const [editingDesign, setEditingDesign] = useState(null); // { id, name, pieces, sizes }
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  const categories = ["Full Bottoms", "Tops", "Capri", "Shorts", "Skirts", "Long Tops", "Sets", "Boys"];

  const filteredDesigns = useMemo(() => {
    if (!sizewiseData || !sizewiseData[selectedCategory]) return [];
    const list = sizewiseData[selectedCategory];
    if (!search) return list;
    return list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [sizewiseData, selectedCategory, search]);

  const handleEdit = (design) => {
    setEditingDesign(JSON.parse(JSON.stringify(design))); // Deep copy
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setEditingDesign({
      id: undefined,
      name: '',
      pieces: '',
      sizes: [
        { size: '22/32', pieces: '', lengths: {} },
        { size: '22/36', pieces: '', lengths: {} },
        { size: '24/30', pieces: '', lengths: {} },
        { size: '26/36', pieces: '', lengths: {} },
        { size: '32/40', pieces: '', lengths: {} },
        { size: '34/38', pieces: '', lengths: {} },
        { size: '20/30', pieces: '', lengths: {} },
      ]
    });
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!editingDesign.name.trim()) return alert('Design name is required');
    try {
      await updateMutation.mutateAsync({
        id: editingDesign.id,
        category: selectedCategory,
        design_name: editingDesign.name,
        pieces: editingDesign.pieces,
        sizes: editingDesign.sizes
      });
      setEditingDesign(null);
      setIsAdding(false);
    } catch (e) {
      alert('Error saving: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      alert('Error deleting: ' + e.message);
    }
  };

  if (isLoading) return <div className="p-10 text-gray-400 animate-pulse font-black uppercase tracking-widest text-center">Loading Sizewise Data...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Category Bar */}
      <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-2xl border border-white/10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setEditingDesign(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Design List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Designs ({filteredDesigns.length})</h3>
            <button 
              onClick={handleAddNew}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg transition-colors"
            >
              + ADD NEW
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search design..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
            {filteredDesigns.map(d => (
              <div 
                key={d.id}
                onClick={() => handleEdit(d)}
                className={`group flex items-center justify-between p-4 cursor-pointer border-b border-white/5 last:border-0 transition-all ${
                  editingDesign?.id === d.id ? 'bg-indigo-600/20 border-l-4 border-l-indigo-500' : 'hover:bg-white/5'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{d.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{d.pieces || '-'} Pieces · {d.sizes.length} Sizes</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 3A2.75 2.75 0 006 5.75v.562c-.34.059-.68.124-1.022.196a.75.75 0 10.312 1.468h.511l.686 8.228a2.75 2.75 0 002.734 2.521h2.538a2.75 2.75 0 002.734-2.521l.686-8.228h.511a.75.75 0 10.312-1.468A48.701 48.701 0 0014 6.312V5.75A2.75 2.75 0 0011.25 3h-2.5zm1 2.25a1.25 1.25 0 011.25-1.25h2.5a1.25 1.25 0 011.25 1.25v.465c-.507-.027-1.015-.049-1.523-.067a48.941 48.941 0 00-2.227 0c-.508.018-1.016.04-1.523.067V5.25z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            {filteredDesigns.length === 0 && (
              <div className="p-10 text-center text-gray-600 text-xs italic">No designs found</div>
            )}
          </div>
        </div>

        {/* Editor Pane */}
        <div className="lg:col-span-2">
          {editingDesign ? (
            <div className="bg-gray-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur space-y-6 sticky top-20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-black text-white uppercase tracking-widest">
                  {isAdding ? 'Add New Design' : 'Edit Design'}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingDesign(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-900/40"
                  >
                    {updateMutation.isPending ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Design Name</label>
                  <input 
                    type="text" 
                    value={editingDesign.name}
                    onChange={(e) => setEditingDesign({...editingDesign, name: e.target.value.toUpperCase()})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Default Pieces</label>
                  <input 
                    type="text" 
                    value={editingDesign.pieces}
                    onChange={(e) => setEditingDesign({...editingDesign, pieces: e.target.value})}
                    placeholder="e.g. 24"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Sizes Grid Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sizes & Lengths (Meters)</h4>
                  <button 
                    onClick={() => {
                      const newSizes = [...editingDesign.sizes, { size: '', pieces: '', lengths: {} }];
                      setEditingDesign({...editingDesign, sizes: newSizes});
                    }}
                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300"
                  >
                    + ADD SIZE ROW
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Pcs</th>
                        {[51, 52, 53, 54, 55, 56, 58, 60, 62].map(p => (
                          <th key={p} className="px-2 py-3 text-center">{p}"</th>
                        ))}
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {editingDesign.sizes.map((s, sIdx) => (
                        <tr key={sIdx} className="hover:bg-white/5 transition-colors">
                          <td className="px-2 py-2">
                            <input 
                              type="text" 
                              value={s.size}
                              onChange={(e) => {
                                const newSizes = [...editingDesign.sizes];
                                newSizes[sIdx].size = e.target.value;
                                setEditingDesign({...editingDesign, sizes: newSizes});
                              }}
                              className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-indigo-300 outline-none focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input 
                              type="text" 
                              value={s.pieces}
                              onChange={(e) => {
                                const newSizes = [...editingDesign.sizes];
                                newSizes[sIdx].pieces = e.target.value;
                                setEditingDesign({...editingDesign, sizes: newSizes});
                              }}
                              placeholder="--"
                              className="w-10 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-400 outline-none text-center"
                            />
                          </td>
                          {[51, 52, 53, 54, 55, 56, 58, 60, 62].map(p => (
                            <td key={p} className="px-1 py-2">
                              <input 
                                type="number" 
                                step="0.01"
                                value={s.lengths[p] ?? ''}
                                onChange={(e) => {
                                  const newSizes = [...editingDesign.sizes];
                                  const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                  newSizes[sIdx].lengths = { ...newSizes[sIdx].lengths, [p]: val };
                                  setEditingDesign({...editingDesign, sizes: newSizes});
                                }}
                                placeholder="-"
                                className="w-12 bg-transparent text-[11px] font-bold text-white outline-none text-center hover:bg-white/5 focus:bg-indigo-600/20 rounded transition-all"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-2 text-right">
                            <button 
                              onClick={() => {
                                const newSizes = editingDesign.sizes.filter((_, i) => i !== sIdx);
                                setEditingDesign({...editingDesign, sizes: newSizes});
                              }}
                              className="text-gray-600 hover:text-red-400 transition-colors"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-gray-900/20">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <p className="text-sm font-black text-white uppercase tracking-widest mb-1">Select a Design to Edit</p>
              <p className="text-xs text-gray-500 font-medium max-w-[280px]">
                Choose a design from the list on the left to modify its measurements, or click "Add New" to create a design from scratch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

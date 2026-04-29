import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase';

function useSystemLogs() {
  return useQuery({
    queryKey: ['system_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Fetch last 1000 logs
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // auto refresh every 30s
  });
}

const ACTION_COLORS = {
  INSERT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  UPDATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const ENTITY_COLORS = {
  JOBS: 'text-blue-400',
  BILTY_FMS: 'text-purple-400',
  PURCHASE_FMS: 'text-emerald-400',
  FMS_O2D_ORDERS: 'text-amber-400',
  FMS_O2D_DISPATCHES: 'text-orange-400'
};

function getChanges(oldData, newData) {
  if (!oldData || !newData) return [];
  const changes = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  for (const key of allKeys) {
    // Ignore purely internal fields or ones that just update timestamps automatically
    if (key === 'updated_at') continue;
    
    const o = oldData[key];
    const n = newData[key];
    
    if (JSON.stringify(o) !== JSON.stringify(n)) {
      changes.push({
        field: key,
        oldValue: o,
        newValue: n
      });
    }
  }
  return changes;
}

export default function SystemLogsExplorer() {
  const { data: logs, isLoading, error, refetch } = useSystemLogs();
  const [filterEntity, setFilterEntity] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  if (isLoading) return <div className="text-gray-400 py-10 text-center animate-pulse">Loading system logs...</div>;
  if (error) return <div className="text-red-400 py-10 text-center">Error loading logs: {error.message}</div>;

  const filteredLogs = logs?.filter(log => {
    if (filterEntity !== 'ALL' && log.entity_type !== filterEntity) return false;
    if (filterAction !== 'ALL' && log.action_type !== filterAction) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        log.entity_identifier?.toLowerCase().includes(s) ||
        log.description?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="bg-gray-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-sm font-black text-white tracking-tight">🕵️ System Audit Logs</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time tracking of all data modifications across the system</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <input 
            type="text" 
            placeholder="Search identifier..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 w-40"
          />
          <select 
            value={filterEntity} 
            onChange={(e) => setFilterEntity(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="ALL">All Modules</option>
            <option value="JOBS">PMS Forms (Jobs)</option>
            <option value="BILTY_FMS">Bilty FMS</option>
            <option value="PURCHASE_FMS">Purchase FMS</option>
            <option value="FMS_O2D_ORDERS">O2D Orders</option>
            <option value="FMS_O2D_DISPATCHES">O2D Dispatches</option>
          </select>
          <select 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="INSERT">Creates (INSERT)</option>
            <option value="UPDATE">Edits (UPDATE)</option>
            <option value="DELETE">Deletions (DELETE)</option>
          </select>
          <button onClick={() => refetch()} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors">
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-widest text-left">
              <th className="pb-3 pl-2">Timestamp</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Module</th>
              <th className="pb-3">Identifier</th>
              <th className="pb-3 text-right pr-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLogs?.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">No logs match your filters.</td>
              </tr>
            )}
            {filteredLogs?.map(log => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                  <td className="py-3 pl-2 text-gray-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black tracking-widest ${ACTION_COLORS[log.action_type] || 'bg-gray-500/20 text-gray-400'}`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-3 font-bold">
                    <span className={ENTITY_COLORS[log.entity_type] || 'text-gray-300'}>{log.entity_type}</span>
                  </td>
                  <td className="py-3 text-white font-medium">{log.entity_identifier || '—'}</td>
                  <td className="py-3 pr-2 text-right">
                    <span className="text-indigo-400 text-[10px] group-hover:underline">
                      {expandedLogId === log.id ? 'Hide Data ▲' : 'View Data ▼'}
                    </span>
                  </td>
                </tr>
                {expandedLogId === log.id && (
                  <tr className="bg-black/40">
                    <td colSpan="5" className="p-4 border-t border-b border-white/5">
                      {log.action_type === 'UPDATE' && log.old_data && log.new_data ? (
                        <div className="bg-gray-900/80 rounded-xl p-4 overflow-hidden border border-white/5">
                          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                            <span className="text-amber-400">⚡</span> Modified Fields
                          </h4>
                          <div className="grid grid-cols-[1fr_2fr_2fr] gap-4 text-[10px] uppercase tracking-widest font-black text-gray-500 border-b border-white/10 pb-2 mb-2">
                            <div>Field Name</div>
                            <div className="text-red-400">Previous Value</div>
                            <div className="text-emerald-400">New Value</div>
                          </div>
                          <div className="space-y-2">
                            {getChanges(log.old_data, log.new_data).map((change, i) => (
                              <div key={i} className="grid grid-cols-[1fr_2fr_2fr] gap-4 items-center py-1.5 hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                                <div className="text-indigo-300 font-mono text-[10px] break-all">{change.field}</div>
                                <div className="text-gray-400 font-medium break-all line-through decoration-red-500/50">
                                  {change.oldValue === null || change.oldValue === undefined ? '—' : String(change.oldValue)}
                                </div>
                                <div className="text-emerald-300 font-bold break-all bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                                  {change.newValue === null || change.newValue === undefined ? '—' : String(change.newValue)}
                                </div>
                              </div>
                            ))}
                            {getChanges(log.old_data, log.new_data).length === 0 && (
                              <div className="text-gray-500 text-xs py-2">No functional fields changed (maybe just an internal trigger update).</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {log.old_data && (
                            <div className="bg-gray-900/80 rounded-lg p-3 overflow-x-auto border border-white/5">
                              <div className="text-[10px] font-bold text-red-400 mb-2 tracking-widest uppercase flex items-center gap-2">
                                <span>🗑️</span> Deleted Data
                              </div>
                              <pre className="text-[10px] text-gray-400 font-mono leading-relaxed">{JSON.stringify(log.old_data, null, 2)}</pre>
                            </div>
                          )}
                          {log.new_data && (
                            <div className="bg-gray-900/80 rounded-lg p-3 overflow-x-auto border border-white/5">
                              <div className="text-[10px] font-bold text-emerald-400 mb-2 tracking-widest uppercase flex items-center gap-2">
                                <span>✨</span> Inserted Data
                              </div>
                              <pre className="text-[10px] text-gray-400 font-mono leading-relaxed">{JSON.stringify(log.new_data, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

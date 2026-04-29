import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase';
import { addWorkingHours, workingHoursBetween, fmtWorkingDateTime } from '../../utils/workingHours';

// ─── Query Hooks ─────────────────────────────────────────────────────────────
const O2D_QUERY_KEY = ['o2d_orders'];

function useO2DOrders() {
  return useQuery({
    queryKey: O2D_QUERY_KEY,
    queryFn: async () => {
      const { data: orders, error: oErr } = await supabase
        .from('fms_o2d_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (oErr) throw oErr;

      const { data: dispatches, error: dErr } = await supabase
        .from('fms_o2d_dispatches')
        .select('*')
        .order('created_at', { ascending: true });
      if (dErr) throw dErr;

      // Group dispatches
      const dispatchMap = {};
      dispatches.forEach(d => {
        if (!dispatchMap[d.order_id]) dispatchMap[d.order_id] = [];
        dispatchMap[d.order_id].push(d);
      });

      return orders.map(o => {
        const orderDispatches = dispatchMap[o.id] || [];
        const totalDispatched = orderDispatches.reduce((acc, d) => acc + Number(d.dispatch_qty || 0), 0);
        
        let status = 'Pending';
        if (totalDispatched > 0 && totalDispatched < Number(o.order_qty)) status = 'Partial Qty Pending';
        else if (totalDispatched === Number(o.order_qty)) status = 'Completed';
        else if (totalDispatched > Number(o.order_qty)) status = 'Over Delivered';

        return {
          ...o,
          dispatches: orderDispatches,
          totalDispatched,
          computedStatus: status
        };
      });
    }
  });
}

function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.from('fms_o2d_orders').insert([payload]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: O2D_QUERY_KEY })
  });
}

function useCreateDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.from('fms_o2d_dispatches').insert([payload]).select().single();
      if (error) throw error;
      
      // We also update the order status to reflect the new state, but for simplicity, 
      // the status is computed on the fly in the query.
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: O2D_QUERY_KEY })
  });
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function OrderEntryForm({ onSuccess }) {
  const createMutation = useCreateOrder();
  const [formData, setFormData] = useState({
    vastra_order_no: '',
    customer_name: '',
    agent_name: '',
    order_qty: '',
    order_type: 'Regular', // Phone, Regular, Self Selection Visit
    dispatch_requirement: '',
    product_ordered: '',
    lead_time_hrs: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate planned dispatch time
    const now = new Date();
    const planned = addWorkingHours(now, Number(formData.lead_time_hrs) || 0);

    createMutation.mutate({
      ...formData,
      planned_dispatch_time: planned.toISOString(),
      status: 'Pending'
    }, {
      onSuccess: () => {
        alert('Order created successfully!');
        setFormData({
          vastra_order_no: '', customer_name: '', agent_name: '', order_qty: '',
          order_type: 'Regular', dispatch_requirement: '', product_ordered: '', lead_time_hrs: ''
        });
        if (onSuccess) onSuccess();
      },
      onError: (err) => alert(err.message)
    });
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 anim-slideUp">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Step 1: Order Entry</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Vastra Order No *</label>
          <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.vastra_order_no} onChange={e => setFormData({...formData, vastra_order_no: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name *</label>
          <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Agent Name</label>
          <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.agent_name} onChange={e => setFormData({...formData, agent_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Quantity *</label>
          <input required type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.order_qty} onChange={e => setFormData({...formData, order_qty: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Order Type</label>
          <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.order_type} onChange={e => setFormData({...formData, order_type: e.target.value})}>
            <option value="Phone">Phone</option>
            <option value="Regular">Regular</option>
            <option value="Self Selection Visit">Self Selection Visit</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Dispatch Requirement</label>
          <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.dispatch_requirement} onChange={e => setFormData({...formData, dispatch_requirement: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Ordered</label>
          <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.product_ordered} onChange={e => setFormData({...formData, product_ordered: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Lead Time (Hours) *</label>
          <input required type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
            value={formData.lead_time_hrs} onChange={e => setFormData({...formData, lead_time_hrs: e.target.value})} />
        </div>
        
        <div className="md:col-span-2 pt-2">
          <button disabled={createMutation.isPending} type="submit" className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 btn-press shadow-md shadow-amber-500/20">
            {createMutation.isPending ? 'Saving...' : 'Submit Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DispatchEntryForm({ orders, onSuccess }) {
  const createMutation = useCreateDispatch();
  const [formData, setFormData] = useState({
    order_id: '',
    bill_no: '',
    customer_name_cross_check: false,
    dispatch_qty: ''
  });

  const selectedOrder = orders?.find(o => o.id === formData.order_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    // Calculate delay
    const now = new Date();
    const planned = selectedOrder.planned_dispatch_time ? new Date(selectedOrder.planned_dispatch_time) : now;
    const delayHrs = workingHoursBetween(planned, now);

    createMutation.mutate({
      order_id: formData.order_id,
      bill_no: formData.bill_no,
      customer_name_cross_check: formData.customer_name_cross_check,
      dispatch_qty: formData.dispatch_qty,
      dispatch_date: now.toISOString(),
      delay_hrs: delayHrs
    }, {
      onSuccess: () => {
        alert('Dispatch entry added!');
        setFormData({ order_id: '', bill_no: '', customer_name_cross_check: false, dispatch_qty: '' });
        if (onSuccess) onSuccess();
      },
      onError: (err) => alert(err.message)
    });
  };

  const pendingOrders = orders?.filter(o => o.computedStatus !== 'Completed' && o.computedStatus !== 'Over Delivered') || [];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 anim-slideUp">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Step 2: Dispatch Entry</h2>
      
      {pendingOrders.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
          No pending orders available for dispatch.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Pending Order *</label>
            <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
              value={formData.order_id} onChange={e => setFormData({...formData, order_id: e.target.value})}>
              <option value="">-- Select Vastra Order --</option>
              {pendingOrders.map(o => (
                <option key={o.id} value={o.id}>Order No: {o.vastra_order_no} | {o.customer_name} | Qty: {o.order_qty} ({o.order_qty - o.totalDispatched} pending)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Bill No *</label>
            <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
              value={formData.bill_no} onChange={e => setFormData({...formData, bill_no: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Dispatch Qty *</label>
            <input required type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
              value={formData.dispatch_qty} onChange={e => setFormData({...formData, dispatch_qty: e.target.value})} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <input type="checkbox" id="crosscheck" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-gray-300"
              checked={formData.customer_name_cross_check} onChange={e => setFormData({...formData, customer_name_cross_check: e.target.checked})} />
            <label htmlFor="crosscheck" className="text-sm font-medium text-gray-700 cursor-pointer">
              Customer Name Cross-Checked (Matches Order)
            </label>
          </div>

          <div className="md:col-span-2 pt-2">
            <button disabled={createMutation.isPending || !formData.order_id} type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 btn-press shadow-md shadow-indigo-500/20">
              {createMutation.isPending ? 'Saving...' : 'Add Dispatch Entry'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function TrackingList({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center p-8 text-gray-500">No Orders Found</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden anim-slideUp">
          <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4 border-b border-gray-50 bg-gray-50/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-black text-gray-900 text-lg">Order #{o.vastra_order_no}</span>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider
                  ${o.computedStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    o.computedStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    o.computedStatus === 'Over Delivered' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'}`}>
                  {o.computedStatus}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{o.customer_name} • {o.order_type}</p>
            </div>
            <div className="flex flex-row md:flex-col gap-4 md:gap-1 text-sm">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-gray-400 text-xs block">Ordered</span>
                <span className="font-bold text-gray-800">{o.order_qty} pcs</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-gray-400 text-xs block">Dispatched</span>
                <span className="font-bold text-indigo-600">{o.totalDispatched} pcs</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>Planned Dispatch: <strong className="text-gray-700">{fmtWorkingDateTime(o.planned_dispatch_time)}</strong></span>
              <span>Lead Time: {o.lead_time_hrs}h</span>
            </div>
            
            {o.dispatches.length > 0 ? (
              <div className="mt-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dispatch History</h4>
                {o.dispatches.map((d, i) => (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                      <span className="font-bold text-gray-800">Bill: {d.bill_no}</span>
                    </div>
                    <span className="font-medium text-gray-600">{d.dispatch_qty} pcs</span>
                    <span className="text-xs text-gray-500">{fmtWorkingDateTime(d.dispatch_date)}</span>
                    <span className={`text-xs font-bold ${Number(d.delay_hrs) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {Number(d.delay_hrs) > 0 ? `Delayed ${d.delay_hrs}h` : 'On Time'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">No dispatches yet.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Order2DeliveryPage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'order' | 'dispatch'
  const { data: orders, isLoading, error } = useO2DOrders();

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Order to Delivery data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Tabs */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1 sticky top-[101px] z-20 backdrop-blur-md mb-6">
        <button onClick={() => setActiveTab('list')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Tracking List
        </button>
        <button onClick={() => setActiveTab('order')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'order' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Step 1: Order
        </button>
        <button onClick={() => setActiveTab('dispatch')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'dispatch' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Step 2: Dispatch
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="space-y-4 anim-slideUp">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl font-black text-gray-900">Delivery Tracking</h2>
            <div className="text-xs text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">
              {orders?.length || 0} Orders
            </div>
          </div>
          <TrackingList orders={orders} />
        </div>
      )}

      {activeTab === 'order' && <OrderEntryForm onSuccess={() => setActiveTab('list')} />}
      
      {activeTab === 'dispatch' && <DispatchEntryForm orders={orders} onSuccess={() => setActiveTab('list')} />}

    </div>
  );
}

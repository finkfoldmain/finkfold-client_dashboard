'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { AlertCircle, CheckCircle2, User, Phone } from 'lucide-react';

export default function LeadTable({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Toggle AI / Human Takeover
  const toggleBot = async (leadId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('re_buyer_leads')
      .update({ 
        bot_paused: !currentStatus,
        handoff_reason: !currentStatus ? 'Human agent took over from dashboard' : null 
      })
      .eq('id', leadId);
    
    if (!error) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, bot_paused: !currentStatus } : l));
    }
  };

  const formatBudget = (min: number, max: number) => {
    const fmt = (n: number) => n >= 10000000 ? `${(n/10000000).toFixed(2)} Cr` : n >= 100000 ? `${(n/100000).toFixed(1)} L` : n;
    if (!min && !max) return 'Not set';
    return `${min ? fmt(min) : '?'} - ${max ? fmt(max) : '?'}`;
  };

  return (
    <div className="bg-secondary rounded-xl border border-border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-primary/50">
            <th className="p-4 text-sm font-semibold text-text-secondary">Customer</th>
            <th className="p-4 text-sm font-semibold text-text-secondary">Requirement</th>
            <th className="p-4 text-sm font-semibold text-text-secondary">Budget</th>
            <th className="p-4 text-sm font-semibold text-text-secondary">Status</th>
            <th className="p-4 text-sm font-semibold text-text-secondary">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-text-secondary">
                No leads yet. Send a WhatsApp message to your bot to see it here.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border hover:bg-primary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{lead.name || 'Unknown'}</p>
                      <p className="text-sm text-text-secondary flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-medium text-text-primary">{lead.property_type_interest || 'Any BHK'}</p>
                  <p className="text-sm text-text-secondary">{lead.preferred_areas?.join(', ') || 'Any Area'}</p>
                </td>
                <td className="p-4 text-text-primary font-medium">
                  {formatBudget(lead.budget_min, lead.budget_max)}
                </td>
                <td className="p-4">
                  {lead.bot_paused ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                      <AlertCircle className="w-3 h-3" /> Human Handling
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                      <CheckCircle2 className="w-3 h-3" /> AI Handling
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleBot(lead.id, lead.bot_paused)}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                      lead.bot_paused ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {lead.bot_paused ? 'Resume AI' : 'Take Over'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LeadTable from '@/components/LeadTable';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  // Fetch leads for this client
  const { data: leads } = await supabase
    .from('re_buyer_leads')
    .select('*')
    .order('last_inbound_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
          <p className="text-text-secondary">Manage your WhatsApp AI agent conversations</p>
        </div>
        <div className="bg-secondary px-4 py-2 rounded-lg border border-border">
          <span className="text-sm text-text-secondary">Total Leads: </span>
          <span className="font-bold text-text-primary">{leads?.length || 0}</span>
        </div>
      </div>

      <LeadTable initialLeads={leads || []} />
    </div>
  );
}

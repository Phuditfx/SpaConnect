import { supabase } from '../../../lib/supabase';

// Fetch the current credit balance for a branch
export const getCreditBalance = async (branchId: string) => {
  const { data, error } = await supabase
    .from('branches')
    .select('credit_balance')
    .eq('id', branchId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }

  return data.credit_balance;
};

// Top up credits using RPC
export const topUpCredits = async (branchId: string, amount: number) => {
  const { data, error } = await supabase.rpc('topup_credits', {
    p_branch_id: branchId,
    p_amount: amount
  });

  if (error) {
    throw new Error(`Top up failed: ${error.message}`);
  }

  return data;
};

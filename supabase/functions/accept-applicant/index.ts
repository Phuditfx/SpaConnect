import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for admin privileges
    )

    const { applicationId } = await req.json()

    if (!applicationId) {
      throw new Error('applicationId is required')
    }

    // 1. Fetch the application to get job_id and freelance_profile_id
    const { data: application, error: appError } = await supabaseClient
      .from('job_applications')
      .select('job_id, freelance_profile_id')
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      throw new Error(`Application not found: ${appError?.message}`)
    }

    const { job_id, freelance_profile_id } = application

    // 2. Fetch the job broadcast details for the session
    const { data: job, error: jobError } = await supabaseClient
      .from('job_broadcasts')
      .select('service_type, start_time, branch_id')
      .eq('id', job_id)
      .single()

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`)
    }

    // 3. Update job_applications status
    const { error: updateAppError } = await supabaseClient
      .from('job_applications')
      .update({ status: 'matched' })
      .eq('id', applicationId)

    if (updateAppError) throw updateAppError

    // 4. Update job_broadcasts status
    const { error: updateJobError } = await supabaseClient
      .from('job_broadcasts')
      .update({ status: 'matched' })
      .eq('id', job_id)

    if (updateJobError) throw updateJobError

    // 5. Create POS Session
    const { error: sessionError } = await supabaseClient
      .from('sessions')
      .insert({
        therapist_id: freelance_profile_id,
        service_name: job.service_type,
        schedule_time: job.start_time,
        branch_id: job.branch_id,
        status: 'pending' // As discussed, default to pending for POS
      })

    if (sessionError) throw sessionError

    return new Response(
      JSON.stringify({ success: true, message: 'Matched and session created successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

-- 1. Add credit_balance to branches table
ALTER TABLE branches ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 0;

-- 2. Create Enum for transaction types
CREATE TYPE transaction_type AS ENUM ('topup', 'job_broadcast');

-- 3. Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for topup, negative for deduction
    type transaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RPC for Broadcasting Job and Deducting Credits
CREATE OR REPLACE FUNCTION broadcast_job_with_credits(
    p_branch_id UUID,
    p_service_type TEXT,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_duration_minutes INTEGER,
    p_offered_price NUMERIC,
    p_credit_cost INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_job_id UUID;
BEGIN
    -- Get current balance with a row lock to prevent race conditions
    SELECT credit_balance INTO v_current_balance
    FROM branches
    WHERE id = p_branch_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Branch not found';
    END IF;

    IF v_current_balance < p_credit_cost THEN
        RAISE EXCEPTION 'Insufficient credits. Current balance: %, required: %', v_current_balance, p_credit_cost;
    END IF;

    -- Deduct credits
    UPDATE branches
    SET credit_balance = credit_balance - p_credit_cost
    WHERE id = p_branch_id;

    -- Record transaction
    INSERT INTO credit_transactions (branch_id, amount, type)
    VALUES (p_branch_id, -p_credit_cost, 'job_broadcast');

    -- Create Job Broadcast
    INSERT INTO job_broadcasts (branch_id, service_type, start_time, duration_minutes, offered_price, status)
    VALUES (p_branch_id, p_service_type, p_start_time, p_duration_minutes, p_offered_price, 'broadcasting')
    RETURNING id INTO v_new_job_id;

    RETURN json_build_object('success', true, 'job_id', v_new_job_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC for Top Up Credits
CREATE OR REPLACE FUNCTION topup_credits(
    p_branch_id UUID,
    p_amount INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Top up amount must be greater than zero';
    END IF;

    -- Add credits
    UPDATE branches
    SET credit_balance = credit_balance + p_amount
    WHERE id = p_branch_id
    RETURNING credit_balance INTO v_new_balance;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Branch not found';
    END IF;

    -- Record transaction
    INSERT INTO credit_transactions (branch_id, amount, type)
    VALUES (p_branch_id, p_amount, 'topup');

    RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

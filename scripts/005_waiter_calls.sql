-- Create waiter_calls table for managing waiter call requests
CREATE TABLE IF NOT EXISTS waiter_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number INTEGER NOT NULL,
    customer_name VARCHAR(255),
    phone_number VARCHAR(20),
    request_type VARCHAR(50) DEFAULT 'general' CHECK (request_type IN ('general', 'order', 'bill', 'assistance', 'complaint')),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES auth.users(id),
    completed_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waiter_calls_table_number ON waiter_calls(table_number);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_created_at ON waiter_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_priority ON waiter_calls(priority);

-- Enable Row Level Security
ALTER TABLE waiter_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for waiter_calls table
-- Allow anyone to insert waiter calls (customers can call waiters)
CREATE POLICY "Anyone can create waiter calls" ON waiter_calls
    FOR INSERT WITH CHECK (true);

-- Allow anyone to read waiter calls (for real-time updates)
CREATE POLICY "Anyone can read waiter calls" ON waiter_calls
    FOR SELECT USING (true);

-- Only authenticated users (staff) can update waiter calls
CREATE POLICY "Only authenticated users can update waiter calls" ON waiter_calls
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users (staff) can delete waiter calls
CREATE POLICY "Only authenticated users can delete waiter calls" ON waiter_calls
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically set acknowledged_at when status changes to acknowledged
CREATE OR REPLACE FUNCTION update_waiter_call_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Set acknowledged_at when status changes to acknowledged or in_progress
    IF NEW.status IN ('acknowledged', 'in_progress') AND OLD.status = 'pending' THEN
        NEW.acknowledged_at = NOW();
    END IF;
    
    -- Set completed_at when status changes to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER trigger_update_waiter_call_timestamps
    BEFORE UPDATE ON waiter_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_waiter_call_timestamps();

-- Create a view for active waiter calls (pending and in_progress)
CREATE OR REPLACE VIEW active_waiter_calls AS
SELECT 
    id,
    table_number,
    customer_name,
    phone_number,
    request_type,
    message,
    status,
    priority,
    created_at,
    acknowledged_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 AS minutes_waiting
FROM waiter_calls
WHERE status IN ('pending', 'acknowledged', 'in_progress')
ORDER BY 
    CASE priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    created_at ASC;

-- Insert some sample data for testing
INSERT INTO waiter_calls (table_number, customer_name, request_type, message, priority) VALUES
(1, 'أحمد محمد', 'order', 'نريد طلب إضافي من القهوة العربية', 'normal'),
(3, 'فاطمة علي', 'bill', 'نريد الحساب من فضلكم', 'high'),
(5, NULL, 'assistance', 'نحتاج مساعدة في اختيار الحلويات', 'normal'),
(2, 'محمد سالم', 'general', 'طاولتنا تحتاج تنظيف', 'low');
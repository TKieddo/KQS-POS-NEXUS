-- FIX VARIANT STOCK MANAGEMENT
-- This script fixes all issues with variant stock management

-- 1. DROP EXISTING TRIGGERS
DROP TRIGGER IF EXISTS update_stock_on_sale_item ON sale_items;
DROP TRIGGER IF EXISTS update_stock_on_laybye_item ON laybye_items;
DROP TRIGGER IF EXISTS restore_stock_on_refund_item ON refund_items;

-- 2. CREATE CORRECTED STOCK UPDATE FUNCTION
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- For products with variants, ONLY update variant stock, NOT main product stock
    IF NEW.variant_id IS NOT NULL THEN
        -- Update variant stock
        UPDATE product_variants 
        SET stock_quantity = stock_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.variant_id;
        
        -- DO NOT update main product stock for variants
        -- The main product stock should remain unchanged
    ELSE
        -- For products without variants, update main product stock
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. CREATE LAYBYE STOCK UPDATE FUNCTION
CREATE OR REPLACE FUNCTION update_laybye_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- For products with variants, ONLY update variant stock, NOT main product stock
    IF NEW.variant_id IS NOT NULL THEN
        -- Update variant stock
        UPDATE product_variants 
        SET stock_quantity = stock_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.variant_id;
        
        -- DO NOT update main product stock for variants
        -- The main product stock should remain unchanged
    ELSE
        -- For products without variants, update main product stock
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. CREATE TRIGGERS
CREATE TRIGGER update_stock_on_sale_item 
    AFTER INSERT ON sale_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_product_stock();

CREATE TRIGGER update_stock_on_laybye_item 
    AFTER INSERT ON laybye_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_laybye_stock();

-- 5. CREATE FUNCTION TO RESTORE STOCK ON REFUND
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- For products with variants, ONLY restore variant stock, NOT main product stock
    IF NEW.variant_id IS NOT NULL THEN
        -- Restore variant stock
        UPDATE product_variants 
        SET stock_quantity = stock_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.variant_id;
        
        -- DO NOT update main product stock for variants
    ELSE
        -- For products without variants, restore main product stock
        UPDATE products 
        SET stock_quantity = stock_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CREATE REFUND TRIGGER
CREATE TRIGGER restore_stock_on_refund_item 
    AFTER INSERT ON refund_items 
    FOR EACH ROW 
    EXECUTE FUNCTION restore_product_stock();

-- 7. CREATE FUNCTION TO CALCULATE TOTAL STOCK FOR PRODUCTS WITH VARIANTS
CREATE OR REPLACE FUNCTION calculate_product_total_stock(product_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_stock INTEGER := 0;
    has_variants BOOLEAN := false;
BEGIN
    -- Check if product has variants
    SELECT has_variants INTO has_variants 
    FROM products 
    WHERE id = product_uuid;
    
    IF has_variants THEN
        -- Calculate total from all variants
        SELECT COALESCE(SUM(stock_quantity), 0) INTO total_stock
        FROM product_variants
        WHERE product_id = product_uuid;
    ELSE
        -- Return main product stock
        SELECT stock_quantity INTO total_stock
        FROM products
        WHERE id = product_uuid;
    END IF;
    
    RETURN COALESCE(total_stock, 0);
END;
$$ language 'plpgsql';

-- 8. CREATE VIEW FOR PRODUCTS WITH TOTAL STOCK
CREATE OR REPLACE VIEW products_with_total_stock AS
SELECT 
    p.*,
    CASE 
        WHEN p.has_variants THEN calculate_product_total_stock(p.id)
        ELSE p.stock_quantity
    END as total_stock_quantity
FROM products p;

-- 9. VERIFICATION QUERY
SELECT 
    'Variant stock management fixed successfully!' as status,
    (SELECT COUNT(*) FROM products WHERE has_variants = true) as products_with_variants,
    (SELECT COUNT(*) FROM product_variants) as total_variants,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name IN ('update_stock_on_sale_item', 'update_stock_on_laybye_item', 'restore_stock_on_refund_item')) as triggers_created;

-- Supabase Storage Bucket Configuration for KQS POS
-- This file sets up storage buckets for product images and other assets

-- ========================================
-- STORAGE BUCKETS
-- ========================================

-- Product images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Business assets bucket (logos, receipts, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-assets',
    'business-assets',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- ========================================
-- STORAGE POLICIES
-- ========================================

-- Product images policies
CREATE POLICY "Product images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

-- Business assets policies
CREATE POLICY "Business assets are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-assets');

CREATE POLICY "Authenticated users can upload business assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update business assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete business assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_option_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_variant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Basic policies for authenticated users (you can customize these based on your needs)
CREATE POLICY "Authenticated users can view all data" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON variant_option_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert variant option types" ON variant_option_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update variant option types" ON variant_option_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete variant option types" ON variant_option_types FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON variant_options FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert variant options" ON variant_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update variant options" ON variant_options FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete variant options" ON variant_options FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON category_variant_configs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert category variant configs" ON category_variant_configs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update category variant configs" ON category_variant_configs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete category variant configs" ON category_variant_configs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON product_variants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert product variants" ON product_variants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product variants" ON product_variants FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product variants" ON product_variants FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON product_variant_options FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert product variant options" ON product_variant_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product variant options" ON product_variant_options FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product variant options" ON product_variant_options FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON product_images FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert product images" ON product_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product images" ON product_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product images" ON product_images FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert customers" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update customers" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete customers" ON customers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert sales" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update sales" ON sales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete sales" ON sales FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert sale items" ON sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update sale items" ON sale_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete sale items" ON sale_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON laybye_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert laybye orders" ON laybye_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update laybye orders" ON laybye_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete laybye orders" ON laybye_orders FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON laybye_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert laybye items" ON laybye_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update laybye items" ON laybye_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete laybye items" ON laybye_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON laybye_payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert laybye payments" ON laybye_payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update laybye payments" ON laybye_payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete laybye payments" ON laybye_payments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON refunds FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert refunds" ON refunds FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update refunds" ON refunds FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete refunds" ON refunds FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON refund_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert refund items" ON refund_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update refund items" ON refund_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete refund items" ON refund_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON stock_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert stock movements" ON stock_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update stock movements" ON stock_movements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete stock movements" ON stock_movements FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all data" ON business_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert business settings" ON business_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update business settings" ON business_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete business settings" ON business_settings FOR DELETE USING (auth.role() = 'authenticated'); 
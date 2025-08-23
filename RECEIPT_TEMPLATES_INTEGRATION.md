# Receipt Templates Database Integration

## 🎯 Overview

The receipt templates system has been fully integrated with the Supabase database, providing persistent storage, multi-branch support, and advanced template management features.

## 🚀 Features

### ✅ Database Integration
- **Persistent Storage**: All templates are saved to the database
- **Multi-branch Support**: Templates are branch-specific
- **Row Level Security**: Proper access control per branch
- **Conflict Handling**: Graceful handling of existing data

### ✅ Template Management
- **Create/Edit**: Full CRUD operations for templates
- **Duplicate**: Copy existing templates
- **Set Default**: Mark templates as default for the branch
- **Delete**: Remove templates (with protection for defaults)
- **Import/Export**: Backup and restore templates

### ✅ Customization Options
- **Business Information**: Name, address, phone, website, social media
- **Policies**: Return policies in English and Sesotho
- **Display Options**: Toggle sections (QR, policy, points, tagline)
- **Messages**: Thank you and footer messages

## 📋 Database Schema

### Receipt Templates Table
```sql
CREATE TABLE receipt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'standard',
    layout JSONB NOT NULL DEFAULT '{}',
    
    -- Business Information
    business_name VARCHAR(255) DEFAULT 'KQS',
    business_address TEXT DEFAULT 'Maseru, Husteds opposite Queen II',
    business_phone VARCHAR(20) DEFAULT '2700 7795',
    business_website VARCHAR(255) DEFAULT 'www.kqsfootware.com',
    business_facebook VARCHAR(255) DEFAULT 'KQSFOOTWARE',
    business_tagline VARCHAR(255) DEFAULT 'Finest footware',
    
    -- Policies
    return_policy_english TEXT,
    return_policy_sesotho TEXT,
    
    -- Messages
    thank_you_message VARCHAR(255) DEFAULT 'Thank You for shopping with Us',
    footer_text VARCHAR(255) DEFAULT 'SHOP ONLINE - Stand a chance to win',
    
    -- Display Options
    show_qr_section BOOLEAN DEFAULT true,
    show_policy_section BOOLEAN DEFAULT true,
    show_points_section BOOLEAN DEFAULT true,
    show_tagline BOOLEAN DEFAULT true,
    
    -- Metadata
    template_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Setup Instructions

### 1. Run the Migration

#### Option A: Automated Script
```bash
# Install dependencies if needed
npm install dotenv

# Run the migration script
node apply-receipt-templates-migration.js
```

#### Option B: Manual Migration
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `create-receipt-templates-migration.sql`
4. Paste and execute the SQL
5. Verify the `receipt_templates` table was created

### 2. Environment Variables
Ensure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Verify Installation
After running the migration, you should see:
- ✅ `receipt_templates` table created
- ✅ Default KQS template inserted
- ✅ RLS policies configured
- ✅ Indexes created for performance

## 📱 Usage

### Template Management UI
The receipts page now includes:

1. **Template Selector**: Choose from available templates
2. **Template Editor**: Modify business information and settings
3. **Template Actions**: 
   - ⭐ Set as default
   - 📋 Duplicate
   - 🗑️ Delete (if not default)
4. **Import/Export**: Backup and restore templates

### API Functions
```typescript
// Load templates for current branch
const templates = await loadReceiptTemplates()

// Save template (create or update)
const result = await saveReceiptTemplate(template)

// Set template as default
await setDefaultTemplate(templateId)

// Duplicate template
await duplicateReceiptTemplate(templateId)

// Delete template
await deleteReceiptTemplate(templateId)

// Export templates
const exportData = await exportTemplates()

// Import templates
await importTemplates(jsonData)
```

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access templates for their assigned branch
- Branch filtering is automatic
- Proper authentication required for all operations

### Data Protection
- Default templates cannot be deleted
- Template changes are tracked with timestamps
- Import/export includes validation

## 🎨 Customization

### Business Information
- **Business Name**: Your company name
- **Address**: Physical location
- **Phone**: Contact number
- **Website**: Online presence
- **Social Media**: Facebook/Twitter handles
- **Tagline**: Company slogan

### Policies
- **English Policy**: Return policy in English
- **Sesotho Policy**: Return policy in Sesotho
- Both policies are displayed on receipts

### Display Options
- **QR Section**: Show website and contact info
- **Policy Section**: Show return policies
- **Points Section**: Show loyalty points
- **Tagline**: Show business tagline

## 🔄 Migration from localStorage

The system automatically migrates from localStorage:
1. Loads existing localStorage data on first visit
2. Saves to database with proper branch assignment
3. Maintains all existing customizations
4. Provides fallback to default template if needed

## 🚨 Troubleshooting

### Common Issues

#### "No Templates Available"
- **Cause**: Migration not run or database connection issue
- **Solution**: Run the migration script or check database connection

#### "User not authenticated"
- **Cause**: User not logged in
- **Solution**: Ensure user is authenticated before accessing templates

#### "No active branches found"
- **Cause**: No branches configured in database
- **Solution**: Create at least one branch in the branches table

#### Template not saving
- **Cause**: RLS policy blocking access
- **Solution**: Check user's branch assignment and RLS policies

### Debug Steps
1. Check browser console for errors
2. Verify database connection in Supabase dashboard
3. Confirm user authentication status
4. Check branch assignment for the user
5. Verify RLS policies are enabled

## 📊 Performance

### Optimizations
- **Indexes**: Created on frequently queried columns
- **Caching**: Templates cached in component state
- **Lazy Loading**: Templates loaded on demand
- **Efficient Queries**: Optimized database queries

### Monitoring
- Template load times
- Save operation success rates
- Database query performance
- User interaction patterns

## 🔮 Future Enhancements

### Planned Features
- **Template Versioning**: Track changes over time
- **Template Sharing**: Share templates between branches
- **Advanced Layouts**: More complex receipt designs
- **Bulk Operations**: Mass template updates
- **Analytics**: Template usage statistics

### Integration Points
- **Printing System**: Direct integration with QZ Tray
- **Sales System**: Automatic template selection
- **User Preferences**: Per-user template preferences
- **API Endpoints**: RESTful API for external access

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the database schema and RLS policies
3. Verify environment variables are correct
4. Test with the migration script
5. Check Supabase dashboard for errors

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: Production Ready 
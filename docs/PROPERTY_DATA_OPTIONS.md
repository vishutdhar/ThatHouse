# Property Data API Options for That House

## Quick Start Options:

### 1. **Manual Entry First** (Recommended to Start)
Create an admin interface to manually add properties while you set up API access.

### 2. **Free Trial APIs** (For Testing)
- **Realty Mole**: 50 free API calls via RapidAPI
- **Rentals.com**: Free tier with limited calls
- **Estated**: Free trial available

### 3. **Partner Approach** (Best Long-term)
Contact local brokers with this pitch:
"We're building a Tinder-style app for house hunting. We'd love to feature your listings and send you qualified leads in exchange for IDX access."

## API Integration Code Template:

```typescript
// src/services/propertyDataApi.ts
import { supabase } from '../lib/supabase';

interface ExternalProperty {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  // ... other fields
}

export class PropertyDataService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async fetchProperties(params: any) {
    // Fetch from external API
    const response = await fetch(`${this.apiUrl}/properties`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return this.transformToSupabaseFormat(data);
  }

  private transformToSupabaseFormat(externalData: ExternalProperty[]) {
    return externalData.map(prop => ({
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zip_code: prop.zipCode,
      price: prop.price,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      // Map other fields
    }));
  }

  async importToSupabase(properties: any[]) {
    const { data, error } = await supabase
      .from('properties')
      .insert(properties);
    
    if (error) throw error;
    return data;
  }
}
```

## Next Steps:

1. **Immediate**: Set up manual property entry
2. **This Week**: Apply for free API trials
3. **Next Week**: Reach out to local brokers
4. **Month 1**: Implement chosen API integration

Would you like me to:
1. Create an admin interface for manual property entry?
2. Set up integration with a free trial API?
3. Draft a partnership email for local brokers?
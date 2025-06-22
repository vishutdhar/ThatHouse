# SimplyRETS Integration Guide

## Overview
SimplyRETS provides real MLS data through a simple REST API. We're using their demo data for development.

## Quick Start

### 1. Sync Demo Data to Supabase
```bash
# Install node-fetch if needed
npm install node-fetch

# Run the sync script
node src/scripts/syncSimplyRets.js
```

This will:
- Fetch 20 properties from SimplyRETS demo
- Clear existing properties (optional)
- Insert properties into Supabase
- Add property images

### 2. View in App
After syncing, your app will show real property data with:
- Actual addresses
- Real photos
- Accurate pricing
- Property details

## Data Mapping

| SimplyRETS Field | ThatHouse Field | Notes |
|-----------------|-----------------|-------|
| mlsId | id | Prefixed with 'sr_' |
| listPrice | price | Direct mapping |
| address.full | address | Full address string |
| property.bedrooms | bedrooms | Direct mapping |
| bathsFull + bathsHalf*0.5 | bathrooms | Combined calculation |
| property.area | square_feet | Square footage |
| geo.lat/lng | latitude/longitude | GPS coordinates |
| photos[] | property_images | Separate table |

## API Endpoints Used

1. **List Properties**
   ```
   GET https://api.simplyrets.com/properties
   ```

2. **Search Properties**
   ```
   GET https://api.simplyrets.com/properties?cities=Houston&minprice=100000
   ```

3. **Single Property**
   ```
   GET https://api.simplyrets.com/properties/{mlsId}
   ```

## Available Filters
- `limit` - Number of results
- `offset` - Pagination
- `cities` - City names (comma separated)
- `minprice` / `maxprice` - Price range
- `minbeds` / `maxbeds` - Bedroom range
- `minbaths` / `maxbaths` - Bathroom range
- `type` - Property types (RES, CND, etc.)

## Production Setup

When ready for real data:
1. Get production credentials from SimplyRETS
2. Update auth in `simplyRetsService.ts`
3. Set up scheduled sync (cron job or Supabase function)
4. Configure webhooks for real-time updates

## Sync Options

### Manual Sync
```javascript
// In your app
import { runSimplyRETSSync } from './services/simplyRetsService';

// Sync with options
await runSimplyRETSSync({
  limit: 50,
  city: 'Houston'
});
```

### Scheduled Sync
Set up a Supabase Edge Function to run periodically:
```sql
-- Run every 6 hours
SELECT cron.schedule(
  'sync-simplyrets',
  '0 */6 * * *',
  $$
  SELECT sync_simplyrets_properties();
  $$
);
```

## Troubleshooting

1. **No properties showing**: Check if sync ran successfully
2. **Missing images**: Verify property_images table has records
3. **Auth errors**: Confirm credentials are correct
4. **Data mismatch**: Check transformation logic in service
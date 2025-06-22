# That House Mock API

This is a mock API server for the That House app development.

## Setup

```bash
cd mock-api
npm install
```

## Running the Server

```bash
npm start
```

The server will run on http://localhost:3001

## Available Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "new@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

### Properties
- `GET /api/properties` - Get properties for swiping
  - Query params: `limit`, `offset`, `excludeViewed`

- `GET /api/properties/search` - Search properties
  - Query params: `location`, `priceMin`, `priceMax`, `beds`, `baths`, `propertyType`

- `GET /api/properties/map` - Get properties for map view
  - Query params: `north`, `south`, `east`, `west` (bounds)

- `GET /api/properties/:id` - Get single property details

### User Actions
- `POST /api/properties/:id/save` - Save a property
- `DELETE /api/properties/:id/save` - Remove from saved
- `POST /api/properties/:id/reject` - Reject a property
- `GET /api/users/saved-properties` - Get user's saved properties
- `GET /api/users/rejected-properties` - Get user's rejected properties

## Test Credentials

Email: `test@example.com`
Password: `password123`

## Notes

- All property images are from Unsplash (free to use)
- User authentication is mocked (token doesn't expire)
- Data persists in db.json file between server restarts
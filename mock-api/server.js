const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Add middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Add custom routes before JSON Server router

// Login endpoint
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();
  
  if (user) {
    res.json({
      token: user.token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        savedProperties: user.savedProperties,
        rejectedProperties: user.rejectedProperties
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Register endpoint
server.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const db = router.db;
  const existingUser = db.get('users').find({ email }).value();
  
  if (existingUser) {
    res.status(400).json({ error: 'User already exists' });
  } else {
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      firstName,
      lastName,
      userType: 'BUYER',
      savedProperties: [],
      rejectedProperties: [],
      priorityProperties: [],
      token: `mock-jwt-token-${Date.now()}`
    };
    
    db.get('users').push(newUser).write();
    
    res.json({
      token: newUser.token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType,
        savedProperties: newUser.savedProperties,
        rejectedProperties: newUser.rejectedProperties
      }
    });
  }
});

// Get properties for swipe (paginated)
server.get('/api/properties', (req, res) => {
  const db = router.db;
  const { limit = 10, offset = 0, excludeViewed } = req.query;
  
  let properties = db.get('properties').value();
  
  // In real app, would exclude viewed properties
  if (excludeViewed) {
    // Mock implementation - just return different properties
    properties = properties.slice(offset, offset + parseInt(limit));
  }
  
  res.json({
    properties: properties.slice(offset, offset + parseInt(limit)),
    total: properties.length,
    hasMore: offset + parseInt(limit) < properties.length
  });
});

// Search properties
server.get('/api/properties/search', (req, res) => {
  const db = router.db;
  const { location, priceMin, priceMax, beds, baths, propertyType } = req.query;
  
  let properties = db.get('properties').value();
  
  // Apply filters
  if (location) {
    properties = properties.filter(p => 
      p.city.toLowerCase().includes(location.toLowerCase()) ||
      p.address.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (priceMin) {
    properties = properties.filter(p => p.price >= parseInt(priceMin));
  }
  
  if (priceMax) {
    properties = properties.filter(p => p.price <= parseInt(priceMax));
  }
  
  if (beds) {
    properties = properties.filter(p => p.bedrooms >= parseInt(beds));
  }
  
  if (baths) {
    properties = properties.filter(p => p.bathrooms >= parseInt(baths));
  }
  
  if (propertyType) {
    properties = properties.filter(p => p.propertyType === propertyType);
  }
  
  res.json({
    properties,
    total: properties.length
  });
});

// Get properties for map view
server.get('/api/properties/map', (req, res) => {
  const db = router.db;
  const { north, south, east, west } = req.query;
  
  let properties = db.get('properties').value();
  
  // Filter by bounds if provided
  if (north && south && east && west) {
    properties = properties.filter(p => 
      p.latitude <= parseFloat(north) &&
      p.latitude >= parseFloat(south) &&
      p.longitude <= parseFloat(east) &&
      p.longitude >= parseFloat(west)
    );
  }
  
  res.json({
    properties: properties.map(p => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      price: p.price,
      address: p.address,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      images: [p.images[0]]
    }))
  });
});

// Save property
server.post('/api/properties/:id/save', (req, res) => {
  const { id } = req.params;
  const userId = '1'; // In real app, get from auth token
  const db = router.db;
  
  const user = db.get('users').find({ id: userId }).value();
  if (!user.savedProperties.includes(id)) {
    user.savedProperties.push(id);
    db.get('users').find({ id: userId }).assign(user).write();
  }
  
  res.json({ success: true });
});

// Remove from saved
server.delete('/api/properties/:id/save', (req, res) => {
  const { id } = req.params;
  const userId = '1'; // In real app, get from auth token
  const db = router.db;
  
  const user = db.get('users').find({ id: userId }).value();
  user.savedProperties = user.savedProperties.filter(pId => pId !== id);
  db.get('users').find({ id: userId }).assign(user).write();
  
  res.json({ success: true });
});

// Reject property
server.post('/api/properties/:id/reject', (req, res) => {
  const { id } = req.params;
  const userId = '1'; // In real app, get from auth token
  const db = router.db;
  
  const user = db.get('users').find({ id: userId }).value();
  if (!user.rejectedProperties.includes(id)) {
    user.rejectedProperties.push(id);
    db.get('users').find({ id: userId }).assign(user).write();
  }
  
  res.json({ success: true });
});

// Get saved properties
server.get('/api/users/saved-properties', (req, res) => {
  const userId = '1'; // In real app, get from auth token
  const db = router.db;
  
  const user = db.get('users').find({ id: userId }).value();
  const properties = db.get('properties')
    .filter(p => user.savedProperties.includes(p.id))
    .value();
  
  res.json({ properties });
});

// Get rejected properties
server.get('/api/users/rejected-properties', (req, res) => {
  const userId = '1'; // In real app, get from auth token
  const db = router.db;
  
  const user = db.get('users').find({ id: userId }).value();
  const properties = db.get('properties')
    .filter(p => user.rejectedProperties.includes(p.id))
    .value();
  
  res.json({ properties });
});

// Use default router for other routes
server.use('/api', router);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('POST   /api/auth/login');
  console.log('POST   /api/auth/register');
  console.log('GET    /api/properties');
  console.log('GET    /api/properties/search');
  console.log('GET    /api/properties/map');
  console.log('GET    /api/properties/:id');
  console.log('POST   /api/properties/:id/save');
  console.log('DELETE /api/properties/:id/save');
  console.log('POST   /api/properties/:id/reject');
  console.log('GET    /api/users/saved-properties');
  console.log('GET    /api/users/rejected-properties');
});
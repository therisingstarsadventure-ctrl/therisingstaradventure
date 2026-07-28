import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.1.0',
  info: {
    title: 'The Rising Stars Adventure API',
    version: '2.0.0',
    description: 'Enterprise production-grade API for adventure booking, live GPS tracking, payments, and admin operations.',
    contact: { name: 'The Rising Stars', url: 'https://therisingstarsadventures.org' },
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Development' },
    { url: 'https://therisingstarsadventures.org', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string', format: 'email' },
          phone: { type: 'string' }, role: { type: 'string', enum: ['USER', 'LEADER', 'ADMIN'] },
        },
      },
      Package: {
        type: 'object',
        properties: {
          id: { type: 'string' }, title: { type: 'string' }, location: { type: 'string' },
          price: { type: 'string' }, days: { type: 'string' }, description: { type: 'string' },
          zone: { type: 'string' }, difficulty: { type: 'string' }, duration: { type: 'string' },
          elevation: { type: 'string' }, groupSize: { type: 'string' }, bestSeason: { type: 'string' },
          meetingPoint: { type: 'string' }, images: { type: 'array', items: { type: 'string' } },
          inclusions: { type: 'array', items: { type: 'string' } },
          exclusions: { type: 'array', items: { type: 'string' } },
          timeline: { type: 'array', items: { type: 'object' } },
        },
      },
      Trip: {
        type: 'object',
        properties: {
          id: { type: 'string' }, trekId: { type: 'string' }, date: { type: 'string', format: 'date-time' },
          totalSeats: { type: 'integer' }, bookedSeats: { type: 'integer' },
          status: { type: 'string', enum: ['UPCOMING', 'STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING', 'COMPLETED'] },
          trackingToken: { type: 'string' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'integer' }, userId: { type: 'integer' }, tripId: { type: 'string' },
          members: { type: 'integer' }, totalAmount: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'ON_TRIP', 'COMPLETED', 'CANCELLED'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'integer' }, bookingId: { type: 'integer' }, amount: { type: 'string' },
          paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED'] },
          transactionId: { type: 'string' }, method: { type: 'string' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'integer' }, userId: { type: 'integer' }, trekId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' }, message: { type: 'string' }, errors: { type: 'array' },
        },
      },
    },
  },
  paths: {
    '/api': { get: { tags: ['Health'], summary: 'API health check', responses: { 200: { description: 'API status', content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, version: { type: 'string' }, status: { type: 'string' } } } } } } } } },
    '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register a new user', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'phone', 'password'], properties: { name: { type: 'string', minLength: 2 }, email: { type: 'string', format: 'email' }, phone: { type: 'string', minLength: 10 }, password: { type: 'string', minLength: 6 } } } } } }, responses: { 201: { description: 'Registration successful' }, 400: { description: 'Validation error or email taken' } } } },
    '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login with credentials', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } } }, responses: { 200: { description: 'Login successful with JWT token' }, 401: { description: 'Invalid credentials' } } } },
    '/api/auth/profile': { get: { tags: ['Auth'], summary: 'Get authenticated user profile', security: [{ BearerAuth: [] }], responses: { 200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 401: { description: 'Unauthorized' } } } },
    '/api/auth/refresh': { post: { tags: ['Auth'], summary: 'Refresh access token', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } } }, responses: { 200: { description: 'New tokens issued' }, 401: { description: 'Invalid refresh token' } } } },
    '/api/packages': {
      get: { tags: ['Packages'], summary: 'List all adventure packages', parameters: [ { name: 'zone', in: 'query', schema: { type: 'string' } }, { name: 'q', in: 'query', schema: { type: 'string' } }, { name: 'difficulty', in: 'query', schema: { type: 'string' } }, { name: 'minPrice', in: 'query', schema: { type: 'number' } }, { name: 'maxPrice', in: 'query', schema: { type: 'number' } } ], responses: { 200: { description: 'Array of packages' } } },
      post: { tags: ['Packages'], summary: 'Create a new package (Admin)', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Package' } } } }, responses: { 201: { description: 'Package created' }, 403: { description: 'Admin access required' } } },
    },
    '/api/packages/{id}': {
      get: { tags: ['Packages'], summary: 'Get package by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Package details' }, 404: { description: 'Not found' } } },
      put: { tags: ['Packages'], summary: 'Update package (Admin)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Packages'], summary: 'Delete package (Admin)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/trips/upcoming': { get: { tags: ['Trips'], summary: 'Get upcoming trip departures', responses: { 200: { description: 'Array of upcoming trips' } } } },
    '/api/trips': {
      get: { tags: ['Trips'], summary: 'List all trips (Admin)', security: [{ BearerAuth: [] }], responses: { 200: { description: 'All trips' } } },
      post: { tags: ['Trips'], summary: 'Create trip departure (Admin)', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['trekId', 'date', 'totalSeats'], properties: { trekId: { type: 'string' }, date: { type: 'string', format: 'date-time' }, totalSeats: { type: 'integer' }, tripLeaderId: { type: 'integer' } } } } } }, responses: { 201: { description: 'Trip created' } } },
    },
    '/api/trips/{id}': { put: { tags: ['Trips'], summary: 'Update trip status (Admin)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['UPCOMING', 'STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING', 'COMPLETED'] } } } } } }, responses: { 200: { description: 'Status updated' } } } },
    '/api/trips/{id}/location': { put: { tags: ['Trips', 'GPS'], summary: 'Update trip GPS location (Leader)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['lat', 'lng'], properties: { lat: { type: 'number' }, lng: { type: 'number' }, speed: { type: 'number' }, batteryLevel: { type: 'integer' }, eta: { type: 'string' } } } } } }, responses: { 200: { description: 'Location updated' } } } },
    '/api/trips/{id}/track': { get: { tags: ['Trips', 'GPS'], summary: 'Get live GPS location for a trip', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Live location data' } } } },
    '/api/trips/{id}/sos': { post: { tags: ['Trips', 'SOS'], summary: 'Trigger SOS emergency alert (Leader)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['lat', 'lng'], properties: { lat: { type: 'number' }, lng: { type: 'number' } } } } } }, responses: { 201: { description: 'SOS dispatched' } } } },
    '/api/trips/{id}/sos/resolve': { post: { tags: ['Trips', 'SOS'], summary: 'Resolve SOS alert (Leader)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'SOS resolved' } } } },
    '/api/trips/{id}/photos': {
      post: { tags: ['Trips'], summary: 'Upload trip photo (Leader)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Photo uploaded' } } },
      get: { tags: ['Trips'], summary: 'Get trip photos', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Photo list' } } },
    },
    '/api/trips/{id}/attendees': { get: { tags: ['Trips'], summary: 'Get trip attendees (Leader/Admin)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Attendee list' } } } },
    '/api/bookings': {
      post: { tags: ['Bookings'], summary: 'Create a booking', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['tripId', 'members'], properties: { tripId: { type: 'string' }, members: { type: 'integer', minimum: 1 } } } } } }, responses: { 201: { description: 'Booking created' } } },
      get: { tags: ['Bookings'], summary: 'List all bookings (Admin)', security: [{ BearerAuth: [] }], responses: { 200: { description: 'All bookings' } } },
    },
    '/api/bookings/my': { get: { tags: ['Bookings'], summary: 'Get my bookings', security: [{ BearerAuth: [] }], responses: { 200: { description: 'User bookings' } } } },
    '/api/bookings/{id}': { put: { tags: ['Bookings'], summary: 'Update booking status', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'ON_TRIP', 'COMPLETED', 'CANCELLED'] } } } } } }, responses: { 200: { description: 'Status updated' } } } },
    '/api/payments': { post: { tags: ['Payments'], summary: 'Process payment for a booking', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['bookingId'], properties: { bookingId: { type: 'integer' }, transactionId: { type: 'string' }, method: { type: 'string', default: 'UPI' } } } } } }, responses: { 201: { description: 'Payment processed' } } } },
    '/api/reviews': { post: { tags: ['Reviews'], summary: 'Add a review for a trek', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['trekId', 'rating', 'comment'], properties: { trekId: { type: 'string' }, rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } } } } } }, responses: { 201: { description: 'Review added' } } } },
    '/api/reviews/package/{trekId}': { get: { tags: ['Reviews'], summary: 'Get reviews for a trek', parameters: [{ name: 'trekId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Review list' } } } },
    '/api/contact': {
      post: { tags: ['Contact'], summary: 'Submit a contact message', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'message'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, message: { type: 'string' } } } } } }, responses: { 201: { description: 'Message submitted' } } },
      get: { tags: ['Contact'], summary: 'List all contact messages (Admin)', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Contact messages' } } },
    },
    '/api/newsletter': {
      post: { tags: ['Newsletter'], summary: 'Subscribe to newsletter', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } } }, responses: { 201: { description: 'Subscribed' } } },
      get: { tags: ['Newsletter'], summary: 'List subscribers (Admin)', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Subscriber list' } } },
    },
    '/api/admin/stats': { get: { tags: ['Admin'], summary: 'Get admin dashboard statistics', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Dashboard stats' } } } },
    '/api/admin/audit': { get: { tags: ['Admin'], summary: 'Get audit logs', security: [{ BearerAuth: [] }], parameters: [ { name: 'entity', in: 'query', schema: { type: 'string' } }, { name: 'userId', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } } ], responses: { 200: { description: 'Audit log entries' } } } },
    '/api/search': { get: { tags: ['Search'], summary: 'Full-text search for trek packages', parameters: [ { name: 'q', in: 'query', schema: { type: 'string' } }, { name: 'zone', in: 'query', schema: { type: 'string' } }, { name: 'difficulty', in: 'query', schema: { type: 'string' } }, { name: 'minPrice', in: 'query', schema: { type: 'number' } }, { name: 'maxPrice', in: 'query', schema: { type: 'number' } }, { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } } ], responses: { 200: { description: 'Search results with pagination' } } } },
  },
  tags: [
    { name: 'Health', description: 'API health and status' },
    { name: 'Auth', description: 'Authentication and authorization' },
    { name: 'Packages', description: 'Adventure trek packages' },
    { name: 'Trips', description: 'Trip departures and scheduling' },
    { name: 'GPS', description: 'Real-time GPS tracking' },
    { name: 'SOS', description: 'Emergency SOS alert system' },
    { name: 'Bookings', description: 'Booking management' },
    { name: 'Payments', description: 'Payment processing' },
    { name: 'Reviews', description: 'Customer reviews' },
    { name: 'Contact', description: 'Contact messages' },
    { name: 'Newsletter', description: 'Newsletter subscriptions' },
    { name: 'Admin', description: 'Admin dashboard and audit' },
    { name: 'Search', description: 'Full-text search' },
  ],
};

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'The Rising Stars API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: { docExpansion: 'list', filter: true, showRequestDuration: true },
  }));
};

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseTestModule } from './test-utils';
import { UserRole } from '../src/users/schemas/user.schema';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongooseTestModule: MongooseTestModule;
  let authToken: string;

  beforeAll(async () => {
    mongooseTestModule = new MongooseTestModule();
    await mongooseTestModule.connect();

    process.env.MONGODB_URI = mongooseTestModule.getUri();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '1h';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongooseTestModule.closeDatabase();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return auth response with token', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.USER,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', createUserDto.email);
      expect(response.body.user).toHaveProperty('name', createUserDto.name);
      expect(response.body.user).toHaveProperty('role', createUserDto.role);
      expect(response.body.user).toHaveProperty('uuid');

      // Save token for later tests
      authToken = response.body.accessToken;
    });

    it('should return 400 if email is missing', async () => {
      const invalidUserDto = {
        password: 'password123',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserDto)
        .expect(400);
    });

    it('should return 400 if password is too short', async () => {
      const invalidUserDto = {
        email: 'short@example.com',
        password: 'short',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserDto)
        .expect(400);
    });

    it('should return 409 if email already exists', async () => {
      const duplicateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Duplicate User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(duplicateUserDto)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should authenticate user and return auth response with token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginDto.email);
    });

    it('should return 401 if credentials are invalid', async () => {
      const invalidLoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(401);
    });

    it('should return 401 if user does not exist', async () => {
      const nonExistentLoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(nonExistentLoginDto)
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return user profile if authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('role', UserRole.USER);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return 401 if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/validate (POST)', () => {
    it('should validate token and return payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/validate')
        .send({ token: authToken })
        .expect(201);

      expect(response.body).toHaveProperty('sub');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('iat');
      expect(response.body).toHaveProperty('exp');
    });

    it('should return 401 if token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/validate')
        .send({ token: 'invalid-token' })
        .expect(401);
    });
  });
});

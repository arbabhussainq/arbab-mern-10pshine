const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

describe("========================================", () => {
  it("   NOTED APP - BACKEND TEST SUITE", () => {});
  it("========================================", () => {});
});

describe("AUTH API", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("token");
      expect(res.body.user).to.have.property("email", "test@example.com");
    });

    it("should not register with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
    });

    it("should not register a duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "123456" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("token");
      expect(res.body).to.have.property("message", "Login successful");
    });

    it("should not login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property("message", "Invalid email or password");
    });

    it("should not login with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should respond successfully for a valid email", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");
    });

    it("should respond successfully even for non-existent email (security)", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");
    });

    it("should return 400 when email is missing", async () => {
      const res = await request(app).post("/api/auth/forgot-password").send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("GET /api/auth/profile", () => {
    let token;

    before(async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "123456" });
      token = res.body.token;
    });

    it("should get profile for authenticated user", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("email", "test@example.com");
    });

    it("should not get profile without token", async () => {
      const res = await request(app).get("/api/auth/profile");
      expect(res.status).to.equal(401);
    });
  });
});

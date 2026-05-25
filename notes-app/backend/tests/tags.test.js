const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

describe("TAGS API", () => {
  let token;
  let tagId;

  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const res = await request(app).post("/api/auth/register").send({
      name: "Tags Test User",
      email: "tagstest@example.com",
      password: "123456",
    });
    token = res.body.token;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("POST /api/tags", () => {
    it("should create a tag successfully", async () => {
      const res = await request(app)
        .post("/api/tags")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Work", color: "#3b82f6" });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("name", "Work");
      expect(res.body).to.have.property("color", "#3b82f6");
      tagId = res.body._id;
    });

    it("should not create a duplicate tag", async () => {
      const res = await request(app)
        .post("/api/tags")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Work", color: "#3b82f6" });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Tag already exists");
    });

    it("should not create a tag without a name", async () => {
      const res = await request(app)
        .post("/api/tags")
        .set("Authorization", `Bearer ${token}`)
        .send({ color: "#3b82f6" });
      expect(res.status).to.equal(400);
    });

    it("should not create a tag without a token", async () => {
      const res = await request(app)
        .post("/api/tags")
        .send({ name: "Personal" });
      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/tags", () => {
    it("should get all tags for logged in user", async () => {
      const res = await request(app)
        .get("/api/tags")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
    });

    it("should not get tags without a token", async () => {
      const res = await request(app).get("/api/tags");
      expect(res.status).to.equal(401);
    });
  });

  describe("DELETE /api/tags/:id", () => {
    it("should delete a tag successfully", async () => {
      const res = await request(app)
        .delete(`/api/tags/${tagId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Tag deleted successfully");
    });

    it("should return 404 for a non-existing tag", async () => {
      const res = await request(app)
        .delete("/api/tags/000000000000000000000000")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(404);
    });
  });
});

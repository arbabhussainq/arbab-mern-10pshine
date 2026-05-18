const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

describe("Notes API", () => {
  let token;
  let noteId;

  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Register and login to get token
    const res = await request(app).post("/api/auth/register").send({
      name: "Notes Test User",
      email: "notestest@example.com",
      password: "123456",
    });

    token = res.body.token;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("POST /api/notes", () => {
    it("should create a note successfully", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Note",
          content: "Test content",
          color: "#FFD700",
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("title", "Test Note");
      noteId = res.body._id;
    });

    it("should not create note without title", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test content",
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Title is required");
    });

    it("should not create note without token", async () => {
      const res = await request(app).post("/api/notes").send({
        title: "Test Note",
        content: "Test content",
      });

      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/notes", () => {
    it("should get all notes for logged in user", async () => {
      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
    });

    it("should not get notes without token", async () => {
      const res = await request(app).get("/api/notes");

      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/notes/:id", () => {
    it("should get a single note by id", async () => {
      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("_id", noteId);
    });

    it("should return 404 for non existing note", async () => {
      const res = await request(app)
        .get("/api/notes/000000000000000000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(404);
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("should update a note successfully", async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Title",
          content: "Updated content",
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("title", "Updated Title");
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should delete a note successfully", async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Note deleted successfully");
    });
  });
});

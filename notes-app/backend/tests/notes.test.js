const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

describe("NOTES API", () => {
  let token;
  let noteId;

  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
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
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("title", "Test Note");
      noteId = res.body._id;
    });

    it("should not create a note without a title", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "No title here" });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Title is required");
    });

    it("should not create a note without a token", async () => {
      const res = await request(app)
        .post("/api/notes")
        .send({ title: "Unauthorized Note" });
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

    it("should not get notes without a token", async () => {
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

    it("should return 404 for a non-existing note", async () => {
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
        .send({ title: "Updated Title", content: "Updated content" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("title", "Updated Title");
    });

    it("should pin a note successfully", async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ pinned: true });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("pinned", true);
    });

    it("should favourite a note successfully", async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ favourited: true });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("favourited", true);
    });

    it("should soft delete a note (move to trash)", async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ deleted: true });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("deleted", true);
    });
  });

  describe("GET /api/notes/trash", () => {
    it("should get all trashed notes", async () => {
      const res = await request(app)
        .get("/api/notes/trash")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  describe("POST /api/notes/import", () => {
    it("should import notes successfully", async () => {
      const res = await request(app)
        .post("/api/notes/import")
        .set("Authorization", `Bearer ${token}`)
        .send({
          notes: [
            { title: "Imported Note 1", content: "Content 1" },
            { title: "Imported Note 2", content: "Content 2" },
          ],
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("imported", 2);
    });

    it("should skip duplicate notes on import", async () => {
      const res = await request(app)
        .post("/api/notes/import")
        .set("Authorization", `Bearer ${token}`)
        .send({
          notes: [{ title: "Imported Note 1", content: "Content 1" }],
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("skipped", 1);
    });

    it("should return 400 when no notes are provided", async () => {
      const res = await request(app)
        .post("/api/notes/import")
        .set("Authorization", `Bearer ${token}`)
        .send({ notes: [] });
      expect(res.status).to.equal(400);
    });
  });

  describe("DELETE /api/notes/trash/empty", () => {
    it("should empty the trash successfully", async () => {
      const res = await request(app)
        .delete("/api/notes/trash/empty")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should permanently delete a note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "To Be Deleted", content: "Delete me" });
      const deleteRes = await request(app)
        .delete(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body).to.have.property(
        "message",
        "Note deleted successfully",
      );
    });
  });
});

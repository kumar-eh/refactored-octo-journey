const request = require("supertest");
const app = require("../app"); // adjust path if your main file differs

describe("Order API", () => {

  it("should return 400 for invalid input", async () => {
    const res = await request(app)
      .post("/orders")
      .send({
        productId: "prod456",
        quantity: 2
        // missing customerId
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
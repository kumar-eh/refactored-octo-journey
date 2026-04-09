const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const correlationId = require("./correlation");

const app = express();
app.use(express.json());

// Add correlation ID to each request
app.use(correlationId);

// Attach a child logger with correlation ID
app.use((req, res, next) => {
  req.log = logger.child({ correlationId: req.correlationId });
  next();
});

// Pino request logging middleware
app.use(
  pinoHttp({
    logger,
    customSuccessMessage: () => "request_completed",
    customErrorMessage: (error) => `request_error: ${error.message}`,
    customAttributeKeys: {
      req: "request",
      res: "response",
      err: "error",
    },
  })
);

// In-memory DB
const orders = {};

// Create an order
app.post("/orders", (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !items || !Array.isArray(items)) {
    req.log.warn({ payload: req.body }, "validation_failed");
    return res.status(400).json({ error: "Invalid payload" });
  }

  const id = "ord_" + Date.now();
  orders[id] = {
    id,
    customer,
    items,
    status: "CREATED",
    createdAt: new Date().toISOString(),
  };

  req.log.info({ orderId: id }, "order_created");

  res.status(201).json(orders[id]);
});

// Get order details
app.get("/orders/:id", (req, res) => {
  const order = orders[req.params.id];

  if (!order) {
    req.log.warn({ orderId: req.params.id }, "order_not_found");
    return res.status(404).json({ error: "Order not found" });
  }

  req.log.info({ orderId: order.id }, "order_fetched");
  res.json(order);
});

// Update order status
app.patch("/orders/:id", (req, res) => {
  const order = orders[req.params.id];
  const { status } = req.body;

  if (!order) {
    req.log.warn({ orderId: req.params.id }, "order_not_found");
    return res.status(404).json({ error: "Order not found" });
  }

  if (!status) {
    req.log.warn({ payload: req.body }, "validation_failed");
    return res.status(400).json({ error: "Missing status" });
  }

  order.status = status;
  req.log.info({ orderId: req.params.id, newStatus: status }, "order_updated");

  res.json(order);
});

// Simulated error route
app.get("/simulate-error", (req, res) => {
  try {
    throw new Error("Simulated internal failure");
  } catch (err) {
    req.log.error({ stack: err.stack }, "internal_error");
    res.status(500).json({ error: "Internal error" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Order Service is running as expected.");
});

// Export app for testing and server.js
module.exports = app;
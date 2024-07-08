const express = require("express");
const Redis = require("ioredis");
const redis = new Redis({
  port: 6379, // Redis port
  db: 0, // Defaults to 0
});
const cron = require("node-cron");

const app = express();
const port = 8081;

const lockKey = "cron_lock";

const acquireLock = async () => {
  const lockAcquired = await redis.set(lockKey, "locked", "NX", 60);

  if (lockAcquired) {
    await redis.expire(lockKey, 60); // Set an expiration time for the lock
    return true;
  }

  return false;
};

// const releaseLock = () => redis.del(lockKey);

const cronjobFunction = () => {
  console.log("Cronjob is running!");
  // Your cron job logic goes here
};

// Schedule the cron job
cron.schedule("*/1 * * * *", async () => {
  const lockAcquired = await acquireLock();

  if (lockAcquired) {
    try {
      cronjobFunction();
    } finally {
      releaseLock();
    }
  } else {
    console.log(
      "Lock not acquired. Another instance may be running the cron job."
    );
  }
});

// Define a route to simulate incoming requests
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
const port = 3000;
const host = "localhost";

// Initialize Firebase Admin with explicit project ID
const serviceAccount = require("../companywork-20b57-firebase-adminsdk-vj3md-eac734376c.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(express.json());
app.use(cors());

app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;
  console.log("Received token:", token);

  // Validate the FCM token format
  if (!token || typeof token !== "string" || !token.includes(":")) {
    return res.status(400).json({ error: "Invalid FCM token format" });
  }

  const message = {
    notification: {
      title: title || "Default Title",
      body: body || "Default Body",
    },
    token: token,
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      error: error.code,
      message: error.message,
      details: error.details,
    });
  }
});

// Send notification to a topic
app.post("/sendNotificationToTopic", async (req, res) => {
  const { topic, title, body } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const message = {
    notification: {
      title: title || "Default Title",
      body: body || "Default Body",
    },
    topic: topic,
    android: {
      priority: "high",
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(response);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error("Error sending message to topic:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/subscribeToTopic", async (req, res) => {
  const { token, topic } = req.body;

  if (!token || !topic) {
    return res.status(400).json({ error: "Both token and topic are required" });
  }

  try {
    const response = await admin.messaging().subscribeToTopic(token, topic);
    console.log("Subscribe response:", response);

    if (response.failureCount > 0) {
      console.error("Failed to subscribe to topic:", response.errors);
      const errors = response.errors.map((error, index) => ({
        index,
        error: error.error,
      }));
      res.status(500).json({
        error: "Failed to subscribe to topic",
        details: errors,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Successfully subscribed to topic: ${topic}`,
      });
    }
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    res.status(500).json({
      error: error.code || "Unknown error",
      message: error.message,
    });
  }
});

// Unsubscribe from a topic
app.post("/unsubscribeFromTopic", async (req, res) => {
  const { token, topic } = req.body;

  if (!token || !topic) {
    return res.status(400).json({ error: "Both token and topic are required" });
  }

  try {
    const response = await admin.messaging().unsubscribeFromTopic(token, topic);
    console.log("Unsubscribe response:", response);

    if (response.failureCount > 0) {
      console.error("Failed to unsubscribe from topic:", response.errors);
      const errors = response.errors.map((error, index) => ({
        index,
        error: error.error,
      }));
      res.status(500).json({
        error: "Failed to unsubscribe from topic",
        details: errors,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Successfully unsubscribed from topic: ${topic}`,
      });
    }
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
    res.status(500).json({
      error: error.code || "Unknown error",
      message: error.message,
    });
  }
});

//Send silent notification
app.post("/sendSilentNotification", async (req, res) => {
  const { token, topic } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const message = {
    data: { silent: "false" },
    topic: topic,
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          "content-available": 1,
        },
      },
      headers: {
        "apns-priority": "10",
      },
    },
  };

  try {
    await admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Silent message sent:", response);
        if (response.failureCount > 0) {
          console.error("Failed to send silent message:", response.errors);
          const errors = response.errors.map((error, index) => ({
            index,
            error: error.error,
          }));
          res.status(500).json({
            error: "Failed to send silent message",
            details: errors,
          });
        } else {
          res.status(200).json({
            success: true,
            message: `Successfully sent silent message to token: ${token}`,
          });
        }
      });
  } catch (error) {
    console.error("Error sending silent message:", error);
    res.status(500).json({ error: error.message });
  }
});

async function sendSilentNotification() {
  const message = {
    data: { data: "hello" },
    topic: "Abc",
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          "content-available": 1,
        },
      },
      headers: {
        "apns-priority": "10",
      },
    },
  };

  try {
    await admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Silent message sent:", response);
        if (response.failureCount > 0) {
          console.error("Failed to send silent message:", response.errors);
        }
      });
  } catch (error) {
    console.error("Error sending silent message:", error);
    res.status(500).json({ error: error.message });
  }
}

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  //call to send silent notification
  sendSilentNotification();
});

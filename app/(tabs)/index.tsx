import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform, TextInput, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { request } = notification;
    const { content } = request;
    const { title, body } = content;

    const shouldShowAlert = !!title || !!body;
    return {
      shouldShowAlert,
      shouldPlaySound: shouldShowAlert,
      shouldSetBadge: shouldShowAlert,
    };
  },
});

const URL = "https://dove-cuddly-similarly.ngrok-free.app";

// Function to send a push notification
async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function sendNotification(token: string, title: string, body: string) {
  try {
    const response = await fetch(`${URL}/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        title,
        body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send notification");
    }

    console.log("Notification sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending notification:", error);
    Alert.alert("Error", "Failed to send notification");
  }
}

// Function to subscribe to a topic
async function subscribeToTopic(token: string, topic: string) {
  try {
    console.log(JSON.stringify({ token, topic }));

    const response = await fetch(`${URL}/subscribeToTopic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, topic }),
    });
    const responseText = await response.text(); // Get the raw response text
    console.log("Raw response text:", responseText);
  } catch (error) {
    console.error("Error subscribing to topic:", error);
  }
}

// Function to unsubscribe from a topic
async function unsubscribeFromTopic(token: string, topic: string) {
  try {
    const response = await fetch(`${URL}/unsubscribeFromTopic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, topic }),
    });
    const responseText = await response.text(); // Get the raw response text
    console.log("Raw response text:", responseText);
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
  }
}

// Function to send notification to a topic
async function sendNotificationToTopic(
  topic: string,
  title: string,
  body: string
) {
  try {
    const response = await fetch(`${URL}/sendNotificationToTopic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        title,
        body,
      }),
    });
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Error sending notification to topic:", error);
  }
}

// Function to send silent notification
async function sendSilentNotification(token: string, topic: string) {
  try {
    const response = await fetch(`${URL}/sendSilentNotification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        topic,
      }),
    });
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Error sending silent notification:", error);
  }
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert("Error", "Must use physical device for push notifications");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Error", "Failed to get push token for push notification!");
    return;
  }

  // Get the project ID from your app config
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId;

  if (!projectId) {
    Alert.alert("Error", "Project ID not found in app config");
    return;
  }

  try {
    // Get both Expo and Firebase tokens
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    const deviceToken = await Notifications.getDevicePushTokenAsync();

    return {
      expoPushToken: expoPushToken.data,
      deviceToken: deviceToken.data,
    };
  } catch (error) {
    console.error("Error getting push token:", error);
    Alert.alert("Error", "Failed to get push token");
    return null;
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [topic, setTopic] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((tokens) => {
        if (tokens) {
          setExpoPushToken(tokens.expoPushToken ?? "");
          setToken(tokens.deviceToken ?? "");
        }
      })
      .catch((error: any) => {
        setExpoPushToken(`${error}`);
        setToken(`${error}`);
      });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>Title: {notification && notification.request.content.title}</Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <TextInput
        placeholder="Enter topic name"
        value={topic}
        onChangeText={setTopic}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <View>
        <View style={{ margin: 10 }}>
          <Button
            title="Subscribe to Topic"
            onPress={async () => {
              if (token && topic) {
                await subscribeToTopic(token, topic);
              }
            }}
          />
        </View>

        <View style={{ margin: 10 }}>
          <TextInput
            placeholder="Enter notification title"
            value={title}
            onChangeText={setTitle}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Enter notification body"
            value={body}
            onChangeText={setBody}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <Button
            title="Send Notification to Topic"
            onPress={async () => {
              if (topic && title && body) {
                await sendNotificationToTopic(topic, title, body);
              } else {
                alert("Topic, title, or body is missing!");
              }
            }}
          />
        </View>

        {/* New Button to Send Notification to /send-notification */}
        <View style={{ margin: 10 }}>
          <Button
            title="Send Notification"
            onPress={async () => {
              if (token && title && body) {
                await sendNotification(token, title, body);
              } else {
                alert("Token, title, or body is missing!");
              }
            }}
          />
        </View>
        {/* New Button to Unsubscribe from topic*/}
        <View style={{ margin: 10 }}>
          <Button
            title="Unsubscribe from Topic"
            onPress={async () => {
              if (token && topic) {
                await unsubscribeFromTopic(token, topic);
              } else {
                alert("Token or topic is missing!");
              }
            }}
          />
        </View>
        {/* New Button to Unsubscribe from topic*/}
        <View style={{ margin: 10 }}>
          <Button
            title="Send Silent Notification"
            onPress={async () => {
              if (token && topic) {
                await sendSilentNotification(token, topic);
              } else {
                alert("Token or topic is missing!");
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}

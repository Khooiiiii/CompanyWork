import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform, TextInput, Alert } from "react-native";

import messaging from "@react-native-firebase/messaging";

async function sendNotification(token: string, title: string, body: string) {}

// Function to subscribe to a topic
async function subscribeToTopic(token: string, topic: string) {
  try {
    await messaging().subscribeToTopic(topic);
    console.log("Subscribed to topic!");
  } catch (error) {
    console.error("Error subscribing to topic:", error);
  }
}

// Function to unsubscribe from a topic
async function unsubscribeFromTopic(token: string, topic: string) {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log("Unsubscribed from topic!");
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
  }
}

export default function Pns() {
  const [token, setToken] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");

  useEffect(() => {
    messaging()
      .getToken()
      .then((token) => {
        setToken(token);
      });

    messaging().onTokenRefresh((token) => {
      setToken(token);
    });

    messaging().onMessage(async (message) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(message));
    });
  }, []);

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}></View>
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
      </View>
    </View>
  );
}

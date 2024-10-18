import { useRouter, useLocalSearchParams, Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams(); // Lấy tham số id từ URL

  return (
    <View style={styles.container}>
      <Text style={styles.text}>ID: {id ? id.toString() : "hello"}</Text>
      <Link href="https://expo.dev" style={styles.text}>
        Open a URL https://expo.dev
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    margin: 50,
    fontSize: 30,
  },
});

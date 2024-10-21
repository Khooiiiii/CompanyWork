import { Link } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import getTodoList, {
  addTodoItem,
  deleteTodoItem,
  updateTodoItem,
} from "./api";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Checkbox from "expo-checkbox";

export default function TodoScreen() {
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState("");

  const query = useQuery({ queryKey: ["todos"], queryFn: getTodoList });

  const addTodoMutation = useMutation({
    mutationFn: addTodoItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, updatedItem }: { id: string; updatedItem: any }) =>
      updateTodoItem(id, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodoItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = { title: newTodo, completed: false };
      addTodoMutation.mutate(newTodoItem);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const handleDelete = (id: string) => {
      deleteTodoMutation.mutate(id);
    };

    const handleToggleComplete = (item: any) => {
      const updatedItem = { ...item, completed: !item.completed };
      updateTodoMutation.mutate({ id: item.id, updatedItem });
    };

    return (
      <View key={item.id} style={styles.item}>
        <Checkbox
          style={{ margin: 10 }}
          value={item.completed}
          onValueChange={() => handleToggleComplete(item)}
          color={item.completed ? "#4630EB" : undefined}
        />
        <Text style={[styles.title, item.completed && styles.completedTitle]}>
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Todo screen</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new todo"
          placeholderTextColor="#888"
          value={newTodo}
          onChangeText={setNewTodo}
        />
        <Button title="Add" onPress={handleAddTodo} />
      </View>

      {query.isLoading && <ActivityIndicator size={"large"} color={"#fff"} />}
      {query.isError && <Text style={styles.text}>Error fetching data</Text>}

      <FlatList
        style={{ flex: 1 }}
        data={query.data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    padding: 20,
  },
  text: {
    color: "#fff",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#3e4149",
    color: "#fff",
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  item: {
    backgroundColor: "#3e4149",
    padding: 10,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    color: "#fff",
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: "line-through",
  },
});

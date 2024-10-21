export default async function getTodoList() {
  try {
    const response = await fetch("http://192.168.31.115:3000/todo");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function addTodoItem(item: any) {
  try {
    const response = await fetch("http://192.168.31.115:3000/todo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function deleteTodoItem(id: string) {
  try {
    const response = await fetch(`http://192.168.31.115:3000/todo/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function updateTodoItem(id: string, item: any) {
  try {
    const response = await fetch(`http://192.168.31.115:3000/todo/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

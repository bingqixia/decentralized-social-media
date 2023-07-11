import React, { useState } from "react";
import "./App.css";
import { TodoTable } from "./components/TodoTable";
import { NewTodoForm } from "./components/NewTodoForm";
import { TodoModel } from "./models/TodoModel";

export const App = () => {
  const [showAddTodoForm, setShowAddTodoForm] = useState(false);
  const [todos, setTodos] = useState([
    new TodoModel(1, "Feed puppy", "Eric"),
    new TodoModel(2, "Water plants", "User 2"),
    new TodoModel(3, "Make dinner", "User 1"),
    new TodoModel(4, "Coding", "User 1"),
  ]);

  const addTodo = (description: string, assigend: string) => {
    let rowNumber = 0;
    if (todos.length > 0) {
      rowNumber = todos[todos.length - 1].rowNumber + 1;
    } else {
      rowNumber = 1;
    }

    let newTodo: TodoModel = new TodoModel(rowNumber, description, assigend);
    setTodos((todos) => [...todos, newTodo]);
  };

  const deleteTodo = (deleteTodoRowNumber: number) => {
    let filtered = todos.filter(function (value) {
      return value.rowNumber !== deleteTodoRowNumber;
    });
    setTodos(filtered);
  };

  return (
    <div className="mt-5 container">
      <div className="card">
        <div className="card-header">Your ToDo's</div>
        <div className="card-body">
          <TodoTable todos={todos} deleteTodo={deleteTodo} />
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddTodoForm(!showAddTodoForm);
            }}
          >
            {showAddTodoForm ? "Close New Todo" : " New todo"}
          </button>

          {showAddTodoForm && <NewTodoForm addTodo={addTodo} />}
        </div>
      </div>
    </div>
  );
}

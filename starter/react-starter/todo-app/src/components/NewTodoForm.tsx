import React, { useState } from "react";

export const NewTodoForm: React.FC<{addTodo: Function}> = (props) => {
  const [description, setDescription] = useState("");
  const [assigend, setAssigned] = useState("");

  const submitTodo = () => {
    if (description !== "" && assigend !== "") {
      props.addTodo(description, assigend);
      setDescription("")
      setAssigned("")
    }
  };

  return (
    <div className="mt-5">
      <form>
        <div className="mb-3">
          <label className="form-label">Assigned</label>
          <input
            type="text"
            className="form-control"
            required
            value={assigend}
            onChange={(e) => setAssigned(e.target.value)}
          ></input>
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={submitTodo}
        >
          Add Todo
        </button>
      </form>
    </div>
  );
}

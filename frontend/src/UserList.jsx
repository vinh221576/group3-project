import React from "react";

function UserList({ users }) {
  return (
    <div>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;

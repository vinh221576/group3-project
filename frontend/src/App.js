import React, { useState, useEffect } from 'react';
import { api } from './api';
import UserList from './UserList';
import AddUser from './AddUser';

function App() {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    api.get("http://localhost:5000/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err.message));
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <UserList users={users} />
      <AddUser fetchUsers={fetchUsers} />
    </div>
  );
}

export default App;
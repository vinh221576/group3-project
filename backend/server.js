const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes/user'); // <--- dòng này
app.use('/api', userRoutes);                 // <--- dòng này

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import app from './backend/app.js';

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Local Server is running on http://localhost:${PORT}`);
});
import express from 'express'

const app = express()
const PORT = 3001

app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  console.log(
    `Request body : ${req.body ? JSON.stringify(req.body, null, 2) : "N/A"}`
  );
  console.log(`Request IP, ${req.ip}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`)
})

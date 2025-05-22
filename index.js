import express from "express";

const app = express();
const port = 5500;
app.get("/", (req, res) => {
  res.send("Hello server");
});

app.listen(port, () => {
  console.log("App listening on Port : ", port);
});

const express = require('express');
const app =  express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => { // app.get will display a page based on the path. "/" is the home page
  res.send("Hello!");
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index"/*file name in views folder*/, templateVars);
});

app.get("/urls/:id", (req,res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  console.log(templateVars.id)
  console.log(templateVars.longURL);
  res.render("urls_show", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
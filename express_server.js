const express = require('express');
const app =  express();
const PORT = 8080; // default port 8080

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => { // app.get will display a page based on the path. "/" is the home page
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index"/*file name in views folder*/, templateVars);
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString()
  urlDatabase[id] = longURL
  res.redirect(`/urls/${id}`);
})

app.get("/urls/new", (req,res) => { 
  res.render("urls_new")
})

app.get("/urls/:id", (req,res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: req.params.id, urlDatabase: urlDatabase };
  console.log(id);
  res.render('urls_show', templateVars);
})

app.get("/u/:id", (req,res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  let longURL = urlDatabase[req.params.id];
  if (!longURL.startsWith('http')){
    longURL = `http://${longURL}`
  }
  console.log(req.params);
  res.redirect(longURL);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
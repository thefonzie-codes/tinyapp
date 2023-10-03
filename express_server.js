const express = require('express');
const app =  express();
const PORT = 8080; // default port 8080

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

// URL Database

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => { // app.get will display a page based on the path. '/' is the home page
  res.send('Hello!');
});

// goes to the urls page that contains all the urls and shortened versions

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index'/*file name in views folder*/, templateVars);
});

// creates a new url and then redirects you to /urls/id

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString()
  urlDatabase[id] = longURL
  res.redirect(`/urls/${id}`);
})

// directs you to the creation page for new urls

app.get('/urls/new', (req,res) => { 
  res.render('urls_new')
})

// directs you to the specified new url's shortened page

app.get('/urls/:id', (req,res) => {
  const { id } = req.params;
  const templateVars = { id: req.params.id, urlDatabase: urlDatabase };
  console.log(id);
  res.render('urls_show', templateVars);
})

// deletes the specified url

app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params
  delete urlDatabase[id];// deconstrutcted way to assign id = req.params.id
  res.redirect('/urls')
})

app.get('/u/:id', (req,res) => {
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
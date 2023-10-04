const express = require('express');
const app =  express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const generateRandomString = require('./helpers.js');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

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
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render('urls_index'/*file name in views folder*/, templateVars);
});

// creates a new url and then redirects you to /urls/id

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// directs you to the creation page for new urls

app.get('/urls/new', (req,res) => {
  username = req.cookies.username
  res.render('urls_new', { username });
});

// directs you to the specified new url's shortened page

app.get('/urls/:id', (req,res) => {
  const { id } = req.params;
  const templateVars = { id: req.params.id, urlDatabase: urlDatabase , username: req.cookies.username};
  res.render('urls_show', templateVars);
});

// deletes the specified url

app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];// deconstrutcted way to assign id = req.params.id
  res.redirect('/urls');
});

// updates specified URL

app.post('/urls/:id/', (req, res) => {
  const { longURL } = req.body;
  const { id } = req.params;
  urlDatabase[id] = longURL;
  res.redirect('/urls')
})

// creates a cookie

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls')
;})

// logs user out and clears created cookie

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  username = req.cookies.username
  res.render('register')
})

app.get('/u/:id', (req,res) => {
  let longURL = urlDatabase[req.params.id];
  username: req.cookies.username;
  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }
  res.redirect(longURL,{ username });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
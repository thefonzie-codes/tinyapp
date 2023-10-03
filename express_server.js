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
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// directs you to the creation page for new urls

app.get('/urls/new', (req,res) => {
  res.render('urls_new');
});

// directs you to the specified new url's shortened page

app.get('/urls/:id', (req,res) => {
  const { id } = req.params;
  const templateVars = { id: req.params.id, urlDatabase: urlDatabase };
  console.log(id);
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
  console.log('Cookie created for: ', username);
  res.redirect('/urls')
;})

app.get('/u/:id', (req,res) => {
  let longURL = urlDatabase[req.params.id];
  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }
  console.log(req.params);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
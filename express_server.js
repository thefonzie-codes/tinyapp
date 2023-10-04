const express = require('express');
const app =  express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./helpers.js');
const { createNewUser } = require('./helpers.js')
const { returnIdFromEmail } = require('./helpers.js')
const { users } = require('./users.js')

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
    userId: req.cookies.id,
    users,
  };
  res.render('urls_index'/*file name in views folder*/, templateVars);
});

// creates a new url and then redirects you to /urls/id

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const URLid = generateRandomString();
  urlDatabase[URLid] = longURL;
  res.redirect(`/urls/${id}`);
});

// directs you to the creation page for new urls

app.get('/urls/new', (req,res) => {
  const templateVars = { 
    urls: urlDatabase,
    userId: req.cookies.id,
    users,
  };
  res.render('urls_new', templateVars);
});

// directs you to the specified new url's shortened page

app.get('/urls/:id', (req,res) => {
  const templateVars = { 
    id: req.params.id, 
    urlDatabase: urlDatabase,   
    userId: req.cookies.id,
    users
  };
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
  const { email } = req.body;
  const id = returnIdFromEmail(users, email);
  console.log(id);
  res.cookie('id', users[id]);
  res.redirect('/urls')
;})

// logs user out and clears created cookie

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

// User registration functionality

app.get('/register', (req, res) => {
  templateVars = { users, userId: ""}
  res.render('register', templateVars)
})


app.post('/register', (req, res) => {
  
  if (!req.body.email) {
    res.statusMessage ='E-mail required';
    res.send(400, '400 Error: email required');
  };
  
  if (!req.body.password) {
    res.statusMessage ='password required';
    res.send(400, '400 error: password required');
  };
  
  const newUser = createNewUser(req.body);
  const userId = newUser.id;
  users[userId] = newUser.newUser;
  console.log(users);
  res.cookie('id', userId)
  res.redirect('/urls');
})

//Login Form

app.get('/login', (req, res) => {
  templateVars = { users, userId: ""}
  res.render('login', templateVars)
})

app.get('/u/:id', (req,res) => {
  const templateVars = {
    userId: req.cookies.id,
    users,
    longURL: urlDatabase[req.params.id]
    // if (!longURL.startsWith('http')) {
    //   longURL = `http://${longURL}`;
    // }
  }
  res.redirect(longURL, templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, createNewUser, shortUrlExists, authenticated, ownedBy, returnIdFromEmail, ownedUrls } = require('./helpers.js');
const { users } = require('./users.js');
const { urlDatabase } = require('./urlDatabase');

const app =  express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'user_id',
  keys: ['jkasdhfjka', "1ifai4w532", "41234jfa"],
}));

app.get('/', (req, res) => {
  res.redirect('/login');
});

//URL INDEX

app.get('/urls', (req, res) => {

  const auth = authenticated(req.session.user_id);

  if (auth.errMsg) {
    return res.status(auth.errStatus).send(auth.errMsg).end();
  }

  const templateVars = {
    urls: ownedUrls(urlDatabase, req.session.user_id),
    userId: req.session.user_id,
    users,
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req,res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.user_id,
    users,
  };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {

  if(!req.body.longURL){
    return res.send("Field cannot be blank");
  }
  
  if (!req.session.user_id) {
    return res.send("You cannot shorten URLs without being logged in.");
  }

  const longURL = req.body.longURL; 
  const urlId = generateRandomString();
  urlDatabase[urlId] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${urlId}`);
});

app.get('/urls/:id', (req,res) => {
  
  const exists = shortUrlExists(urlDatabase, req.params.id);

  if (exists.errMsg) {
    return res.status(exists.errStatus).send(exists.errMsg).end();
  }

  const auth = authenticated(req.session.user_id);
  const owned = ownedBy(urlDatabase, req.params.id, req.session.user_id);

  if (auth.errMsg) {
    return res.status(auth.errStatus).send(auth.errMsg).end();
  }

  if (owned.errMsg) {
    return res.status(owned.errStatus).send(owned.errMsg).end();
  }

  const templateVars = {
    id: req.params.id,
    urlDatabase: urlDatabase,
    userId: req.session.user_id,
    users
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const auth = authenticated(req.session.user_id);
  const owned = ownedBy(urlDatabase, req.params.id, req.session.user_id);

  if (auth.errMsg) {
    return res.status(auth.errStatus).send(auth.errMsg).end();
  }

  if (owned.errMsg) {
    return res.status(owned.errStatus).send(owned.errMsg).end();
  }

  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');
});


app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  
  const templateVars = { users, userId: ""};

  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  
  const newUser = createNewUser(users, req.body);

  if (newUser.errStatus) {
    return res.send(newUser.errMsg, newUser.errStatus);
  }

  const user_id = newUser.id;
  users[user_id] = newUser.newUser;
  req.session.user_id = user_id;
  res.redirect('/urls');
});

//Login Form

app.get('/login', (req, res) => {
  const templateVars = {
    id: req.params.id,
    urlDatabase: urlDatabase,
    userId: req.session.user_id,
    users
  };

  if (templateVars.userId) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const foundUser = returnIdFromEmail(users, email);

  if (!email || !password) {
    return res.status(400).send("Please provide an email and password.");
  }

  if (!foundUser) {
    return res.status(400).send("No user with that email found");
  }

  const savedPassword = users[foundUser].password;
  const checkPassword = bcrypt.compareSync(password, savedPassword);

  if (!checkPassword) {
    return res.status(400).send("Incorrect password");
  }

  req.session.user_id = foundUser;
  res.redirect('/urls');
});

// updates specified URL

app.post('/urls/:id/', (req, res) => {
  const auth = authenticated(req.session.user_id);
  const owned = ownedBy(urlDatabase, req.params.id, req.session.user_id);

  if (auth.errMsg) {
    return res.status(auth.errStatus).send(auth.errMsg).end();
  }

  if (owned.errMsg) {
    return res.status(owned.errStatus).send(owned.errMsg).end();
  }

  const { longURL } = req.body;
  const { id } = req.params;

  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

app.get('/u/:id', (req,res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }
  res.redirect(`${longURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
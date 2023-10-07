// Dependencies

const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, createNewUser, shortUrlExists, authenticated, ownedBy, returnIdFromEmail, ownedUrls } = require('./helpers.js'); // Helper functions
const { users } = require('./users.js'); // User database
const { urlDatabase } = require('./urlDatabase'); // URL database

const app =  express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'user_id',
  keys: ['jkasdhfjka', "1ifai4w532", "41234jfa"],
}));

// Homepage - redirects to the login page.

app.get('/', (req, res) => {
  res.redirect('/login');
});

// Registration page. If user is already logged in, will redirect to their owned URLs page.

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  
  const templateVars = { users, userId: ""};

  res.render('register', templateVars);
});

// Login page. If user is already logged in, will redirect to their owned URLs page.

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

// Owned URLs index.  If the user is logged in, will display all of their owned URLs.

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

// Short URL creation page.  Only logged in users can access this.  If they are not logged in, will redirect to the login page.

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

// Individual URL page.  Will check to see if the short URL exists, checks if user is logged in and checks if the URL is owned by the user.
// If any of those conditions are not met, will display appropriate error message.

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

// Will POST this when attempting to create a shortURL.

app.post('/urls', (req, res) => {

  if (!req.session.user_id) {
    return res.send("You cannot shorten URLs without being logged in.");
  }

  if (!req.body.longURL) {
    return res.send("Field cannot be blank");
  }
  
  let longURL = req.body.longURL;
  const urlId = generateRandomString();

  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }

  urlDatabase[urlId] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${urlId}`);
});

// Deletes specified URL.  Also checks for a login and if the current user owns the URL.

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

// Logs the user out - deletes the cookie session and redirects to the login page

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Logs the user out - deletes the cookie session and redirects to the login page

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// POST upon clicking the 'Create New Account' button.

app.post('/register', (req, res) => {
  
  const newUser = createNewUser(users, req.body);

  if (newUser.errStatus) {
    return res.send(newUser.errMsg).status(newUser.errStatus);
  }

  const user_id = newUser.id;
  users[user_id] = newUser.newUser;

  req.session.user_id = user_id;
  res.redirect('/urls');
});

// POST upon clicking the login button.  Displays an error message if user is not found, email or password is incorrect and if user did not provide email or password.

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
    return res.status(400).send("Invalid Login");
  }

  req.session.user_id = foundUser;
  res.redirect('/urls');
});

// POST upon clicking the 'Update' button. Also checks for a login and if the current user owns the URL.

app.post('/urls/:id/', (req, res) => {
  const auth = authenticated(req.session.user_id);
  const owned = ownedBy(urlDatabase, req.params.id, req.session.user_id);

  if (auth.errMsg) {
    return res.status(auth.errStatus).send(auth.errMsg).end();
  }

  if (owned.errMsg) {
    return res.status(owned.errStatus).send(owned.errMsg).end();
  }

  let { longURL } = req.body;
  const { id } = req.params;

  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }
  urlDatabase[id].longURL = longURL;

  res.redirect('/urls');
});

// Redirects the user to the appropriate LongURL - 'http://' not required - it will force it if it does not exist

app.get('/u/:id', (req,res) => {

  const exists = shortUrlExists(urlDatabase, req.params.id);

  if (exists.errMsg) {
    return res.status(exists.errStatus).send(exists.errMsg).end();
  }

  let longURL = urlDatabase[req.params.id].longURL;

  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }

  res.redirect(`${longURL}`);
});

// Server output upon turning on.

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});
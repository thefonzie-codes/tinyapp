const express = require('express');
const app =  express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, createNewUser, login, shortUrlExists, authenticated, ownedBy, returnIdFromEmail } = require('./helpers.js');
const { users } = require('./users.js')

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'user_id',
  keys: ['jkasdhfjka', "1ifai4w532", "41234jfa"]
}));



// URL Database

const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: "xlt42x"
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID'
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "xlt42x"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: 'userRandomID'
  },
}

app.get('/', (req, res) => { // app.get will display a page based on the path. '/' is the home page
  res.send('Hello!');
});

// goes to the urls page that contains all the urls and shortened versions

app.get('/urls', (req, res) => {

  console.log(req.session.user_id)

  const auth = authenticated(req.session.user_id)
  if (auth.errMsg){
    res.status(auth.errStatus).send(auth.errMsg).end()
  }

  const ownedUrls = (urlDatabase, userId) => {
    const owned = {};

    for (let id in urlDatabase){
      const urlUserId = urlDatabase[id].userID;
      if (userId === urlUserId){
        owned[id] = {
          id,
          ...urlDatabase[id]
        }
      }
    }
    return owned
  };

  const templateVars = { 
    urls: ownedUrls(urlDatabase, req.session.user_id),
    userId: req.session.user_id,
    users,
  };
  console.log(templateVars.urls)
  res.render('urls_index', templateVars);
});

// creates a new url and then redirects you to /urls/id

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send("You cannot shorten URLs without being logged in.")
  }
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.user_id,
    users,
  }
  const longURL = req.body.longURL;
  const URLid = generateRandomString();
  urlDatabase[URLid] = longURL;
  res.redirect(`/urls/${id}`, templateVars);
});

// directs you to the creation page for new urls

app.get('/urls/new', (req,res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  }
  const templateVars = { 
    urls: urlDatabase,
    userId: req.session.user_id,
    users,
  };
  res.render('urls_new', templateVars);
});

// directs you to the specified new url's shortened page

app.get('/urls/:id', (req,res) => {
  
  const exists = shortUrlExists(urlDatabase, req.params.id)

  if(exists.errMsg){
    res.status(exists.errStatus).send(exists.errMsg).end()
  }

  const auth = authenticated(req.session.user_id)
  const owned = ownedBy(req.params.id, req.session.user_id)
  
  if (auth.errMsg){
    res.status(auth.errStatus).send(auth.errMsg).end()
  }

  if (owned.errMsg){
    res.status(owned.errStatus).send(owned.errMsg).end()
  }

  const templateVars = { 
    id: req.params.id, 
    urlDatabase: urlDatabase,   
    userId: req.session.user_id,
    users
  };
  res.render('urls_show', templateVars);
});

// deletes the specified url

app.post('/urls/:id/delete', (req, res) => {
  const auth = authenticated(req.session.user_id)
  const owned = ownedBy(req.params.id, req.session.user_id)

  if (auth.errMsg){
    res.status(auth.errStatus).send(auth.errMsg).end()
  }

  if (owned.errMsg){
    res.status(owned.errStatus).send(owned.errMsg).end()
  }

  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');
});


// logs user out and clears created cookie

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login')
})

// User registration functionality

app.get('/register', (req, res) => {
  
  templateVars = { users, userId: ""}
  if(templateVars.userId) {
    res.redirect('/urls', templateVars)
  }
  res.render('register', templateVars)
})


app.post('/register', (req, res) => {
  
  const newUser = createNewUser(users, req.body);

  if (newUser.errStatus) {
    res.send(newUser.errMsg, newUser.errStatus)
  }

  const user_id = newUser.id;
  users[user_id] = newUser.newUser;
  console.log(users);
  req.session.user_id = user_id
  res.redirect('/urls');
})

//Login Form

app.get('/login', (req, res) => {
  templateVars = { 
    id: req.params.id, 
    urlDatabase: urlDatabase,   
    userId: req.session.user_id,
    users
  }
  if(templateVars.userId) {
    res.redirect('/urls', templateVars)
  }
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  
  const password = req.body.password;
  const email = req.body.email;
  const foundUser = returnIdFromEmail(users, email)
  const savedPassword = users[foundUser].password
  const hashedPassword = bcrypt.hashSync(password, 10);

  console.log(foundUser, password, email, savedPassword, hashedPassword)

  const checkPassword = bcrypt.compareSync(password, savedPassword);

  if (!email || !password){
    return res.status(400).send("Please provide an email and password.")
  }

  if (!foundUser){
    return res.status(400).send("No user with that email found")
  }

  if (!checkPassword){
    return res.status(400).send("Incorrect password")
  }

  req.session.user_id = foundUser;
  res.redirect('/urls');
;})

/////

// updates specified URL

app.post('/urls/:id/', (req, res) => {

  const auth = authenticated(req.session.user_id)
  const owned = ownedBy(req.params.id, req.session.user_id)

  if (auth.errMsg){
    res.status(auth.errStatus).send(auth.errMsg).end()
  }

  if (owned.errMsg){
    res.status(owned.errStatus).send(owned.errMsg).end()
  }

  const { longURL } = req.body;
  const { id } = req.params;

  urlDatabase[id].longURL = longURL;
  res.redirect('/urls')
})

app.get('/u/:id', (req,res) => {
  const templateVars = {
    userId: req.session.user_id,
    users,
    longURL: urlDatabase[req.params.id].longURL,
    urls: urlDatabase,
    // if (!longURL.startsWith('http')) {
    //   longURL = `http://${longURL}`;
    // }
  }
  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(`${longURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
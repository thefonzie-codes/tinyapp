const express = require('express');
const app =  express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { generateRandomString, createNewUser, login, shortUrlExists, authenticated, ownedBy } = require('./helpers.js');
const { users } = require('./users.js')

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

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

  const auth = authenticated(req.cookies.user_id)
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
    urls: ownedUrls(urlDatabase, req.cookies.user_id),
    userId: req.cookies.user_id,
    users,
  };
  console.log(templateVars.urls)
  res.render('urls_index'/*file name in views folder*/, templateVars);
});

// creates a new url and then redirects you to /urls/id

app.post('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    res.send("You cannot shorten URLs without being logged in.")
  }
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies.user_id,
    users,
  }
  const longURL = req.body.longURL;
  const URLid = generateRandomString();
  urlDatabase[URLid] = longURL;
  res.redirect(`/urls/${id}`, templateVars);
});

// directs you to the creation page for new urls

app.get('/urls/new', (req,res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }
  const templateVars = { 
    urls: urlDatabase,
    userId: req.cookies.user_id,
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

  const auth = authenticated(req.cookies.user_id)
  const owned = ownedBy(req.params.id, req.cookies.user_id)
  
  if (auth.errMsg){
    res.status(auth.errStatus).send(auth.errMsg).end()
  }

  if (owned.errMsg){
    res.status(owned.errStatus).send(owned.errMsg).end()
  }

  const templateVars = { 
    id: req.params.id, 
    urlDatabase: urlDatabase,   
    userId: req.cookies.user_id,
    users
  };
  res.render('urls_show', templateVars);
});

// deletes the specified url

app.post('/urls/:id/delete', (req, res) => {
  const auth = authenticated(req.cookies.user_id)
  const owned = ownedBy(req.params.id, req.cookies.user_id)

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
  res.cookie('user_id', user_id)
  res.redirect('/urls');
})

//Login Form

app.get('/login', (req, res) => {
  templateVars = { 
    id: req.params.id, 
    urlDatabase: urlDatabase,   
    userId: req.cookies.user_id,
    users
  }
  if(templateVars.userId) {
    res.redirect('/urls', templateVars)
  }
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  const userId = login(users, req.body);
  
  if (userId.errStatus) {
    res.send(userId.errStatus, userId.errMsg)
  }

  res.cookie('user_id', userId.id);
  res.redirect('/urls');
;})

/////

// updates specified URL

app.post('/urls/:id/', (req, res) => {

  const auth = authenticated(req.cookies.user_id)
  const owned = ownedBy(req.params.id, req.cookies.user_id)

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
    userId: req.cookies.user_id,
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
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const checkEmail = require('./helpers');

// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set('view engine', 'ejs');

const urlDatabase = {

};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}

function urlsForUser(id) {
  let someObj = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url]['userID']) {
      someObj[url] = urlDatabase[url].longURL;
    }
  }
  return someObj;
}

function correctUser(id, shortURL) {
  if (id === urlDatabase[shortURL]['userID']) {
    return true;
  } else {
    return false;
  }
}

const users = {

};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  let templateVars = { urls: urlsForUser(userID) , user: users[userID]};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    let templateVars = { urls: urlDatabase, user: users[userID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (!userID) {
    res.redirect('/login');
  } else if (!correctUser(userID, shortURL)) {
    res.status(400).end();
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID]};
    res.render('urls_show', templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  console.log('post request: /urls');
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID:  req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userID) {
    res.redirect('/login');
  } else if (!correctUser(userID, shortURL)) {
    res.status(400).end();
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userID) {
    res.redirect('/login');
  } else if (!correctUser(userID, shortURL)) {
    res.status(400).end();
  } else {
    urlDatabase[shortURL] = {longURL, userID: req.session.user_id};
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req,res) => {
  let userID = req.session.user_id;
  let templateVars = { urls: urlDatabase , user: users[userID]};
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  let userID = req.session.user_id;
  let templateVars = { urls: urlDatabase , user: users[userID]};
  res.render('urls_login', templateVars);
});

app.post('/register', (req, res) => {
  let email = req.body.email;
  if (req.body.email === '' && req.body.password === '') {
    res.status(400).end();
  } else if (checkEmail(users, email)) {  //if the email is found in the user db
    res.status(400).end();
  } else { //if the email isnt found in the user database
    let userID = generateRandomString();
    let encryptedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = { id: userID, email: req.body.email, password: encryptedPassword };
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let user = checkEmail(users, email);
  if (!user) {
    res.status(403).end();
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).end();
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

// app.get('*', (req, res) => {
//   res.redirect('/urls');
// });

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});


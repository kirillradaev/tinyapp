const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString () {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
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
   const userID = req.cookies.user_id;
   let templateVars = { urls: urlDatabase , user: users[userID]};
   res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies.user_id;
  let templateVars = { urls: urlDatabase, user: users[userID]};
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[userID]};
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req,res) => {
  let userID = req.cookies['user_id'];
  let templateVars = { urls: urlDatabase , user: users[userID]};
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  let userID = req.cookies['user_id'];
  let templateVars = { urls: urlDatabase , user: users[userID]};
  res.render('urls_login', templateVars);
})

const checkEmail = function (users, email) {
  for (let i in users) {
    if (users[i].email === email) {
      console.log("key", i);
      console.log("users db:", users);
      console.log("users[i]:", users[i]);
      return users[i];
    } else {
      return false;
    }
  }
};

app.post('/register', (req, res) => {
  let email = req.body.email;
  if (req.body.email === '' && req.body.password === '') {
    res.status(400).end();
  } else if (checkEmail(users, email)) {  //if the email is found in the user db
    res.status(400).end();
  } else { //if the email isnt found in the user database
  let userID = generateRandomString();
  users[userID] = { id: userID, email: req.body.email, password: req.body.password };
  res.cookie('user_id', userID);
  res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  console.log(email);
  let user = checkEmail(users, email);
  if (!user) {
    res.status(403).end();
  } else if (user.password !== req.body.password) { 
    res.status(403).end();
  } else { 
  res.cookie('user_id', user.id);
  res.redirect('/urls');
}
});

app.get('*', (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});


const checkEmail = function(users, email) {
  for (let i in users) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return undefined;
};

module.exports = checkEmail;

// const checkEmail = function (users, email) {
//   for (let i in users) {
//     if (users[i].email === email) {
//       return users[i];
//     } else {
//       return false;
//     }
//   }
// };
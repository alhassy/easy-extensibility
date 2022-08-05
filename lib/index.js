const EE = {}
module.exports = EE

EE.speak = (name = process.env.USER) => console.log(`Hello, ${name}!`)
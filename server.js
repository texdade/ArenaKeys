const app = require('./app'); // app logic implemented by the express server

const PORT = process.env.PORT || 3030;
const serverInstance = app.listen(PORT, () => console.log(`App listening on port ${PORT}`));

module.exports = {app, serverInstance};

require("dotenv").config();
const PORT = process.env.PORT || 3000;

const connectDB = require("./src/config/db");
const app = require("./src/app");

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
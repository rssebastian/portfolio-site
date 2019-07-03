const express = require('express');
// const connectDB = require('./config/db');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

require('./routes/email')(app);

if (process.env.NODE_ENV === 'production') {
    //Express will serve up production assets
    app.use(express.static('client/build'));

    //Express will serve up the index.html file
    //if it doesn't recognize the route
    const path = require('path');
    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
};

// // Connect Database
// connectDB();

// app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
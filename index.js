const express = require('express');
require('dotenv').config();
const app = express();
const port = 80;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Make sure the path to your User model is correct
const ReportModel = require('./models/reports');
const cors = require('cors');
const blogRouter = require('./routes/getblogs');
const infoRouter = require('./routes/getinfo');
const sampleRouter = require('./routes/getsample');
const getsampleRouter = require('./routes/getsample');
const getsegmentsRouter = require('./routes/getsegments');
const getparentmarketRouter = require('./routes/getparentmarket');
const generaterd = require('./routes/generaterd');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set("view engine", "ejs");
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Passport.js configuration
passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
        const user = await User.findOne({ username });
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Authentication routes
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, username, password } = req.body;
    const user = new User({ firstName, lastName, email, phoneNumber, username, password: await User.encryptPassword(password) });
    await user.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { messages: req.flash() });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function isUserActive(req, res, next) {
    if (req.user && req.user.isActive) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', (req, res) => res.render('login', { messages: req.flash() }));

app.get('/dashboard', isLoggedIn, isUserActive, (req, res) => {
    res.render('dashboard');
});

app.get('/reports', async (req, res) => {
    // const reports = await ReportModel.find({});
    // res.json(reports);
});

app.get('/admin/dashboard', isLoggedIn, isAdmin, async (req, res) => {
    const users = await User.find({});
    res.render('admin-dashboard', { users });
});

function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    res.redirect('/login');
}

app.post('/admin/activate/:userId', isLoggedIn, isAdmin, async (req, res) => {
    const userId = req.params.userId;
    const isActive = req.query.isActive === 'true';
    await User.findByIdAndUpdate(userId, { isActive });
    res.sendStatus(200);
});

app.use('/getblogs', blogRouter);
app.use('/getinfo', infoRouter);
app.use('/getsample', sampleRouter);
app.use('/getsample', getsampleRouter);
app.use('/getsegments', isLoggedIn, isUserActive, getsegmentsRouter);
app.use('/getparentmarket', getparentmarketRouter);
app.use('/generaterd', generaterd);

app.listen(port, '0.0.0.0', () => {
    console.log(`Node Server Running On Port ${port}!`);
});

const connectToMongo = require('./db')
const express = require('express')
const app = require('express')()
const cors = require('cors')
const userRoute = require('./routes/userRoutes')
const bondRouter = require('./routes/Bond')
const postRouter = require('./routes/Post')
const projectRouter = require('./routes/project')
const issueRouter = require('./routes/issue')
const morgan = require('morgan');
const path = require('path');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8000
app.get('/', (req, res)=>{
    res.send("This is app")
})

app.use('/user', userRoute)
app.use('/bond', bondRouter)
app.use('/post', postRouter)
app.use('/project', projectRouter)
app.use('/issue', issueRouter)

app.listen(port, ()=>{
    console.log(`App is listening at http://localhost:${port}`)
})

connectToMongo();
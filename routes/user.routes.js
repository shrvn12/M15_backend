const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { userModel } = require('../models/user.model');
require('dotenv').config();

const saltRounds = process.env.saltRounds;

const userRouter = express.Router();

userRouter.post('/register',async (req, res) => {
    const {name, email, password} = req.body;
    let payload = {name, email, password};
    const userexists = await userModel.findOne({email});
    if(userexists){
        return res.status(401).send({msg:'Account already exists'});
    }
    for(let key in payload){
        if(!payload[key]){
            return res.status(400).send({msg:`Please provide ${key}`});
        }
    }
    payload.password = bcrypt.hashSync(payload.password,+saltRounds);
    const user = new userModel(payload);
    await user.save();
    res.status(201).send({msg:'Registration successful'});
})

userRouter.post('/login',async (req, res) => {
    const {email, password} = req.body;
    let payload = {email, password};
    for(let key in payload){
        if(!payload[key]){
            return res.status(400).send({msg:`Please provide ${key}`});
        }
    }

    const user = await userModel.findOne({email});
    if(!user){
        return res.status(401).send({msg:'Account does not exists'});
    }

    bcrypt.compare(password, user.password,(err, result) => {
        if(err){
            return res.status(500).send({msg:'Something went wrong Please try again', error: err.message});
        }
        if(result){
            payload.name = user.name;
            payload._id = user._id
            const token = jwt.sign(payload,process.env.key);
            res.status(202).send({msg:'Login successful', token});
        }
        else{
            res.status(400).send({msg:'Password do not match'});
        }
    })
})

userRouter.post('/addtocontact/:email',async (req, res) => {
    const token = req.headers.authorization;
    console.log(token);
    const email = req.params.email;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(401).send({msg:'User does not exists'});
    }
    if(!token){
        return res.status(401).send({msg: 'Login to continue'})
    }
    jwt.verify(token,process.env.key,async (err, decoded) => {
        if(err){
            console.log(err);
            return res.status(500).send({msg:'Something went wrong Please try again', error: err.message});
        }
        console.log(user, decoded);
        let contacts = decoded.contacts || [];
        contacts.push(user.email);
        user.contacts = contacts;
        console.log(decoded._id.toString(), user);
        await userModel.findByIdAndUpdate(decoded._id.toString(),{contacts});
        res.status(200).send({msg:'Added to contacts'});
    })
})

userRouter.get('/userinfo/:email',async (req, res) => {
    const email = req.params.email;
    if(!email){
        return res.status(401).send({msg: 'Login to continue'})
    }
    const user = await userModel.findOne({email});
    res.status(200).send(user);
})

module.exports = {
    userRouter
}
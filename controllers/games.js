const express = require('express');
const router = express.Router();
const Game = require('../models/game.js');
const User =require ('../models/user.js');

//index route
router.get('/', async (req, res) => {
    try {
      const games = await Game.find({}).populate('owner');
      res.render('games/index.ejs', {games});
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
});

//new route
router.get('/new', async (req, res) => {
    res.render('games/new.ejs');
});

router.post('/',async (req, res) => {
  req.body.owner = req.session.user._id;
  await Game.create(req.body);
  res.redirect('/games');
});

// show route
router.get('/:gameId', async (req, res) =>{
  try {
    const game = await Game.findById(req.params.gameId).populate('owner');
     
    const userLiked = game.likedByUsers.some((user) =>
      user.equals(req.session.user._id)
    );
    res.render('games/show.ejs', {game, userLiked, });
    
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


//delete router
router.delete('/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (game.owner.equals(req.session.user._id)) {
    await game.deleteOne();
    res.redirect('/games');
  } else {
    res.send("You don't have permission to do that.");
  }
  } catch (error) {
  console.log(error);
  res.redirect('/')
  }
});

//edit router
router.get('/:gameId/edit', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    res.render('games/edit.ejs', {game});
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//put router
router.put('/:gameId', async (req, res) =>{
  try {
    const game = await Game.findById(req.params.gameId);
    if (game.owner.equals(req.session.user._id)) {
      game.set(req.body);
      await game.save();
      res.redirect('/games')
    } else {
      res.send("You don't have permission to do that.");
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
})

// Like button
router.post('/:gameId/liked-by/:userId', async (req, res) => {
  try {
    await Game.findByIdAndUpdate(req.params.gameId, {
      $push: { likedByUsers: req.params.userId },
    });
    res.redirect(`/games/${req.params.gameId}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// dislike
router.delete('/:gameId/liked-by/:userId', async (req, res) => {
  try {
    await Game.findByIdAndUpdate(req.params.gameId, {
      $pull: { likedByUsers: req.params.userId },
    });
    res.redirect(`/games/${req.params.gameId}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = router;
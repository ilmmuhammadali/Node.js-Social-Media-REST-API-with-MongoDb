const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

//update user

router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    //password update
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(err);
      }
    }
    try {
      //new body set
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(400).json("you can update only you account");
  }
});

//delete user

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("you can delete only you account");
  }
});
//get user

router.get("/:id", async (req, res) => {
  try {
    //all doc res
    const user = await User.findById(req.params.id);
    //not all res only others
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (error) {
    return res.status(400).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currentUser.updateOne({ $push: { followings: req.params.id } });
          res.status(200).json("user has been followed");
        } else {
          res.status(403).json("you allready follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant follow yourself");
    }
  });

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).json("user has been unfollowed");
        } else {
          res.status(403).json("you allready unfollow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant unfollow yourself");
    }
  });

// router.get("/", (req, res)=>{
//     res.send("hey its user route")
// })

module.exports = router;

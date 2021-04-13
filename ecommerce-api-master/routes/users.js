const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { authenticate, adminAuthenticate } = require("../auth/user");
const { validate, userValidate } = require("../validations/userValidate");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const confirmationEmail = require("../messages/confirmation.email");
const contactUsEmail = require("../messages/contactus.email");
const forgotPassEmail = require("../messages/forgotPass.email");

router.post("/register", async (req, res, next) => {
  try {
    const {
      email = "",
      password = "",
      firstname = "",
      lastname = "",
      gender = "male",
      profileImage = "4",
    } = req.body;
    let exists = await User.count({ email });
    if (exists > 0) {
      return res
        .status(200)
        .send({ exists: true, success: false, message: "Email is exists" });
    }
    if (password.length < 6)
      throw new Error({ error: "password accepts only minimum 6 characters" });
    const hash = await bcrypt.hash(password, 7);
    const user = await User.create({
      email,
      password: hash,
      firstname,
      lastname,
      gender,
      profileImage,
    });
    const token = jwt.sign({ _id: user._id }, "the-attack-titan");
    const confirmationLink = `https://amnesia-skincare.herokuapp.com/api/users/confirmation/${token}`;
    const message = confirmationEmail(
      user.firstname,
      user.email,
      confirmationLink
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amnesia.ecommerce@gmail.com",
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Amnesia - Skin Care" <amnesia.ecommerce@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Confirmation", // Subject line
      text: "Confirmation message", // plain text body
      html: message, // html body
    });

    delete user.password;
    res.status(201).send({ user, success: true, message: "sent successfully" });
  } catch (error) {
    if (error.keyPattern && error.keyPattern.email) {
      res.status(409).send({ error, success: false });
      return;
    }
    res.status(422).send({ error, success: false });
  }
});

router.get("/confirmation/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { _id } = jwt.verify(token, "the-attack-titan");
    const user = await User.findOneAndUpdate(
      { _id },
      { confirmation: true },
      {
        new: true,
      }
    ).exec();
    res.redirect("https://amnesia-ecommerce.herokuapp.com/confirmedRegister");
    delete user.password;
    res
      .status(200)
      .send({ user, success: true, message: "User is confirmed!" });
  } catch (error) {
    res
      .status(400)
      .send({ error, success: false, message: "Confirmation is denied!" });
    res.redirect("https://amnesia-ecommerce.herokuapp.com/failed");
  }
});

router.post("/login", validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) throw new Error("wrong email or password");
    if (!user.confirmation) {
      return res
        .status(400)
        .send({
          success: false,
          confirmed: "no",
          message: "Confirmation is required",
        });
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) throw new Error("wrong email or password");
    const token = jwt.sign({ _id: user._id }, "the-attack-titan");
    res.statusCode = 200;
    delete user.password;
    res.send({
      message: "logged in successfully",
      confirmed: "yes",
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.statusCode = 401;
    res.send({
      error,
      message: "Invalid credentials",
      confirmed: "invalid",
      success: false,
    });
  }
});

router.post("/admin/login", validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user.isAdmin) {
      res
        .status(401)
        .send({ message: "Admin Authorization failed", success: false });
    }
    if (!user) throw new Error("wrong email or password");
    if (!user.confirmation) {
      return res
        .status(400)
        .send({
          success: false,
          confirmed: "no",
          message: "Confirmation is required",
        });
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) throw new Error("wrong email or password");
    const token = jwt.sign({ _id: user._id }, "the-attack-titan");
    res.statusCode = 200;
    delete user.password;
    res.send({
      message: "logged in successfully",
      confirmed: "yes",
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.statusCode = 401;
    res.send({
      error,
      message: "Invalid credentials",
      confirmed: "invalid",
      success: false,
    });
  }
});

router.get("/profile", authenticate, async (req, res) => {
  try {
    const { _id } = req.signData;

    const user = await User.findOne({ _id }).populate("favoriteProducts");
    delete user.password;
    res.status(201).send({ user, success: true });
  } catch (error) {
    res.status(401).send({ error, message: "user not found", success: false });
  }
});
router.get(
  "/get/users/:pname",
  authenticate,
  adminAuthenticate,
  async (req, res) => {
    try {
      let { pname } = req.params;
      let { limit = 5, skip = 0 } = req.query;
      if (Number(limit) > 5) {
        limit = 5;
      }
      let numOfUsers = await User.countDocuments().exec();
      let users = await User.find({
        $or: [
          { firstname: { $regex: new RegExp("^" + pname.toLowerCase(), "i") } },
          { lastname: { $regex: new RegExp("^" + pname.toLowerCase(), "i") } },
        ],
      })
        .skip(Number(skip))
        .limit(Number(limit))
        .exec();
      if (!users) throw new Error(`Unabled to find any country to display`);
      res.status(200).send({ length: numOfUsers, users });
    } catch (error) {
      res.status(401).send(error);
    }
  }
);
router.patch("/changePassword", authenticate, async (req, res) => {
  try {
    let { _id } = req.signData;
    let { password, newPassword } = req.body;
    let user = await User.findOne({ _id });
    let isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res
        .status(401)
        .send({
          err: "",
          success: false,
          message: "Unauthorized user, wrong password",
        });
    }

    password = await bcrypt.hash(newPassword, 7);
    user.password = password;
    let newUpdate = await User.findOneAndUpdate({ _id }, user, {
      new: true,
    }).exec();
    delete newUpdate.password;
    res
      .status(200)
      .send({
        newUpdate,
        message: "password has been changed successfully",
        success: true,
      });
  } catch (error) {
    res
      .status(400)
      .send({ error, message: "Failure in changing password", success: false });
  }
});

router.post("/forgetPassword", async (req, res) => {
  try {
    let { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ message: "Email is not registered", success: false });
    }
    const token = jwt.sign({ _id: user._id }, "the-attack-titan"); // expiration json web token in 2 hours
    const forgetPassword = `https://amnesia-ecommerce.herokuapp.com/resetpassword/${token}`;
    const message = forgotPassEmail(user.firstname, forgetPassword);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amnesia.ecommerce@gmail.com",
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Amnesia - Skin Care" <amnesia.ecommerce@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Password Reset", // Subject line
      text: "Password Reset", // plain text body
      html: message, // html body
    });

    delete user.password;
    res.status(201).send({ user, success: true, message: "sent successfully" });
  } catch (error) {
    res
      .status(404)
      .send({ message: "Unable to reset password", success: false, error });
  }
});

router.post("/reset/password", authenticate, async (req, res) => {
  try {
    let { _id } = req.signData;
    let { password } = req.body;
    const hash = await bcrypt.hash(password, 7);
    let user = await User.findByIdAndUpdate(
      { _id },
      { password: hash },
      {
        new: true,
      }
    ).exec();
    delete user.password;
    res
      .status(200)
      .send({
        message: "Password has been changed successfully",
        success: true,
        user,
      });
  } catch (error) {
    res
      .status(400)
      .send({
        message: "Password failed to be changed",
        success: false,
        error,
      });
  }
});

router.post("/contactus", async (req, res) => {
  try {
    let { email, subject, fullname, message, phone } = req.body;
    let toEmail = "aelsherif333@gmail.com"; // Send to Admin
    const fullmessage = contactUsEmail(fullname, message, email, phone);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amnesia.ecommerce@gmail.com",
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Amnesia - Skin Care" <amnesia.ecommerce@gmail.com>', // sender address
      to: toEmail, // list of receivers
      subject: subject, // Subject line
      text: subject, // plain text body
      html: fullmessage, // html body
    });

    res.status(201).send({ success: true, message: "sent successfully" });
  } catch (error) {
    res.status(422).send({ error, success: false });
  }
});
// Get all users in MongoDB
router.get("/get/users", authenticate, adminAuthenticate, async (req, res) => {
  try {
    let { limit = 10, skip = 0 } = req.query;
    if (Number(limit) > 10) {
      limit = 10;
    }
    let numOfUsers = await User.countDocuments().exec();
    let users = await User.find()
      .skip(Number(skip))
      .limit(Number(limit))
      .exec();
    if (!users) throw new Error(`Unabled to find users to display`);
    res.status(200).send({ length: numOfUsers, users });
  } catch (error) {
    res.status(401).send(error);
  }
});
router
  .route("/")
  .delete(authenticate, async (req, res) => {
    try {
      const { _id } = req.signData;
      let user = await User.findOne({ _id });
      await User.deleteOne({ _id });
      res
        .status(200)
        .send({ message: "User was deleted successfully", success: true });
    } catch (error) {
      res.status(401).send({ error, success: false });
    }
  })
  .patch(authenticate, userValidate, async (req, res) => {
    try {
      const { _id } = req.signData;
      let {
        email,
        gender,
        userPassword,
        firstname,
        lastname,
        addresses,
        phones,
      } = req.body;
      let user = await User.findOne({ _id });
      const isMatched = await bcrypt.compare(userPassword, user.password);
      if (!isMatched) {
        return res
          .status(401)
          .send({
            err: "",
            success: false,
            message: "Unauthorized user, wrong password",
          });
      }
      const newUpdate = await User.findOneAndUpdate(
        { _id },
        {
          email,
          gender,
          firstname,
          lastname,
          addresses,
          phones,
          password: user.password,
          confirmation: user.confirmation,
          profileImage: user.profileImage,
          favoriteProducts: user.favoriteProducts,
          isAdmin: user.isAdmin,
        },
        {
          new: true,
        }
      ).exec();
      if (!newUpdate) throw new Error({ error: "Error in updating user info" });
      delete newUpdate.password;
      res
        .status(201)
        .send({
          message: "user was edited successfully",
          newUpdate,
          valid: true,
          success: true,
        });
    } catch (error) {
      res
        .status(401)
        .send({ error: "Error in updating user info", success: false });
    }
  });
module.exports = router;

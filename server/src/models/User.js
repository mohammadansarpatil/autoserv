// server/src/models/User.js
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

/**
 * User schema
 * - name: display name
 * - email: unique login identifier (lowercased)
 * - passwordHash: the hashed-and-salted password (never store the plain password)
 */
const userSchema = new Schema(
  {
    name: { type: String, trim: true, required: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,  // creates a unique index in Mongo (prevents duplicates)
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Invalid email format",
      },
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// Make API responses clean: id instead of _id; hide passwordHash
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
  },
});

/**
 * Instance method: setPassword(plain)
 * - Validates length (>= 6)
 * - Generates a salt
 * - Hashes the password with the salt
 * - Stores the result in passwordHash
 */
userSchema.methods.setPassword = async function (plain, saltRounds = 10) {
  if (typeof plain !== "string" || plain.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  const salt = await bcrypt.genSalt(saltRounds);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

/**
 * Instance method: validatePassword(plain)
 * - Compares a plain password with the stored hash
 */
userSchema.methods.validatePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = model("User", userSchema);

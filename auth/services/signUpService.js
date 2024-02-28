const axios = require("axios");
const prisma = require("../utils/prisma");
const Password = require("../utils/Password");
const config = require("../config/config");

const { trace, SpanStatusCode } = require("@opentelemetry/api");

const ENUM = require("../utils/enum");
const {
  emailVerification,
  createVerification,
  generateVerificationCode,
} = require("./common/verification");

/**
 * Sign up a new user.
 *
 * @param {Object} params - The parameters for signing up a user.
 * @param {string} params.name - The name of the user.
 * @param {string} params.email - The email of the user.
 * @param {string} params.password - The password of the user.
 * @returns {Object} - The user details.
 * @throws {Error} - If name, email, or password is missing or if the email already exists.
 */
const signUpService = async ({ name, email, password }) => {
  const error = new Error();
  if (!name || !email || !password) {
    error.message = "Name, Email and Password is required!";
    error.status = 400;

    throw error;
  }

  // Todo: check if user already exists or not
  const existingUser = await axios.get(
    `${config.user_service_url}/users/email/${email}`
  );

  console.log("hello", existingUser?.data);

  if (existingUser?.data?.user) {
    error.message = "Email already exists!";
    error.status = 409;

    throw error;
  }

  //  Todo: Create user in user service
  const createdUser = await axios.post(`${config.user_service_url}/users`, {
    name,
    email,
  });

  console.log("createdUser", createdUser.data.user);

  const hashedPassword = await Password.hash(password);

  // Todo: Create user in auth service
  const newUser = await prisma.user.create({
    data: {
      username: createdUser.data.user.username,
      userId: createdUser.data.user.id,
      email: createdUser.data.user.email,
      password: hashedPassword,
    },
  });

  // Todo: Create user verification
  const verificationTable = await createVerification({
    userId: createdUser.data.user.id,
    verificationCode: generateVerificationCode(), // unique code
    expiredAt: ENUM.VerificationExpiredAt,
    type: ENUM.VerificationType["ACCOUNT_VERIFICATION"],
  });

  // Todo: Send email to user for verification
  emailVerification({
    email,
    verificationCode: verificationTable.verificationCode,
  });

  return {
    user_id: createdUser.data.user.id,
    name: newUser.username,
    email: newUser.email,
  };
};

module.exports = signUpService;

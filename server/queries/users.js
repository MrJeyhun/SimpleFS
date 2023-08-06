const pool = require("../config");
const Auth = require("../helpers/auth");
const bcrypt = require("bcrypt");

const userStatus = {
  active: "ACTIVE",
  blocked: "BLOCKED",
};

const Users = {
  loginUser: async (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send({ message: "Some values are missing" });
    }

    if (!Auth.isValidEmail(email)) {
      return response
        .status(400)
        .send({ message: "Please enter a valid email address" });
    }

    try {
      const userQuery = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      userById = userQuery.rows[0];
      if (!userById) {
        return response.status(404).send({ message: "User can not be found." });
      }

      if (!bcrypt.compareSync(password, userById.password)) {
        return response
          .status(400)
          .send({ message: "email and password does not match" });
      }

      if (userById.status !== userStatus.active) {
        return response.status(403).send({ message: "User is blocked" });
      }

      const token = Auth.generateToken(userById.id);
      return response.status(201).json({ userById, token });
    } catch (error) {
      console.log(error.message, "Error message: ", response.status);
    }
  },

  createUser: async (request, response) => {
    const { email, password, name } = request.body;
    if (!email || !password || !name) {
      return response.status(400).send({ message: "Some values are missing" });
    }

    if (!Auth.isValidEmail(email)) {
      return response
        .status(400)
        .send({ message: "Please enter a valid email address" });
    }

    try {
      const userQuery = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      userById = userQuery.rows[0];
      if (userById) {
        return response
          .status(404)
          .send({ message: "Already registered with this email" });
      }
    } catch (error) {
      console.log(error.message, "Error message: ", response.status);
    }

    const hashPassword = Auth.hashPassword(password);

    try {
      const newUser = await pool.query(
        "INSERT INTO users ( email, password, name, status) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, hashPassword, name, userStatus.active]
      );
      response.status(201).json(newUser.rows[0]);
    } catch (error) {
      console.log(error.message, "response status: ", response.status);
    }
  },
  getUsers: async (_, response) => {
    try {
      const allUsers = await pool.query("SELECT * FROM users ORDER BY id ASC");
      response.status(200).json(allUsers.rows);
    } catch (error) {
      console.log(error.message, "response status: ", response.status);
    }
  },
  getUserById: async (request, response) => {
    try {
      const id = parseInt(request.params.id);
      const userById = await pool.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      response.status(200).json(userById.rows);
    } catch (error) {
      console.log(error.message, "response status: ", response.status);
    }
  },

  deleteUser: async (request, response) => {
    try {
      const idArray = request.body.idArray;

      const deletedUser = pool.query("DELETE FROM users WHERE id = ANY($1)", [
        idArray,
      ]);
      response
        .status(200)
        .send({ message: `Users deleted with ID: ${idArray}` });
    } catch (error) {
      console.log(error.message, "response status: ", response.status);
    }
  },

  blockUser: async (request, response) => {
    try {
      const idArray = request.body.idArray;

      const blockedUser = await pool.query(
        "UPDATE users SET status = $1 WHERE id = ANY($2)",
        [userStatus.blocked, idArray]
      );

      response
        .status(200)
        .send({ message: `Users blocked with ID: ${idArray}` });
    } catch (error) {
      console.log(error.message, "response status: ", response.status);
    }
  },

  unBlockUser: async (request, response) => {
    try {
      const idArray = request.body.idArray;

      const blockedUser = await pool.query(
        "UPDATE users SET status = $1 WHERE id = ANY($2)",
        [userStatus.active, idArray]
      );
      response
        .status(200)
        .send({ message: `Users unblocked with ID: ${idArray}` });
    } catch (error) {
      console.log(error.message, "response status: ", response.status);
    }
  },
};

module.exports = Users;

const Passwords = require('machinepack-passwords');
/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	async create(req, res) {
		const {username, password} = req.body;

		const createdUser = await User
			.create({username, password})
			.fetch()
			.catch(err => res.serverError(err));

		req.session.user = createdUser.id;

		return res.ok(createdUser);
	},

	async login(req, res) {
		const {username, password} = req.body;

		const user = await User
			.findOne({username})
			.catch(err => res.serverError(err));

		if (!user) {
			return res.forbidden();
		} 

		Passwords
			.checkPassword({passwordAttempt: password, encryptedPassword: user.password})
			.exec({
				error: function (err) {
					return res.serverError(err);
				},
				incorrect: function () {
					return res.forbidden();
				},
				success: function () {
					req.session.user = user.id;

					return res.ok(user);
				}
			})
	},

	async logout(req, res) {
		req.session.user = null;

		return res.ok();
	},
	async findLoggedInUser(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		} 

		const user = await User
			.find({id: req.session.user});

		if (user.length === 0) {
			return res.notFound();
		} 

		return res.ok(user);
	},
	async updateLoggedInUser(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const {username, password} = req.body;

		const user = await User
			.updateOne({id: req.session.user})
			.set({username, password});

		if (!user) {
			return res.notFound();
		} 

		return res.ok(user);
	},
	async findOne(req, res) {
		const user = await User
			.findOne({id: req.params.id});

		if (!user) {
			return res.notFound();
		} 

		return res.ok(user);
	}
};


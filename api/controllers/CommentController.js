/**
 * CommentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	async create(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const {postId, text} = req.body;
		const userId = req.session.user;

		const createdComment = await Comment
			.create({userId, postId, text})
			.fetch()
			.catch(err => res.serverError(err));

		return res.ok(createdComment);
	},

	async update(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const {id} = req.params;
		const {text} = req.body;

		const updatedComment = await Comment
			.updateOne({id, userId: req.session.user})
			.set({text})
			.catch(err => res.serverError(err));

		if (!updatedComment) {
			return res.notFound();
		}

		return res.ok(updatedComment);
	},

	async delete(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const {id} = req.params;

		const deletedComment = await Comment
			.destroyOne({id, userId: req.session.user})
			.catch(err => res.serverError(err));

		if (!deletedComment) {
			return res.notFound();
		}

		return res.ok(deletedComment);
	}
};


/**
 * PostController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
	async create(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const {text} = req.body;
		const userId = req.session.user;
		const createdPost = await Post
			.create({userId, text})
			.fetch()
			.catch(err => res.serverError(err));

		return res.ok(createdPost);
	},
	async find(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const posts = await Post
			.find()
			.populate('comments')
			.populate('userId')
			.catch(err => res.serverError(err));

		for (const post of posts) {
			if (post && post.comments.length > 0) {
				post.comments = await Comment
					.find({ postId: post.id })
					.populate('userId');
			}
		}

		return res.ok(posts);
	},

	async update(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const {id} = req.params;
		const {text} = req.body;

		const updatedPost = await Post
			.updateOne({id, userId: req.session.user})
			.set({text})
			.catch(err => res.serverError(err));

		if (!updatedPost) {
			return res.notFound();
		} 

		return res.ok(updatedPost);
	},

	async delete(req, res) {
		if (!req.session.user) {
			return res.forbidden();
		}

		const {id} = req.params;
		const deletedPost = await Post
			.destroyOne({id, userId: req.session.user})
			.catch(err => res.serverError(err));

		if (!deletedPost) {
			return res.notFound();
		}

		return res.ok(deletedPost);
	}
};


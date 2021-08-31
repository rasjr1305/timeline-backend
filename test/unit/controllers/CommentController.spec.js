var request = require('supertest');
var agent;

require('../../bootstrap');

describe('POST /comments', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it("should add a comment to a post if user is logged in", async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post!', userId: createdUser.id})
			.fetch();

		const commentResponse = await agent
			.post('/comments')
			.send({text: 'Hello comment!', postId: createdPost.id})

		const addedComment = await Post
			.findOne({id: commentResponse.body.id, userId: createdUser.id, postId: createdPost.id});

		commentResponse.status.should.be.equal(200);
		commentResponse.body.should.be.an('object');
		commentResponse.body.should.have.property('userId', createdUser.id);
		commentResponse.body.should.have.property('postId', createdPost.id);
		commentResponse.body.should.have.property('text', 'Hello comment!');

		should.exist(addedComment);
	});

	it('should not be able to add a comment and return forbidden if user is not logged in', async () => {
		const commentResponse = await agent
			.post('/comments')
			.send({text: 'Hello comment!'})

		commentResponse.status.should.be.equal(403);
	})
});

describe('PUT /comments/:id', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it('should update a comment of the logged in user', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		const createdComment = await Comment
			.create({text: 'Hello Comment!', postId: createdPost.id, userId: createdUser.id})
			.fetch();

		await agent
			.post('/login')
			.send({username: 'john_doe', password: '12345'});

		const response = await agent
			.put(`/comments/${createdComment.id}`)
			.send({text: 'This is my updated comment'});

		response.status.should.be.equal(200);

		const updatedComment = await Comment
			.findOne({id: createdComment.id});

		updatedComment.text.should.be.equal('This is my updated comment');
	})

	it('should not be able to update a comment and return forbidden if user is not logged in', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		const createdComment = await Comment
			.create({text: 'Hello Comment!', postId: createdPost.id, userId: createdUser.id})
			.fetch();

		const postResponse = await agent
			.put(`/posts/${createdPost.id}`)
			.send({text: 'This is my updated post'});

		postResponse.status.should.be.equal(403);

		const notUpdatedComment = await Comment
			.findOne({id: createdComment.id});

		notUpdatedComment.text.should.be.equal('Hello Comment!');
	})
})

describe('DELETE /comments/:id', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it('should delete a comment of the logged in user', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		const createdComment = await Comment
			.create({text: 'Hello Comment!', postId: createdPost.id, userId: createdUser.id})
			.fetch();

		await agent
			.post('/login')
			.send({username: 'john_doe', password: '12345'});

		const response = await agent.delete(`/comments/${createdComment.id}`);

		response.status.should.be.equal(200);

		const deletedComment = await Comment
			.findOne({id: createdComment.id});

		should.not.exist(deletedComment);
	});

	it('should not be able to delete a comment and return forbidden if user is not logged in', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		const createdComment = await Comment
			.create({text: 'Hello Comment!', postId: createdPost.id, userId: createdUser.id})
			.fetch();

		const response = await agent.delete(`/posts/${createdComment.id}`);

		response.status.should.be.equal(403);

		const notDeletedComment = await Post
			.findOne({id: createdComment.id});

		notDeletedComment.id.should.be.equal(createdComment.id);
	})
});
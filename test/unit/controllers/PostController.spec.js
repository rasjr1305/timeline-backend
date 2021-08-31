var request = require('supertest');
var agent;

require('../../bootstrap');

describe('POST /posts', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it("should add a post to the session user", async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const postResponse = await agent
			.post('/posts')
			.send({text: 'This is my new post!'})

		const addedPost = await Post.findOne({id: postResponse.body.id, userId: createdUser.id});

		postResponse.status.should.be.equal(200);
		postResponse.body.should.be.an('object');
		postResponse.body.should.have.property('userId', createdUser.id);
		postResponse.body.should.have.property('text', 'This is my new post!');

		should.exist(addedPost);
	});

	it('should not be able to add a post and return forbidden if user is not logged in', async () => {
		const postResponse = await agent
			.post('/posts')
			.send({text: 'This is my new post!'})

		postResponse.status.should.be.equal(403);
	})
});

describe('GET /posts', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it('should return all posts if user is logged in', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPosts = await Post
			.createEach([{text: 'post1', userId: createdUser.id}, {text: 'post2', userId: createdUser.id}])
			.fetch();

		const loginResponse = await agent
			.post('/login')
			.send({username: 'john_doe', password: '12345'});

		const response = await agent.get('/posts');

		response.status.should.be.equal(200);
		response.body.should.be.an('array');
		response.body[0].should.have.property('text', 'post1');
		response.body[1].should.have.property('text', 'post2');
	});

	it('should not be able to get all posts and return forbidden if user is not logged in', async () => {
		const postResponse = await agent.get('/posts');

		postResponse.status.should.be.equal(403);
	})
});

describe('PUT /posts/:id', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it('should update a post of the logged in user', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		await agent
			.post('/login')
			.send({username: 'john_doe', password: '12345'});

		const response = await agent
			.put(`/posts/${createdPost.id}`)
			.send({text: 'This is my updated post'});

		response.status.should.be.equal(200);

		const updatedPost = await Post.findOne({
			id: createdPost.id
		});

		updatedPost.text.should.be.equal('This is my updated post');
	})

	it('should not be able to update a post and return forbidden if user is not logged in', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		const postResponse = await agent
			.put(`/posts/${createdPost.id}`)
			.send({text: 'This is my updated post'});

		postResponse.status.should.be.equal(403);
	})
})

describe('DELETE /posts/:id', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it('should delete a post of the logged in user', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		await agent
			.post('/login')
			.send({username: 'john_doe', password: '12345'});

		const response = await agent.delete(`/posts/${createdPost.id}`);

		response.status.should.be.equal(200);

		const deletedPost = await Post.findOne({id: createdPost.id});

		should.not.exist(deletedPost);
	});

	it('should not be able to delete a post and return forbidden if user is not logged in', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const createdPost = await Post
			.create({text: 'This is my post', userId: createdUser.id})
			.fetch();

		const postResponse = await agent.delete(`/posts/${createdPost.id}`);

		postResponse.status.should.be.equal(403);

		const notDeletedPost = await Post.findOne({id: createdPost.id});

		notDeletedPost.id.should.be.equal(createdPost.id);
	})
});
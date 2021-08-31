var request = require('supertest');
var agent;

require('../../bootstrap');

describe('POST /users', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	it('should return a created user', async () => {
		const response = await agent
			.post('/users')
			.send({username: "john_doe", password: "123456"});

		response.status.should.be.equal(200);

		response.body.should.be.an('object');
		response.body.should.have.property('id');
		response.body.should.have.property('username', 'john_doe');
		response.body.should.not.have.property('password');
	});

	it('should return server error if creates an user with same name', async () => {
		await User.create({username: "john_doe", password: "123456"});

		const response = await agent
			.post('/users')
			.send({username: "john_doe", password: "123456"});

		response.status.should.be.equal(500);
	});
})

describe('POST /login', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	it('should login if valid credentials', async () => {
		const createdUser = await User
			.create({username: 'john_doe',password: '123456'})
			.fetch();

		const response = await agent
			.post('/login')
			.send({username: 'john_doe', password: '123456'});

		response.status.should.be.equal(200);
		response.body.should.be.an('object');
		response.body.should.have.property('id', createdUser.id);
		response.body.should.have.property('username', 'john_doe');
		response.body.should.not.have.property('password');
	});

	it('should not login if invalid credentials', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '123456'})
			.fetch();

		const response = await agent
			.post('/login')
			.send({username: 'john_doe', password: '123'})

		response.status.should.be.equal(403);
		response.text.should.include('Forbidden');
	})
});

describe('DELETE /logout', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	it('should destroy the user session', async () => {
		const response = await agent.delete('/logout');

		response.status.should.be.equal(200);
	});
})

describe('GET /me', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);
		done();
	})

	it("should return logged in user", async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const loginResponse = await agent
			.post('/login')
			.send({username: 'john_doe', password: '12345'});

		const loggedInUserResponse = await agent.get('/me');

		loggedInUserResponse.status.should.be.equal(200);
		loggedInUserResponse.body[0].should.have.property('id', createdUser.id);
		loggedInUserResponse.body[0].should.have.property('username', 'john_doe');
		loggedInUserResponse.body[0].should.not.have.property('password');
	});

	it("should return not found if no user is found", async () => {
		const response = await agent.get('/users');

		response.status.should.be.equal(404);
	});

	it('should return forbidden if user is not logged in', async () => {
		await agent.delete('/logout');

		const loggedInUserResponse = await agent.get('/me');

		loggedInUserResponse.status.should.be.equal(403);
	})
});

describe('PUT /me', () => {
	before(function (done) {
		agent = request.agent(sails.hooks.http.app);

		done();
	})

	beforeEach(async () => {
		await agent.delete('/logout');
	})

	it('should update logged in user', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const loginResponse = await agent
			.post('/login')
			.send({username: 'john_doe', password: '12345'});

		const response = await agent
			.put('/me')
			.send({username: 'john_doe_updated', password: '123456'});

		response.status.should.be.equal(200);

		const updatedUser = await User.findOne({id: createdUser.id});

		updatedUser.username.should.be.equal('john_doe_updated');
	});

	it('should return forbidden if user is not logged in', async () => {
		const createdUser = await User
			.create({username: 'john_doe', password: '12345'})
			.fetch();

		const response = await agent
			.put('/me')
			.send({username: 'john_doe_updated', password: '123456'});

		response.status.should.be.equal(403);

		const notUpdatedUser = await User.findOne({id: createdUser.id});

		notUpdatedUser.username.should.be.equal('john_doe');
	})
})
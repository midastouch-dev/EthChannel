
const PaymentChannels = artifacts.require('./PaymentChannels');

const expectThrow = require('./utils').expectThrow;
const promisify = require('./utils').promisify;

contract('PaymentChannels', function (accounts) {
    beforeEach(async function () {
        this.channels = await PaymentChannels.new();
    });
    
    it('initial balance', async function () {
        const balance = await this.channels.balanceOf(accounts[0]);
        
        assert.equal(balance, 0);
    });
    
    it('deposit', async function () {
        await this.channels.deposit({ from: accounts[0], value: 1000 });
        
        const balance = await this.channels.balanceOf(accounts[0]);
        
        assert.equal(balance, 1000);
    });
    
    it('deposit and withdraw', async function () {
        await this.channels.deposit({ from: accounts[0], value: 1000 });
        await this.channels.withdraw(500, { from: accounts[0] });
        
        const balance = await this.channels.balanceOf(accounts[0]);
        
        assert.equal(balance, 500);
    });
    
    it('cannot withdraw without enough balance', async function () {
        await this.channels.deposit({ from: accounts[0], value: 1000 });
        await this.channels.deposit({ from: accounts[1], value: 1000 });
        await expectThrow(this.channels.withdraw(1500, { from: accounts[0] }));
        
        const balance = await this.channels.balanceOf(accounts[0]);
        
        assert.equal(balance, 1000);
    });
    
    it('open channel', async function () {
        await this.channels.deposit({ from: accounts[0], value: 1000 });
        await this.channels.openChannel(500, accounts[1], { from: accounts[0] });
        
        const balance = await this.channels.balanceOf(accounts[0]);
        
        assert.equal(balance, 500);
        
        const reserved = await this.channels.reserveOf(accounts[0]);
        
        assert.equal(reserved, 500);
        
        const createChannelEvent = this.channels.CreateChannel({}, { fromBlock: 1, toBlock: 'latest' });

        const logs = await promisify(cb => createChannelEvent.get(cb));
        
        assert.ok(logs);
        assert.ok(Array.isArray(logs));
        assert.ok(logs.length);
        assert.equal(logs.length, 1);
        
        assert.equal(logs[0].event, 'CreateChannel');
        assert.equal(logs[0].args.creator, accounts[0]);
        assert.equal(logs[0].args.participant, accounts[1]);
        assert.equal(logs[0].args.creatorBalance, 500);
        assert.ok(logs[0].args.channelId);
        
        const channelId = logs[0].args.channelId;
        
        const data = await this.channels.getChannel(channelId);
        
        assert.ok(data);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 4);
        assert.equal(data[0], accounts[0]);
        assert.equal(data[1], accounts[1]);
        assert.equal(data[2], 500);
        assert.equal(data[3], 0);
    });

    it('participant transfer to channel', async function () {
        await this.channels.deposit({ from: accounts[0], value: 1000 });
        await this.channels.deposit({ from: accounts[1], value: 1000 });
        await this.channels.openChannel(500, accounts[1], { from: accounts[0] });

        const createChannelEvent = this.channels.CreateChannel({}, { fromBlock: 1, toBlock: 'latest' });
        const logs = await promisify(cb => createChannelEvent.get(cb));
        const channelId = logs[0].args.channelId;

        await this.channels.transferToChannel(channelId, 400, { from: accounts[1] });

        const balance = await this.channels.balanceOf(accounts[0]);        
        assert.equal(balance, 500);        
        const reserved = await this.channels.reserveOf(accounts[0]);
        assert.equal(reserved, 500);
        
        const balance2 = await this.channels.balanceOf(accounts[1]);
        assert.equal(balance2, 600);        
        const reserved2 = await this.channels.reserveOf(accounts[1]);
        assert.equal(reserved2, 400);
        
        const data = await this.channels.getChannel(channelId);
        
        assert.ok(data);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 4);
        assert.equal(data[0], accounts[0]);
        assert.equal(data[1], accounts[1]);
        assert.equal(data[2], 500);
        assert.equal(data[3], 400);
    });
    
    it('creator transfer to channel', async function () {
        await this.channels.deposit({ from: accounts[0], value: 1000 });
        await this.channels.deposit({ from: accounts[1], value: 1000 });
        await this.channels.openChannel(500, accounts[1], { from: accounts[0] });

        const createChannelEvent = this.channels.CreateChannel({}, { fromBlock: 1, toBlock: 'latest' });
        const logs = await promisify(cb => createChannelEvent.get(cb));
        const channelId = logs[0].args.channelId;

        await this.channels.transferToChannel(channelId, 400, { from: accounts[0] });

        const balance = await this.channels.balanceOf(accounts[0]);        
        assert.equal(balance, 100);        
        const reserved = await this.channels.reserveOf(accounts[0]);
        assert.equal(reserved, 900);
        
        const balance2 = await this.channels.balanceOf(accounts[1]);
        assert.equal(balance2, 1000);        
        const reserved2 = await this.channels.reserveOf(accounts[1]);
        assert.equal(reserved2, 0);
        
        const data = await this.channels.getChannel(channelId);
        
        assert.ok(data);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 4);
        assert.equal(data[0], accounts[0]);
        assert.equal(data[1], accounts[1]);
        assert.equal(data[2], 900);
        assert.equal(data[3], 0);
    });

    it('only creator or participant could transfer to channel', async function () {
        await this.channels.deposit({ from: accounts[0], value: 1000 });
        await this.channels.deposit({ from: accounts[1], value: 1000 });
        await this.channels.openChannel(500, accounts[1], { from: accounts[0] });

        const createChannelEvent = this.channels.CreateChannel({}, { fromBlock: 1, toBlock: 'latest' });
        const logs = await promisify(cb => createChannelEvent.get(cb));
        const channelId = logs[0].args.channelId;

        await expectThrow(this.channels.transferToChannel(channelId, 400, { from: accounts[2] }));

        const balance = await this.channels.balanceOf(accounts[0]);        
        assert.equal(balance, 500);        
        const reserved = await this.channels.reserveOf(accounts[0]);
        assert.equal(reserved, 500);
        
        const balance2 = await this.channels.balanceOf(accounts[1]);
        assert.equal(balance2, 1000);
        const reserved2 = await this.channels.reserveOf(accounts[1]);
        assert.equal(reserved2, 0);
        
        const data = await this.channels.getChannel(channelId);
        
        assert.ok(data);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 4);
        assert.equal(data[0], accounts[0]);
        assert.equal(data[1], accounts[1]);
        assert.equal(data[2], 500);
        assert.equal(data[3], 0);
    });
});


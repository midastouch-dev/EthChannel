
const EthChannels = artifacts.require('./EthChannels');

const expectThrow = require('./utils').expectThrow;

contract('EthChannels', function (accounts) {
    beforeEach(async function () {
        this.channels = await EthChannels.new();
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
});


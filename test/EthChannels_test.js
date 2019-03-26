
const EthChannels = artifacts.require('./EthChannels');

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
});


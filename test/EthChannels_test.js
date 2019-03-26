
const EthChannels = artifacts.require('./EthChannels');

contract('EthChannels', function (accounts) {
    beforeEach(async function () {
        this.channels = await EthChannels.new();
    });
    
    it('initial balance', async function () {
        const balance = await this.channels.balanceOf(accounts[0]);
        
        assert.equal(balance, 0);
    });
});


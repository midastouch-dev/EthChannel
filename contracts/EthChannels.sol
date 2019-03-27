
contract EthChannels {
    uint nchannels;
    mapping (address => uint) balances;
    mapping (address => uint) reserves;
    
    struct Channel {
        address creator;
        address participant;
        uint    creatorBalance;
        uint    participantBalance;
    }
    
    mapping (bytes32 => Channel) channels;
    
    event CreateChannel(address creator, address participant, uint creatorBalance, bytes32 channelId);
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        msg.sender.transfer(amount);
    }
    
    function balanceOf(address account) public view returns (uint) {
        return balances[account];
    }
    
    function reserveOf(address account) public view returns (uint) {
        return reserves[account];
    }
    
    function openChannel(uint amount, address participant) public returns (bytes32) {
        balances[msg.sender] -= amount;
        reserves[msg.sender] += amount;
        uint nchannel = nchannels++;
        
        bytes32 channelId = keccak256(abi.encodePacked(msg.sender, participant, nchannel));
        channels[channelId] = Channel(msg.sender, participant, amount, 0);
        emit CreateChannel(msg.sender, participant, amount, channelId);
    }
    
    function getChannel(bytes32 channelId) public view returns (address, address, uint, uint) {
        Channel storage channel = channels[channelId];
        
        return (channel.creator, channel.participant, channel.creatorBalance, channel.participantBalance);
    }
}


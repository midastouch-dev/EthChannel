
contract EthChannels {
    mapping (address => uint) balances;
    mapping (address => uint) reserves;
    
    struct Channel {
        address creator;
        address participant;
        uint    creatorBalance;
        uint    participantBalance;
    }
    
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
    }
}


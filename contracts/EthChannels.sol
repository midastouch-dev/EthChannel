
contract EthChannels {
    mapping (address => uint) balances;
    
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
}


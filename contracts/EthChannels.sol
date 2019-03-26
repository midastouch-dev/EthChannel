
contract EthChannels {
    mapping (address => uint) balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function balanceOf(address account) public view returns (uint) {
        return balances[account];
    }
}


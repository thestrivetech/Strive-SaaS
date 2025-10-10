Prompt #38: Smart Contract Automation (Enhanced)
Role
Senior Blockchain Solutions Architect specializing in DeFi protocols, real estate tokenization, and enterprise smart contract systems
Context

Volume: 10,000 property transactions/month, $5B total value locked, 50K active wallets
Performance: <3s transaction confirmation, <100ms contract query, 1000 TPS throughput
Integration: Ethereum, Polygon, Binance Smart Chain, traditional title systems, 20 banks
Compliance: SEC regulations for tokenized securities, state real estate laws, AML/KYC requirements
Scale: Supporting 100K properties on-chain, 1M NFT property titles, cross-chain operations

Primary Objective
Enable fully automated real estate transactions via smart contracts with <3s confirmation times while maintaining 100% legal compliance and zero contract vulnerabilities
Enhanced Requirements
Smart Contract Architecture

Multi-Chain Property Transaction System

solidity// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract RealEstateTransactionV2 is 
    Initializable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable 
{
    // State variables
    struct Property {
        uint256 id;
        address currentOwner;
        uint256 price;
        string legalDescription;
        bytes32 titleHash;
        PropertyStatus status;
        uint256 lastTransactionTime;
        address[] previousOwners;
    }
    
    struct Transaction {
        uint256 propertyId;
        address buyer;
        address seller;
        uint256 purchasePrice;
        uint256 earnestDeposit;
        uint256 closingDate;
        TransactionState state;
        bytes32 documentsHash;
        mapping(string => bool) contingencies;
        address escrowAgent;
    }
    
    enum PropertyStatus { Available, UnderContract, Sold, Disputed }
    enum TransactionState { 
        Initiated, 
        EarnestDeposited, 
        InspectionPeriod,
        FinancingApproved,
        TitleCleared,
        ReadyToClose,
        Completed,
        Cancelled
    }
    
    // Advanced features
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => bool) public verifiedAgents;
    mapping(address => bool) public titleCompanies;
    
    // Oracle integration for real-world data
    AggregatorV3Interface internal priceFeed;
    
    // Events
    event PropertyListed(uint256 indexed propertyId, address owner, uint256 price);
    event OfferMade(uint256 indexed transactionId, address buyer, uint256 amount);
    event EscrowDeposited(uint256 indexed transactionId, uint256 amount);
    event TransactionCompleted(uint256 indexed propertyId, address from, address to);
    event ContingencyUpdated(uint256 indexed transactionId, string contingency, bool satisfied);
    
    // Modifiers
    modifier onlyVerifiedAgent() {
        require(verifiedAgents[msg.sender], "Not a verified agent");
        _;
    }
    
    modifier onlyTransactionParty(uint256 _transactionId) {
        Transaction storage txn = transactions[_transactionId];
        require(
            msg.sender == txn.buyer || 
            msg.sender == txn.seller || 
            msg.sender == txn.escrowAgent,
            "Not authorized"
        );
        _;
    }
    
    function initialize(address _priceFeed) public initializer {
        __ReentrancyGuard_init();
        __Pausable_init();
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
    
    function createPropertyListing(
        uint256 _propertyId,
        uint256 _price,
        string memory _legalDescription,
        bytes32 _titleHash
    ) external onlyVerifiedAgent whenNotPaused {
        require(properties[_propertyId].id == 0, "Property already exists");
        
        properties[_propertyId] = Property({
            id: _propertyId,
            currentOwner: msg.sender,
            price: _price,
            legalDescription: _legalDescription,
            titleHash: _titleHash,
            status: PropertyStatus.Available,
            lastTransactionTime: block.timestamp,
            previousOwners: new address[](0)
        });
        
        emit PropertyListed(_propertyId, msg.sender, _price);
    }
    
    function initiateTransaction(
        uint256 _propertyId,
        uint256 _offerPrice,
        uint256 _closingDate
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        Property storage property = properties[_propertyId];
        require(property.status == PropertyStatus.Available, "Property not available");
        require(msg.value >= (_offerPrice * 1) / 100, "Insufficient earnest money");
        
        uint256 transactionId = uint256(keccak256(abi.encode(_propertyId, msg.sender, block.timestamp)));
        
        Transaction storage txn = transactions[transactionId];
        txn.propertyId = _propertyId;
        txn.buyer = msg.sender;
        txn.seller = property.currentOwner;
        txn.purchasePrice = _offerPrice;
        txn.earnestDeposit = msg.value;
        txn.closingDate = _closingDate;
        txn.state = TransactionState.EarnestDeposited;
        
        property.status = PropertyStatus.UnderContract;
        
        emit OfferMade(transactionId, msg.sender, _offerPrice);
        emit EscrowDeposited(transactionId, msg.value);
        
        return transactionId;
    }
    
    function updateContingency(
        uint256 _transactionId,
        string memory _contingency,
        bool _satisfied
    ) external onlyTransactionParty(_transactionId) {
        Transaction storage txn = transactions[_transactionId];
        require(txn.state < TransactionState.ReadyToClose, "Too late to update");
        
        txn.contingencies[_contingency] = _satisfied;
        
        // Check if all contingencies are met
        if (_satisfied && checkAllContingencies(_transactionId)) {
            txn.state = TransactionState.ReadyToClose;
        }
        
        emit ContingencyUpdated(_transactionId, _contingency, _satisfied);
    }
    
    function completeTransaction(
        uint256 _transactionId
    ) external payable onlyTransactionParty(_transactionId) nonReentrant {
        Transaction storage txn = transactions[_transactionId];
        require(txn.state == TransactionState.ReadyToClose, "Not ready to close");
        require(block.timestamp <= txn.closingDate, "Closing date passed");
        
        uint256 remainingPayment = txn.purchasePrice - txn.earnestDeposit;
        require(msg.value >= remainingPayment, "Insufficient payment");
        
        Property storage property = properties[txn.propertyId];
        
        // Transfer ownership
        property.previousOwners.push(property.currentOwner);
        property.currentOwner = txn.buyer;
        property.status = PropertyStatus.Sold;
        property.lastTransactionTime = block.timestamp;
        
        // Transfer funds to seller
        (bool success, ) = txn.seller.call{value: txn.purchasePrice}("");
        require(success, "Transfer failed");
        
        // Update state
        txn.state = TransactionState.Completed;
        
        // Mint NFT title (integration with separate NFT contract)
        _mintPropertyNFT(txn.buyer, txn.propertyId);
        
        emit TransactionCompleted(txn.propertyId, txn.seller, txn.buyer);
    }
    
    // Oracle integration for property valuation
    function getPropertyValuation(uint256 _propertyId) public view returns (int256) {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        
        // Apply property-specific multiplier
        Property memory property = properties[_propertyId];
        return price * int256(property.price) / 1e8;
    }
    
    function _mintPropertyNFT(address _to, uint256 _propertyId) internal {
        // Integration with property NFT contract
        // This would call an external NFT contract to mint the property title
    }
    
    function checkAllContingencies(uint256 _transactionId) internal view returns (bool) {
        // Implementation would check all required contingencies
        return true;
    }
}

Cross-Chain Bridge for Property Tokens

typescriptclass CrossChainPropertyBridge {
  private readonly contracts: Map<ChainId, Contract>;
  private readonly relayers: RelayerPool;
  private readonly validators: ValidatorSet;
  
  async bridgeProperty(
    propertyToken: PropertyToken,
    sourceChain: ChainId,
    targetChain: ChainId,
    recipient: Address
  ): Promise<BridgeTransaction> {
    // Validate property token ownership
    const ownership = await this.validateOwnership(
      propertyToken,
      sourceChain
    );
    
    if (!ownership.valid) {
      throw new Error('Invalid ownership proof');
    }
    
    // Lock token on source chain
    const lockTx = await this.lockToken(
      propertyToken,
      sourceChain,
      this.contracts.get(sourceChain).address
    );
    
    // Wait for finality
    await this.waitForFinality(lockTx, sourceChain);
    
    // Generate cross-chain proof
    const proof = await this.generateMerkleProof(lockTx, sourceChain);
    
    // Validate across validator set
    const signatures = await this.collectValidatorSignatures(proof);
    
    if (signatures.length < this.validators.threshold) {
      throw new Error('Insufficient validator signatures');
    }
    
    // Mint on target chain
    const mintTx = await this.mintBridgedToken(
      propertyToken,
      targetChain,
      recipient,
      proof,
      signatures
    );
    
    // Update bridge state
    await this.updateBridgeState({
      tokenId: propertyToken.id,
      sourceChain,
      targetChain,
      lockTx: lockTx.hash,
      mintTx: mintTx.hash,
      status: 'completed'
    });
    
    return {
      bridgeId: this.generateBridgeId(lockTx, mintTx),
      sourceChain,
      targetChain,
      tokenId: propertyToken.id,
      recipient,
      status: 'completed',
      lockTxHash: lockTx.hash,
      mintTxHash: mintTx.hash
    };
  }
  
  async validateCompliance(
    transaction: PropertyTransaction
  ): Promise<ComplianceResult> {
    // Check AML/KYC requirements
    const kycStatus = await this.checkKYC([
      transaction.buyer,
      transaction.seller
    ]);
    
    if (!kycStatus.allVerified) {
      return {
        compliant: false,
        reason: 'KYC verification required',
        requiredActions: kycStatus.pendingVerifications
      };
    }
    
    // Check jurisdiction-specific rules
    const jurisdictionRules = await this.getJurisdictionRules(
      transaction.propertyLocation
    );
    
    const complianceChecks = await Promise.all([
      this.checkTransferTaxCompliance(transaction, jurisdictionRules),
      this.checkForeignOwnershipRules(transaction, jurisdictionRules),
      this.checkPropertyTypeRestrictions(transaction, jurisdictionRules),
      this.checkFinancingCompliance(transaction)
    ]);
    
    const violations = complianceChecks.filter(c => !c.compliant);
    
    if (violations.length > 0) {
      return {
        compliant: false,
        violations: violations,
        remediation: this.generateRemediationSteps(violations)
      };
    }
    
    // Generate compliance certificate
    const certificate = await this.generateComplianceCertificate({
      transaction,
      checks: complianceChecks,
      timestamp: Date.now(),
      validator: this.validators.primary
    });
    
    return {
      compliant: true,
      certificate: certificate,
      expiresAt: Date.now() + 86400000 // 24 hours
    };
  }
}
Blockchain Integration Layer
pythonclass BlockchainIntegrationEngine:
    def __init__(self):
        self.web3_providers = self.initialize_providers()
        self.contract_manager = ContractManager()
        self.gas_optimizer = GasOptimizer()
        self.event_listener = EventListener()
        
    async def execute_property_transaction(self, transaction_data):
        """
        Execute end-to-end property transaction across multiple chains
        """
        # Select optimal blockchain based on requirements
        chain = self.select_optimal_chain({
            'transaction_value': transaction_data['value'],
            'required_speed': transaction_data['urgency'],
            'compliance_requirements': transaction_data['compliance'],
            'gas_tolerance': transaction_data['max_gas_cost']
        })
        
        # Prepare transaction with gas optimization
        optimized_tx = await self.gas_optimizer.optimize_transaction(
            transaction_data,
            chain
        )
        
        # Deploy or interact with smart contracts
        if not await self.contract_exists(chain, 'PropertyTransaction'):
            contract = await self.deploy_contract(
                chain,
                'PropertyTransaction',
                transaction_data['initialization_params']
            )
        else:
            contract = self.get_contract(chain, 'PropertyTransaction')
        
        # Execute transaction with retry mechanism
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Send transaction
                tx_hash = await contract.functions.initiateTransaction(
                    propertyId=transaction_data['property_id'],
                    buyer=transaction_data['buyer_address'],
                    seller=transaction_data['seller_address'],
                    price=Web3.toWei(transaction_data['price'], 'ether')
                ).transact({
                    'from': transaction_data['sender'],
                    'gas': optimized_tx['gas_limit'],
                    'gasPrice': optimized_tx['gas_price'],
                    'nonce': await self.get_nonce(transaction_data['sender'])
                })
                
                # Wait for confirmation
                receipt = await self.wait_for_confirmation(
                    tx_hash,
                    confirmations=self.get_required_confirmations(chain)
                )
                
                # Verify transaction success
                if receipt['status'] == 1:
                    return {
                        'success': True,
                        'transaction_hash': tx_hash.hex(),
                        'block_number': receipt['blockNumber'],
                        'gas_used': receipt['gasUsed'],
                        'events': self.parse_events(receipt['logs'])
                    }
                
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        
        return {'success': False, 'error': 'Transaction failed after retries'}
    
    def select_optimal_chain(self, requirements):
        """
        Intelligently select blockchain based on requirements
        """
        chain_scores = {}
        
        chains = {
            'ethereum': {
                'security': 10,
                'speed': 3,
                'cost': 2,
                'compliance': 9,
                'liquidity': 10
            },
            'polygon': {
                'security': 8,
                'speed': 9,
                'cost': 9,
                'compliance': 7,
                'liquidity': 8
            },
            'binance': {
                'security': 7,
                'speed': 8,
                'cost': 8,
                'compliance': 6,
                'liquidity': 9
            }
        }
        
        weights = {
            'security': 0.3,
            'speed': 0.2,
            'cost': 0.2,
            'compliance': 0.2,
            'liquidity': 0.1
        }
        
        # Adjust weights based on requirements
        if requirements['transaction_value'] > 1000000:
            weights['security'] = 0.5
        
        if requirements['required_speed'] == 'immediate':
            weights['speed'] = 0.4
        
        # Calculate scores
        for chain_name, attributes in chains.items():
            score = sum(
                attributes[attr] * weights[attr]
                for attr in weights
            )
            chain_scores[chain_name] = score
        
        # Select highest scoring chain
        optimal_chain = max(chain_scores, key=chain_scores.get)
        return optimal_chain
Technical Specifications
Blockchain Infrastructure
yamlblockchain_infrastructure:
  networks:
    ethereum:
      rpc_endpoints:
        - https://mainnet.infura.io/v3/
        - https://eth-mainnet.alchemyapi.io/v2/
      chain_id: 1
      block_time: 12s
      finality: 15_blocks
      
    polygon:
      rpc_endpoints:
        - https://polygon-rpc.com/
        - https://matic-mainnet.chainstacklabs.com
      chain_id: 137
      block_time: 2s
      finality: 128_blocks
      
    binance_smart_chain:
      rpc_endpoints:
        - https://bsc-dataseed.binance.org/
        - https://bsc-dataseed1.defibit.io/
      chain_id: 56
      block_time: 3s
      finality: 15_blocks
      
  smart_contracts:
    upgradeable: true
    proxy_pattern: UUPS
    audit_required: true
    formal_verification: true
    
  oracles:
    chainlink:
      price_feeds: true
      vrf: true
      keepers: true
    
    custom:
      property_valuation: true
      title_verification: true
      compliance_check: true
Success Criteria
Performance Metrics

Transaction Speed: <3s confirmation on L2 chains
Throughput: 1000+ property transactions per second
Gas Efficiency: 50% reduction vs standard contracts
Cross-chain Transfer: <5 minutes for property token bridge
Oracle Response: <500ms for price/data feeds

Security Metrics

Audit Score: Zero critical vulnerabilities
Formal Verification: 100% core functions verified
TVL Protection: Multi-sig and timelock on >$1M value
Exploit Prevention: Zero successful exploits
Recovery Capability: <1 hour for emergency pause

Business Impact Metrics

Transaction Cost: 90% reduction vs traditional closing
Processing Time: 24 hours vs 30-60 days traditional
Dispute Resolution: 80% automated resolution
Compliance Rate: 100% regulatory compliance
User Adoption: 10,000 monthly active users

Testing Requirements
Smart Contract Security Tests
javascriptdescribe('PropertyTransaction Security', () => {
  let contract;
  let attacker;
  
  beforeEach(async () => {
    contract = await PropertyTransaction.deploy();
    [owner, buyer, seller, attacker] = await ethers.getSigners();
  });
  
  it('should prevent reentrancy attacks', async () => {
    // Deploy malicious contract
    const MaliciousContract = await ethers.getContractFactory('ReentrancyAttacker');
    const malicious = await MaliciousContract.deploy(contract.address);
    
    // Attempt reentrancy attack
    await expect(
      malicious.attack({ value: ethers.utils.parseEther('1') })
    ).to.be.revertedWith('ReentrancyGuard: reentrant call');
  });
  
  it('should handle integer overflow/underflow', async () => {
    const maxUint = ethers.constants.MaxUint256;
    
    // Attempt overflow
    await expect(
      contract.createPropertyListing(1, maxUint, 'Test', '0x123')
    ).to.not.throw();
    
    // Verify safe math
    await expect(
      contract.initiateTransaction(1, maxUint, future, { value: 1 })
    ).to.be.reverted();
  });
});
Implementation Checklist

 Phase 1: Smart Contract Development (Week 1-2)

 Write core property contracts
 Implement escrow mechanisms
 Add compliance checks
 Deploy to testnet
 Initial security audit


 Phase 2: Oracle Integration (Week 3)

 Connect Chainlink price feeds
 Build custom property oracles
 Implement title verification
 Add compliance oracles
 Test data accuracy


 Phase 3: Cross-Chain Bridge (Week 4-5)

 Deploy bridge contracts
 Implement validators
 Build relayer network
 Test cross-chain transfers
 Security audit bridge


 Phase 4: Production Launch (Week 6)

 Final security audit
 Deploy to mainnet
 Initialize multisig controls
 Launch monitoring
 User onboarding
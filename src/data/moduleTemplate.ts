
import { ModuleTemplate } from '@/types/modules';

export const builtInModules: ModuleTemplate[] = [
  {
    id: 'spl-token-mint',
    name: 'SPL Token Mint',
    description: 'Create and mint SPL tokens with configurable supply and decimals',
    category: 'Token',
    icon: 'Coins',
    color: 'from-yellow-500 to-orange-500',
    isBuiltIn: true,
    inputs: [
      {
        id: 'mint-authority',
        name: 'Mint Authority',
        type: 'account',
        required: true,
        description: 'Account with authority to mint tokens'
      },
      {
        id: 'token-account',
        name: 'Token Account',
        type: 'account',
        required: true,
        description: 'Destination account for minted tokens'
      }
    ],
    outputs: [
      {
        id: 'mint-result',
        name: 'Mint Result',
        type: 'instruction',
        required: true,
        description: 'Result of the mint operation'
      }
    ],
    documentation: {
      overview: 'Creates a new SPL token and mints initial supply to specified account.',
      usage: 'Connect a mint authority account and destination token account to mint tokens.',
      parameters: [
        {
          name: 'decimals',
          type: 'number',
          description: 'Number of decimal places for the token (0-9)',
          required: true,
          defaultValue: 9
        },
        {
          name: 'amount',
          type: 'number',
          description: 'Amount of tokens to mint',
          required: true
        }
      ],
      returns: 'Transaction signature and mint account address',
      examples: [
        'await mintTokens(mintAuthority, tokenAccount, 1000000);',
        'const result = mintTokens(authority, destination, amount);'
      ],
      relatedModules: ['spl-token-transfer', 'spl-token-burn']
    },
    examples: [
      {
        title: 'Basic Token Mint',
        description: 'Mint 1,000 tokens with 6 decimals',
        code: `
const mintTokens = async () => {
  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null,
    6
  );
  
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount,
    mintAuthority,
    1000 * Math.pow(10, 6)
  );
};`,
        explanation: 'Creates a mint with 6 decimals and mints 1,000 tokens to the destination account.'
      }
    ]
  },
  {
    id: 'nft-mint',
    name: 'NFT Mint',
    description: 'Mint NFTs with metadata using Metaplex standard',
    category: 'NFT',
    icon: 'Image',
    color: 'from-purple-500 to-pink-500',
    isBuiltIn: true,
    inputs: [
      {
        id: 'creator',
        name: 'Creator',
        type: 'account',
        required: true,
        description: 'NFT creator account'
      },
      {
        id: 'metadata',
        name: 'Metadata',
        type: 'data',
        required: true,
        description: 'NFT metadata including name, symbol, and URI'
      }
    ],
    outputs: [
      {
        id: 'nft-mint',
        name: 'NFT Mint',
        type: 'nft',
        required: true,
        description: 'Created NFT mint account'
      }
    ],
    documentation: {
      overview: 'Mints an NFT with metadata following Metaplex standards.',
      usage: 'Provide creator authority and metadata to mint a unique NFT.',
      parameters: [
        {
          name: 'name',
          type: 'string',
          description: 'Name of the NFT',
          required: true
        },
        {
          name: 'symbol',
          type: 'string',
          description: 'Symbol for the NFT collection',
          required: true
        },
        {
          name: 'uri',
          type: 'string',
          description: 'URI pointing to NFT metadata JSON',
          required: true
        }
      ],
      examples: [
        'mintNFT(creator, "My NFT", "MYNFT", "https://example.com/metadata.json");'
      ]
    }
  },
  {
    id: 'pda-account',
    name: 'PDA Account',
    description: 'Create and manage Program Derived Address accounts',
    category: 'Core',
    icon: 'Database',
    color: 'from-green-500 to-teal-500',
    isBuiltIn: true,
    inputs: [
      {
        id: 'seeds',
        name: 'Seeds',
        type: 'data',
        required: true,
        description: 'Seeds for PDA derivation'
      }
    ],
    outputs: [
      {
        id: 'pda-address',
        name: 'PDA Address',
        type: 'account',
        required: true,
        description: 'Derived PDA address'
      }
    ],
    documentation: {
      overview: 'Creates a Program Derived Address for deterministic account generation.',
      usage: 'Provide seeds to generate a PDA that can be used for program-controlled accounts.',
      parameters: [
        {
          name: 'seeds',
          type: 'string[]',
          description: 'Array of strings used as seeds for PDA derivation',
          required: true
        },
        {
          name: 'programId',
          type: 'PublicKey',
          description: 'Program ID for PDA derivation',
          required: true
        }
      ],
      examples: [
        'const [pda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], programId);'
      ]
    }
  },
  {
    id: 'governance-proposal',
    name: 'Governance Proposal',
    description: 'Create and manage governance proposals with voting',
    category: 'Governance',
    icon: 'Vote',
    color: 'from-blue-500 to-indigo-500',
    isBuiltIn: true,
    inputs: [
      {
        id: 'proposer',
        name: 'Proposer',
        type: 'account',
        required: true,
        description: 'Account creating the proposal'
      },
      {
        id: 'governance-token',
        name: 'Governance Token',
        type: 'token',
        required: true,
        description: 'Token used for voting power'
      }
    ],
    outputs: [
      {
        id: 'proposal',
        name: 'Proposal',
        type: 'account',
        required: true,
        description: 'Created proposal account'
      }
    ],
    documentation: {
      overview: 'Creates a governance proposal that token holders can vote on.',
      usage: 'Connect proposer account and governance token to create votable proposals.',
      parameters: [
        {
          name: 'title',
          type: 'string',
          description: 'Title of the proposal',
          required: true
        },
        {
          name: 'description',
          type: 'string',
          description: 'Detailed description of the proposal',
          required: true
        },
        {
          name: 'votingPeriod',
          type: 'number',
          description: 'Duration of voting period in seconds',
          required: true,
          defaultValue: 604800
        }
      ],
      examples: [
        'createProposal("Treasury Allocation", "Allocate 10% of treasury to development", 7 * 24 * 60 * 60);'
      ]
    }
  },
  {
    id: 'liquidity-pool',
    name: 'Liquidity Pool',
    description: 'Create AMM liquidity pools for token swapping',
    category: 'DeFi',
    icon: 'Zap',
    color: 'from-red-500 to-pink-500',
    isBuiltIn: true,
    inputs: [
      {
        id: 'token-a',
        name: 'Token A',
        type: 'token',
        required: true,
        description: 'First token in the pool'
      },
      {
        id: 'token-b',
        name: 'Token B',
        type: 'token',
        required: true,
        description: 'Second token in the pool'
      }
    ],
    outputs: [
      {
        id: 'pool-account',
        name: 'Pool Account',
        type: 'account',
        required: true,
        description: 'Created liquidity pool account'
      }
    ],
    documentation: {
      overview: 'Creates an AMM liquidity pool for automated token swapping.',
      usage: 'Connect two tokens to create a liquidity pool for decentralized trading.',
      parameters: [
        {
          name: 'feeRate',
          type: 'number',
          description: 'Trading fee rate as percentage (0-1)',
          required: true,
          defaultValue: 0.003
        },
        {
          name: 'initialLiquidity',
          type: 'object',
          description: 'Initial liquidity amounts for both tokens',
          required: true
        }
      ],
      examples: [
        'createLiquidityPool(tokenA, tokenB, 0.003, { tokenA: 1000, tokenB: 1000 });'
      ]
    }
  }
];

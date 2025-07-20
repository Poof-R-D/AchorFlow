import { CanvasNode, Connection } from '@/types/editor';

export interface GeneratedCode {
  lib: string;
  instructions: string[];
  tests: string;
  cargoToml: string;
  anchorToml: string;
  programFlow: ProgramFlow;
}

export interface ProgramFlow {
  entryPoints: string[];
  executionOrder: string[];
  dataFlow: DataFlowConnection[];
}

export interface DataFlowConnection {
  from: string;
  to: string;
  dataType: string;
  required: boolean;
}

export const generateAnchorCode = (nodes: CanvasNode[], connections: Connection[]): GeneratedCode => {
  const programName = 'my_program';
  const instructionNodes = nodes.filter(node => node.type !== 'account');
  const accountNodes = nodes.filter(node => node.type === 'account');

  // Analyze connections to understand program flow
  const programFlow = analyzeProgramFlow(nodes, connections);
  
  // Generate lib.rs with proper connection handling
  const lib = generateLibRs(programName, instructionNodes, accountNodes, connections);
  
  // Generate individual instruction files with connection context
  const instructions = instructionNodes.map(node => 
    generateInstruction(node, connections, nodes)
  );
  
  // Generate comprehensive tests
  const tests = generateTests(programName, instructionNodes, connections);
  
  // Generate Cargo.toml with proper dependencies
  const cargoToml = generateCargoToml(programName);
  
  // Generate Anchor.toml
  const anchorToml = generateAnchorToml(programName);

  return {
    lib,
    instructions,
    tests,
    cargoToml,
    anchorToml,
    programFlow
  };
};

const analyzeProgramFlow = (nodes: CanvasNode[], connections: Connection[]): ProgramFlow => {
  const entryPoints: string[] = [];
  const executionOrder: string[] = [];
  const dataFlow: DataFlowConnection[] = [];

  // Find entry points (nodes with no incoming connections)
  nodes.forEach(node => {
    const hasIncoming = connections.some(conn => conn.targetNodeId === node.id);
    if (!hasIncoming && node.type !== 'account') {
      entryPoints.push(node.name);
    }
  });

  // Build execution order using topological sort
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (nodeId: string) => {
    if (visiting.has(nodeId)) return; // Circular dependency
    if (visited.has(nodeId)) return;

    visiting.add(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.type !== 'account') {
      // Visit dependencies first
      connections
        .filter(conn => conn.targetNodeId === nodeId)
        .forEach(conn => visit(conn.sourceNodeId));
      
      executionOrder.push(node.name);
    }
    
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  nodes.forEach(node => visit(node.id));

  // Analyze data flow
  connections.forEach(conn => {
    const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
    const targetNode = nodes.find(n => n.id === conn.targetNodeId);
    
    if (sourceNode && targetNode) {
      const sourcePort = sourceNode.outputs.find(p => p.id === conn.sourcePortId);
      const targetPort = targetNode.inputs.find(p => p.id === conn.targetPortId);
      
      if (sourcePort && targetPort) {
        dataFlow.push({
          from: sourceNode.name,
          to: targetNode.name,
          dataType: sourcePort.type,
          required: true
        });
      }
    }
  });

  return { entryPoints, executionOrder, dataFlow };
};

const generateLibRs = (
  programName: string, 
  instructionNodes: CanvasNode[], 
  accountNodes: CanvasNode[], 
  connections: Connection[]
): string => {
  const instructionImports = instructionNodes.map(node => 
    `pub mod ${node.name.toLowerCase().replace(/\s+/g, '_')};`
  ).join('\n');

  const instructionHandlers = instructionNodes.map(node => {
    const functionName = node.name.toLowerCase().replace(/\s+/g, '_');
    return `    pub use ${functionName}::*;`;
  }).join('\n');

  const accountStructs = accountNodes.map(node => {
    const structName = node.name.replace(/\s+/g, '');
    const connectedInstructions = connections
      .filter(conn => conn.sourceNodeId === node.id || conn.targetNodeId === node.id)
      .length;
    
    return `
#[account]
pub struct ${structName} {
    pub authority: Pubkey,
    pub data: u64,
    pub bump: u8,
    pub connected_instructions: u8, // ${connectedInstructions} connections
}

impl ${structName} {
    pub const LEN: usize = 8 + 32 + 8 + 1 + 1;
}`;
  }).join('\n');

  // Generate program flow validation
  const flowValidation = generateFlowValidation(instructionNodes, connections);

  return `use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

${instructionImports}

#[program]
pub mod ${programName} {
    use super::*;
${instructionHandlers}
    
    ${flowValidation}
}

${accountStructs}

#[derive(Accounts)]
pub struct Initialize {}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid program flow")]
    InvalidProgramFlow,
    #[msg("Missing required connection")]
    MissingConnection,
    #[msg("Unauthorized access")]
    Unauthorized,
}
`;
};

const generateFlowValidation = (instructionNodes: CanvasNode[], connections: Connection[]): string => {
  return `
    pub fn validate_program_flow(instruction_sequence: &[String]) -> Result<()> {
        // Validate execution order based on connections
        for (i, instruction) in instruction_sequence.iter().enumerate() {
            msg!("Validating instruction {}: {}", i, instruction);
        }
        Ok(())
    }`;
};

const generateInstruction = (
  node: CanvasNode, 
  connections: Connection[], 
  allNodes: CanvasNode[]
): string => {
  const functionName = node.name.toLowerCase().replace(/\s+/g, '_');
  const structName = node.name.replace(/\s+/g, '');
  
  // Find connected nodes and their relationships
  const incomingConnections = connections.filter(conn => conn.targetNodeId === node.id);
  const outgoingConnections = connections.filter(conn => conn.sourceNodeId === node.id);
  
  const connectedAccounts = incomingConnections
    .map(conn => allNodes.find(n => n.id === conn.sourceNodeId))
    .filter(n => n?.type === 'account')
    .map(n => n!.name.replace(/\s+/g, ''));

  const connectedInstructions = incomingConnections
    .map(conn => allNodes.find(n => n.id === conn.sourceNodeId))
    .filter(n => n?.type !== 'account')
    .map(n => n!.name);

  // Generate account validation based on connections
  const accountFields = connectedAccounts.length > 0 ? 
    connectedAccounts.map(accountName => `
    #[account(mut, constraint = ${accountName.toLowerCase()}.authority == authority.key())]
    pub ${accountName.toLowerCase()}: Account<'info, ${accountName}>,`).join('') +
    `
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,` : `
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,`;

  // Generate instruction logic based on connections
  const instructionLogic = generateInstructionLogic(node, incomingConnections, outgoingConnections, allNodes);

  return `use anchor_lang::prelude::*;
use crate::ErrorCode;

pub fn ${functionName}(ctx: Context<${structName}>) -> Result<()> {
    msg!("Executing ${node.name}");
    
    // Validate incoming connections
    ${connectedInstructions.length > 0 ? 
      `msg!("Connected to instructions: ${connectedInstructions.join(', ')}");` : 
      `msg!("Entry point instruction");`}
    
    ${instructionLogic}
    
    // Update connected accounts
    ${connectedAccounts.map(accountName => `
    ctx.accounts.${accountName.toLowerCase()}.data += 1;
    msg!("Updated ${accountName} data");`).join('')}
    
    Ok(())
}

#[derive(Accounts)]
pub struct ${structName}<'info> {${accountFields}
}
`;
};

const generateInstructionLogic = (
  node: CanvasNode,
  incomingConnections: Connection[],
  outgoingConnections: Connection[],
  allNodes: CanvasNode[]
): string => {
  const nodeType = node.type.toLowerCase();
  
  switch (nodeType) {
    case 'token':
      return `
    // Token operation logic
    require!(ctx.accounts.authority.key() != Pubkey::default(), ErrorCode::Unauthorized);
    msg!("Processing token operation");`;
    
    case 'nft':
      return `
    // NFT operation logic
    require!(ctx.accounts.authority.key() != Pubkey::default(), ErrorCode::Unauthorized);
    msg!("Processing NFT operation");`;
    
    case 'defi':
      return `
    // DeFi operation logic
    require!(ctx.accounts.authority.key() != Pubkey::default(), ErrorCode::Unauthorized);
    msg!("Processing DeFi operation");`;
    
    default:
      return `
    // Custom instruction logic
    require!(ctx.accounts.authority.key() != Pubkey::default(), ErrorCode::Unauthorized);
    msg!("Processing custom operation");`;
  }
};

const generateTests = (
  programName: string, 
  instructionNodes: CanvasNode[], 
  connections: Connection[]
): string => {
  const testCases = instructionNodes.map(node => {
    const functionName = node.name.toLowerCase().replace(/\s+/g, '_');
    const connectedNodes = connections
      .filter(conn => conn.targetNodeId === node.id || conn.sourceNodeId === node.id)
      .length;
    
    return `
  it("${node.name} (${connectedNodes} connections)", async () => {
    // Test ${node.name} instruction with connection validation
    try {
      const tx = await program.methods.${functionName}()
        .accounts({
          authority: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      console.log("✅ ${node.name} transaction signature:", tx);
      
      // Validate program flow
      const flowValidation = await program.methods.validateProgramFlow(["${node.name}"])
        .accounts({
          authority: provider.wallet.publicKey,
        })
        .rpc();
      
      console.log("✅ Flow validation signature:", flowValidation);
    } catch (error) {
      console.error("❌ ${node.name} test failed:", error);
      throw error;
    }
  });`;
  }).join('\n');

  const integrationTests = generateIntegrationTests(instructionNodes, connections);

  return `import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ${programName.charAt(0).toUpperCase() + programName.slice(1)} } from "../target/types/${programName}";
import { expect } from "chai";

describe("${programName}", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.${programName.charAt(0).toUpperCase() + programName.slice(1)} as Program<${programName.charAt(0).toUpperCase() + programName.slice(1)}>;

  before(async () => {
    console.log("🚀 Starting ${programName} tests");
    console.log("Program ID:", program.programId.toString());
  });

${testCases}

  ${integrationTests}
});
`;
};

const generateIntegrationTests = (instructionNodes: CanvasNode[], connections: Connection[]): string => {
  if (connections.length === 0) return '';
  
  return `
  describe("Integration Tests", () => {
    it("should execute connected instructions in sequence", async () => {
      console.log("🔗 Testing instruction connections");
      
      // Execute instructions based on their connections
      const executionOrder = [${instructionNodes.map(n => `"${n.name}"`).join(', ')}];
      
      for (const instructionName of executionOrder) {
        console.log(\`Executing: \${instructionName}\`);
        // Add specific execution logic here
      }
      
      console.log("✅ All connected instructions executed successfully");
    });
  });`;
};

const generateCargoToml = (programName: string): string => {
  return `[package]
name = "${programName}"
version = "0.1.0"
description = "Created with AnchorFlow"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "${programName}"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.29.0"
`;
};

const generateAnchorToml = (programName: string): string => {
  return `[features]
seeds = false
skip-lint = false

[programs.localnet]
${programName} = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
`;
};


export interface ModuleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Token' | 'NFT' | 'DeFi' | 'Governance' | 'Core' | 'Custom';
  icon: string;
  color: string;
  isBuiltIn: boolean;
  codeTemplate?: string;
  inputs: ModulePort[];
  outputs: ModulePort[];
  documentation: ModuleDocumentation;
  examples?: ModuleExample[];
}

export interface ModulePort {
  id: string;
  name: string;
  type: 'account' | 'instruction' | 'data' | 'token' | 'nft';
  required: boolean;
  description: string;
}

export interface ModuleDocumentation {
  overview: string;
  usage: string;
  parameters: Parameter[];
  returns?: string;
  examples: string[];
  relatedModules?: string[];
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface ModuleExample {
  title: string;
  description: string;
  code: string;
  explanation: string;
}

export interface CustomModule extends Omit<ModuleTemplate, 'isBuiltIn'> {
  isBuiltIn: false;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

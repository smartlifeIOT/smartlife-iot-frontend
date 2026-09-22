export interface AssetProfileFormData {
  name: string;
  description?: string;
  defaultRuleChain?: string;
  defaultQueueName?: string;
  defaultEdgeRuleChain?: string;
  assetProfileImage?: File | string;
}

export const DEFAULT_ASSET_PROFILE_FORM_DATA: AssetProfileFormData = {
  name: '',
  description: '',
  defaultRuleChain: '',
  defaultQueueName: '',
  defaultEdgeRuleChain: '',
  assetProfileImage: undefined,
};

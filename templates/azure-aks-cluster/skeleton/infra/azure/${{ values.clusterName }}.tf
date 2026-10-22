# requested through the portal, don't hand-edit - raise a new request instead
module "${{ values.clusterName }}" {
  source = "git::https://github.com/efekaya-devops/terraform-modules.git//modules/aks-cluster?ref=main"

  name         = "${{ values.clusterName }}"
  location     = "${{ values.location }}"
  environment  = "${{ values.environment }}"
  sku_tier     = "${{ values.skuTier }}"
  node_vm_size = "${{ values.nodeVmSize }}"
  node_count   = ${{ values.nodeCount }}
}

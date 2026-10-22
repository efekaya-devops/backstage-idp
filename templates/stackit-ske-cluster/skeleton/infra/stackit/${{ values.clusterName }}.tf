# requested through the portal, don't hand-edit - raise a new request instead
module "${{ values.clusterName }}" {
  source = "git::https://github.com/efekaya-devops/terraform-modules.git//modules/stackit-ske?ref=main"

  project_id = "${{ values.projectId }}"
  name       = "${{ values.clusterName }}"
  region     = "eu01"
{%- if values.kubernetesVersion %}

  kubernetes_version_min = "${{ values.kubernetesVersion }}"
{%- endif %}

  node_pools = [{
    name               = "default"
    machine_type       = "${{ values.machineType }}"
    minimum            = ${{ values.minNodes }}
    maximum            = ${{ values.maxNodes }}
    availability_zones = ["${{ values.availabilityZone }}"]
  }]
{%- if values.aclCidrs and values.aclCidrs.length %}

  acl_allowed_cidrs = [{% for c in values.aclCidrs %}"${{ c }}"{% if not loop.last %}, {% endif %}{% endfor %}]
{%- endif %}
}
